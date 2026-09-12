from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models.work_session import WorkSession


router = APIRouter(
    prefix="/work",
    tags=["Work Sessions"]
)


# ================= START WORK =================

@router.post("/start/{employee_id}")
def start_work(
    employee_id: int,
    db: Session = Depends(get_db)
):

    active_session = db.query(WorkSession).filter(
        WorkSession.employee_id == employee_id,
        WorkSession.status == "Working"
    ).first()

    if active_session:

        raise HTTPException(
            status_code=400,
            detail="Employee already has an active work session"
        )


    session = WorkSession(
        employee_id=employee_id,
        start_time=datetime.utcnow(),
        status="Working"
    )

    db.add(session)

    db.commit()

    db.refresh(session)


    return {
        "message": "Work started successfully",
        "session_id": session.id,
        "employee_id": session.employee_id,
        "start_time": session.start_time,
        "status": session.status
    }


# ================= END WORK =================

@router.post("/end/{session_id}")
def end_work(
    session_id: int,
    db: Session = Depends(get_db)
):

    session = db.query(WorkSession).filter(
        WorkSession.id == session_id
    ).first()


    if not session:

        raise HTTPException(
            status_code=404,
            detail="Work session not found"
        )


    if session.status == "Completed":

        raise HTTPException(
            status_code=400,
            detail="Work session already completed"
        )


    session.end_time = datetime.utcnow()

    session.status = "Completed"


    duration = (
        session.end_time -
        session.start_time
    ).total_seconds() / 60


    session.total_work_minutes = int(
        duration
    )


    db.commit()

    db.refresh(session)


    return {
        "message": "Work session completed",
        "session_id": session.id,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "total_work_minutes":
            session.total_work_minutes,
        "status": session.status
    }


# ================= CURRENT SESSION =================

@router.get("/current/{employee_id}")
def current_session(
    employee_id: int,
    db: Session = Depends(get_db)
):

    session = db.query(WorkSession).filter(
        WorkSession.employee_id == employee_id,
        WorkSession.status == "Working"
    ).first()


    if not session:

        return {
            "message": "No active work session",
            "active": False
        }


    return {
        "active": True,
        "session_id": session.id,
        "employee_id": session.employee_id,
        "start_time": session.start_time,
        "status": session.status
    }
# ================= WORK HISTORY =================

@router.get("/history/{employee_id}")
def work_history(
    employee_id: int,
    db: Session = Depends(get_db)
):

    sessions = db.query(WorkSession).filter(
        WorkSession.employee_id == employee_id
    ).order_by(
        WorkSession.start_time.desc()
    ).all()

    return [
        {
            "session_id": session.id,
            "employee_id": session.employee_id,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "total_work_minutes": session.total_work_minutes or 0,
            "status": session.status
        }
        for session in sessions
    ]