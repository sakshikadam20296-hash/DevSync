from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from database import Base
from datetime import date, datetime


class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    work_date = Column(
        Date,
        default=date.today,
        nullable=False
    )

    tasks_completed = Column(
        Integer,
        default=0
    )

    total_work_minutes = Column(
        Integer,
        default=0
    )

    break_minutes = Column(
        Integer,
        default=0
    )

    productivity = Column(
        Integer,
        default=0
    )

    notes = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )