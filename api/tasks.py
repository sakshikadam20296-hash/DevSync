from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models.task import Task


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


# =========================
# REQUEST MODELS
# =========================

class TaskCreate(BaseModel):

    employee_id: int
    title: str
    description: str = ""
    priority: str = "Medium"


class TaskUpdate(BaseModel):

    title: str | None = None
    description: str | None = None
    priority: str | None = None
    status: str | None = None


# =========================
# CREATE TASK
# =========================

@router.post("/")
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db)
):

    new_task = Task(
        employee_id=task_data.employee_id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        status="Pending",
        created_at=datetime.utcnow()
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task created successfully",
        "task": {
            "id": new_task.id,
            "employee_id": new_task.employee_id,
            "title": new_task.title,
            "description": new_task.description,
            "priority": new_task.priority,
            "status": new_task.status,
            "created_at": new_task.created_at
        }
    }


# =========================
# GET SINGLE TASK
# =========================

@router.get("/id/{task_id}")
def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return {
        "id": task.id,
        "employee_id": task.employee_id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "status": task.status,
        "created_at": task.created_at,
        "completed_at": task.completed_at
    }


# =========================
# GET EMPLOYEE TASKS
# =========================

@router.get("/employee/{employee_id}")
def get_tasks(
    employee_id: int,
    db: Session = Depends(get_db)
):

    tasks = db.query(Task).filter(
        Task.employee_id == employee_id
    ).order_by(
        Task.id.desc()
    ).all()

    result = []

    for task in tasks:

        result.append({
            "id": task.id,
            "employee_id": task.employee_id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "status": task.status,
            "created_at": task.created_at,
            "completed_at": task.completed_at
        })

    return {
        "employee_id": employee_id,
        "total_tasks": len(result),
        "tasks": result
    }


# =========================
# UPDATE TASK
# =========================

@router.put("/{task_id}")
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db)
):

    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if task_data.title is not None:
        task.title = task_data.title

    if task_data.description is not None:
        task.description = task_data.description

    if task_data.priority is not None:
        task.priority = task_data.priority

    if task_data.status is not None:

        task.status = task_data.status

        if task_data.status == "Completed":
            task.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(task)

    return {
        "message": "Task updated successfully",
        "task_id": task.id,
        "status": task.status
    }


# =========================
# DELETE TASK
# =========================

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully",
        "task_id": task_id
    }