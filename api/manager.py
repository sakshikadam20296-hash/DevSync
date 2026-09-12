from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.task import Task
from models.work_session import WorkSession
from models.daily_log import DailyLog

router = APIRouter(
    prefix="/manager",
    tags=["Manager Dashboard"]
)


@router.get("/dashboard")
def manager_dashboard(
    db: Session = Depends(get_db)
):
    employees = db.query(User).all()
    employee_data = []

    for employee in employees:

        # ---------------- TASKS ----------------
        tasks = db.query(Task).filter(
            Task.employee_id == employee.id
        ).all()

        total_tasks = len(tasks)

        completed_tasks = len([
            task for task in tasks
            if task.status == "Completed"
        ])

        in_progress_tasks = len([
            task for task in tasks
            if task.status == "In Progress"
        ])

        pending_tasks = len([
            task for task in tasks
            if task.status == "Pending"
        ])

        # ---------------- WORK SESSIONS ----------------
        sessions = db.query(WorkSession).filter(
            WorkSession.employee_id == employee.id
        ).all()

        total_work_minutes = sum(
            session.total_work_minutes or 0
            for session in sessions
        )

        # ---------------- DAILY LOG ----------------
        logs = db.query(DailyLog).filter(
            DailyLog.employee_id == employee.id
        ).all()

        productivity_values = [
            log.productivity or 0
            for log in logs
        ]

        if productivity_values:
            productivity = round(
                sum(productivity_values)
                / len(productivity_values)
            )
        else:
            productivity = 0

        # Convert minutes to hours/minutes
        hours = total_work_minutes // 60
        minutes = total_work_minutes % 60

        employee_data.append({
            "employee_id": employee.id,
            "username": employee.username,
            "email": employee.email,

            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "pending_tasks": pending_tasks,

            "total_work_minutes": total_work_minutes,
            "working_hours": f"{hours}h {minutes}m",

            "productivity": productivity
        })

    # ---------------- OVERALL TOTALS ----------------

    total_employees = len(employee_data)

    total_tasks = sum(
        employee["total_tasks"]
        for employee in employee_data
    )

    total_completed_tasks = sum(
        employee["completed_tasks"]
        for employee in employee_data
    )

    total_in_progress_tasks = sum(
        employee["in_progress_tasks"]
        for employee in employee_data
    )

    total_pending_tasks = sum(
        employee["pending_tasks"]
        for employee in employee_data
    )

    total_work_minutes = sum(
        employee["total_work_minutes"]
        for employee in employee_data
    )

    if total_employees > 0:
        average_productivity = round(
            sum(
                employee["productivity"]
                for employee in employee_data
            ) / total_employees
        )
    else:
        average_productivity = 0

    total_hours = total_work_minutes // 60
    remaining_minutes = total_work_minutes % 60

    return {
        "dashboard": {
            "total_employees": total_employees,
            "total_tasks": total_tasks,
            "completed_tasks": total_completed_tasks,
            "in_progress_tasks": total_in_progress_tasks,
            "pending_tasks": total_pending_tasks,
            "total_work_minutes": total_work_minutes,
            "working_hours": f"{total_hours}h {remaining_minutes}m",
            "average_productivity": average_productivity
        },

        "employees": employee_data
    }