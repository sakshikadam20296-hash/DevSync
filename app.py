from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import Base, engine


# =========================
# MODELS
# =========================

from models.user import User
from models.work_session import WorkSession
from models.task import Task
from models.daily_log import DailyLog
from models.notification import Notification


# =========================
# API ROUTERS
# =========================

from api.auth import router as auth_router
from api.work_sessions import router as work_router
from api.tasks import router as task_router
from api.daily_log import router as daily_log_router
from api.manager import router as manager_router
from api.notifications import router as notification_router

from users.routes import router as user_router


# =========================
# CREATE DATABASE TABLES
# =========================

Base.metadata.create_all(bind=engine)


# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title="DevSync",
    description="Employee Work Monitoring and Productivity System",
    version="1.0.0"
)


# =========================
# FRONTEND PATH
# =========================

BASE_DIR = Path(__file__).resolve().parent

FRONTEND_DIR = BASE_DIR / "frontend"


# =========================
# STATIC FILES
# =========================

app.mount(
    "/static",
    StaticFiles(directory=str(FRONTEND_DIR)),
    name="static"
)


# =========================
# API ROUTERS
# =========================

app.include_router(auth_router)

app.include_router(user_router)

app.include_router(work_router)

app.include_router(task_router)

app.include_router(daily_log_router)

app.include_router(manager_router)

app.include_router(notification_router)


# =========================
# FRONTEND PAGES
# =========================

@app.get("/")
def home():
    return FileResponse(
        str(FRONTEND_DIR / "index.html")
    )


@app.get("/dashboard")
def dashboard():
    return FileResponse(
        str(FRONTEND_DIR / "dashboard.html")
    )


@app.get("/tasks")
def tasks():
    return FileResponse(
        str(FRONTEND_DIR / "tasks.html")
    )


@app.get("/work-sessions")
def work_sessions():
    return FileResponse(
        str(FRONTEND_DIR / "work-sessions.html")
    )


@app.get("/daily-log")
def daily_log():
    return FileResponse(
        str(FRONTEND_DIR / "daily-log.html")
    )


@app.get("/productivity")
def productivity():
    return FileResponse(
        str(FRONTEND_DIR / "productivity.html")
    )


@app.get("/notifications")
def notifications():
    return FileResponse(
        str(FRONTEND_DIR / "notifications.html")
    )


@app.get("/settings")
def settings():
    return FileResponse(
        str(FRONTEND_DIR / "settings.html")
    )


# =========================
# MANAGER DASHBOARD PAGE
# =========================

@app.get("/manager")
def manager():
    return FileResponse(
        str(FRONTEND_DIR / "manager.html")
    )


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DevSync Backend"
    }


# =========================
# TEST ENDPOINT
# =========================

@app.get("/test")
def test():
    return {
        "message": "DevSync Test Endpoint Working!",
        "status": "success",
        "authentication": "Available",
        "users_api": "Available",
        "work_sessions_api": "Available",
        "tasks_api": "Available",
        "daily_work_log_api": "Available",
        "manager_dashboard_api": "Available",
        "notifications_api": "Available"
    }


# =========================
# API INFORMATION
# =========================

@app.get("/api-info")
def api_info():
    return {
        "project": "DevSync",
        "description": "Employee Work Monitoring and Productivity System",
        "version": "1.0.0",
        "modules": [
            "Authentication",
            "Employee Dashboard",
            "My Tasks",
            "Work Sessions",
            "Daily Work Log",
            "Productivity Analytics",
            "Manager Dashboard",
            "Reports",
            "Notifications",
            "Settings",
            "AI Productivity Assistant"
        ],
        "status": "Development"
    }