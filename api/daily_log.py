from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date, datetime

from database import get_db
from models.daily_log import DailyLog


router = APIRouter(
    prefix="/daily-logs",
    tags=["Daily Work Log"]
)


class DailyLogCreate(BaseModel):
    employee_id: int
    work_date: date
    tasks_completed: int = 0
    total_work_minutes: int = 0
    break_minutes: int = 0
    productivity: int = 0
    notes: str = ""


class DailyLogUpdate(BaseModel):
    tasks_completed: int | None = None
    total_work_minutes: int | None = None
    break_minutes: int | None = None
    productivity: int | None = None
    notes: str | None = None


@router.post("/")
def create_daily_log(
    log_data: DailyLogCreate,
    db: Session = Depends(get_db)
):
    new_log = DailyLog(
        employee_id=log_data.employee_id,
        work_date=log_data.work_date,
        tasks_completed=log_data.tasks_completed,
        total_work_minutes=log_data.total_work_minutes,
        break_minutes=log_data.break_minutes,
        productivity=log_data.productivity,
        notes=log_data.notes
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return {
        "message": "Daily work log created successfully",
        "log": {
            "id": new_log.id,
            "employee_id": new_log.employee_id,
            "work_date": new_log.work_date,
            "tasks_completed": new_log.tasks_completed,
            "total_work_minutes": new_log.total_work_minutes,
            "break_minutes": new_log.break_minutes,
            "productivity": new_log.productivity,
            "notes": new_log.notes,
            "created_at": new_log.created_at
        }
    }


@router.get("/employee/{employee_id}")
def get_employee_logs(
    employee_id: int,
    db: Session = Depends(get_db)
):
    logs = db.query(DailyLog).filter(
        DailyLog.employee_id == employee_id
    ).order_by(
        DailyLog.work_date.desc()
    ).all()

    result = []

    for log in logs:
        result.append({
            "id": log.id,
            "employee_id": log.employee_id,
            "work_date": log.work_date,
            "tasks_completed": log.tasks_completed,
            "total_work_minutes": log.total_work_minutes,
            "break_minutes": log.break_minutes,
            "productivity": log.productivity,
            "notes": log.notes,
            "created_at": log.created_at
        })

    return {
        "employee_id": employee_id,
        "total_logs": len(result),
        "logs": result
    }


@router.get("/{log_id}")
def get_daily_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.id == log_id
    ).first()

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Daily work log not found"
        )

    return {
        "id": log.id,
        "employee_id": log.employee_id,
        "work_date": log.work_date,
        "tasks_completed": log.tasks_completed,
        "total_work_minutes": log.total_work_minutes,
        "break_minutes": log.break_minutes,
        "productivity": log.productivity,
        "notes": log.notes,
        "created_at": log.created_at
    }


@router.put("/{log_id}")
def update_daily_log(
    log_id: int,
    log_data: DailyLogUpdate,
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.id == log_id
    ).first()

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Daily work log not found"
        )

    if log_data.tasks_completed is not None:
        log.tasks_completed = log_data.tasks_completed

    if log_data.total_work_minutes is not None:
        log.total_work_minutes = log_data.total_work_minutes

    if log_data.break_minutes is not None:
        log.break_minutes = log_data.break_minutes

    if log_data.productivity is not None:
        log.productivity = log_data.productivity

    if log_data.notes is not None:
        log.notes = log_data.notes

    db.commit()
    db.refresh(log)

    return {
        "message": "Daily work log updated successfully",
        "log_id": log.id
    }


@router.delete("/{log_id}")
def delete_daily_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.id == log_id
    ).first()

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Daily work log not found"
        )

    db.delete(log)
    db.commit()

    return {
        "message": "Daily work log deleted successfully",
        "log_id": log_id
    }