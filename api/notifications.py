from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.notification import Notification


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =====================================================
# CREATE NOTIFICATION
# =====================================================

class NotificationCreate(BaseModel):

    employee_id: int

    type: str

    icon: str = "🔔"

    title: str

    message: str


@router.post("/")
def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db)
):

    notification = Notification(

        employee_id=notification_data.employee_id,

        type=notification_data.type,

        icon=notification_data.icon,

        title=notification_data.title,

        message=notification_data.message,

        is_read=False
    )

    db.add(notification)

    db.commit()

    db.refresh(notification)

    return {

        "message": "Notification created successfully",

        "notification": {

            "id": notification.id,

            "employee_id": notification.employee_id,

            "type": notification.type,

            "icon": notification.icon,

            "title": notification.title,

            "message": notification.message,

            "is_read": notification.is_read,

            "created_at": notification.created_at
        }
    }


# =====================================================
# GET EMPLOYEE NOTIFICATIONS
# =====================================================

@router.get("/employee/{employee_id}")
def get_notifications(
    employee_id: int,
    db: Session = Depends(get_db)
):

    notifications = db.query(
        Notification
    ).filter(
        Notification.employee_id == employee_id
    ).order_by(
        Notification.created_at.desc()
    ).all()

    return {

        "employee_id": employee_id,

        "total": len(notifications),

        "unread_count": sum(
            1
            for notification in notifications
            if not notification.is_read
        ),

        "notifications": [

            {

                "id": notification.id,

                "employee_id": notification.employee_id,

                "type": notification.type,

                "icon": notification.icon,

                "title": notification.title,

                "message": notification.message,

                "is_read": notification.is_read,

                "created_at": notification.created_at
            }

            for notification in notifications
        ]
    }


# =====================================================
# MARK SINGLE NOTIFICATION AS READ
# =====================================================

@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db)
):

    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id
    ).first()


    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )


    notification.is_read = True

    db.commit()

    db.refresh(notification)


    return {

        "message": "Notification marked as read",

        "notification_id":
            notification.id,

        "is_read":
            notification.is_read
    }


# =====================================================
# MARK ALL NOTIFICATIONS AS READ
# =====================================================

@router.put("/employee/{employee_id}/read-all")
def mark_all_notifications_read(
    employee_id: int,
    db: Session = Depends(get_db)
):

    notifications = db.query(
        Notification
    ).filter(
        Notification.employee_id == employee_id,
        Notification.is_read == False
    ).all()


    for notification in notifications:

        notification.is_read = True


    db.commit()


    return {

        "message":
            "All notifications marked as read",

        "employee_id":
            employee_id,

        "updated_count":
            len(notifications)
    }