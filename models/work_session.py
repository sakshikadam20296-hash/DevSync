from sqlalchemy import Column, Integer, DateTime, String
from database import Base
from datetime import datetime


class WorkSession(Base):

    __tablename__ = "work_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    employee_id = Column(
        Integer,
        nullable=False
    )

    start_time = Column(
        DateTime,
        default=datetime.utcnow
    )

    end_time = Column(
        DateTime,
        nullable=True
    )

    break_minutes = Column(
        Integer,
        default=0
    )

    total_work_minutes = Column(
        Integer,
        default=0
    )

    status = Column(
        String(30),
        default="Working"
    )