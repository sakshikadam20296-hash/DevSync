// =====================================================
// DevSync - Employee Dashboard
// Backend Connected Version
// =====================================================

const API_BASE = window.location.origin;

const token = localStorage.getItem("devsync_token");

const username =
    localStorage.getItem("devsync_username") || "Employee";


// =====================================================
// LOGIN CHECK
// =====================================================

if (!token) {
    alert("Please login first.");
    window.location.href = "/";
}


// =====================================================
// GET EMPLOYEE ID FROM JWT
// =====================================================

function getEmployeeId() {

    try {

        const payload = token.split(".")[1];

        const decoded = JSON.parse(
            atob(
                payload
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        return Number(decoded.sub);

    } catch (error) {

        console.error("Token decode error:", error);

        return null;
    }
}


const EMPLOYEE_ID = getEmployeeId();


// =====================================================
// DATA
// =====================================================

let tasks = [];

let sessions = [];


// =====================================================
// TIMER
// =====================================================

let dashboardTimer = null;


// =====================================================
// BREAK
// =====================================================

let isOnBreak = false;

let breakStartTime = null;

let totalBreakSeconds = 0;


// =====================================================
// USER
// =====================================================

function loadUser() {

    const usernameElement =
        document.getElementById("username");

    const avatarElement =
        document.getElementById("avatar");


    if (usernameElement) {

        usernameElement.innerText =
            username;

    }


    if (avatarElement) {

        avatarElement.innerText =
            username
                .charAt(0)
                .toUpperCase();

    }

}


// =====================================================
// LOAD TASKS
// =====================================================

async function loadTasks() {

    try {

        const response = await fetch(
            `${API_BASE}/tasks/employee/${EMPLOYEE_ID}`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load tasks"
            );

        }


        const data =
            await response.json();


        tasks =
            data.tasks || [];


        renderTasks();

        updateTaskStatistics();

    } catch (error) {

        console.error(
            "Task loading error:",
            error
        );

    }

}


// =====================================================
// RENDER TASKS
// =====================================================

function renderTasks() {

    const taskList =
        document.getElementById("taskList");


    if (!taskList) {
        return;
    }


    taskList.innerHTML = "";


    if (tasks.length === 0) {

        taskList.innerHTML = `

            <div class="task">

                <div class="task-info">

                    <strong>
                        No tasks assigned
                    </strong>

                    <span>
                        Add a new task to get started.
                    </span>

                </div>

            </div>

        `;

        return;
    }


    tasks.forEach(task => {

        const taskElement =
            document.createElement("div");


        taskElement.className =
            "task";


        if (task.status === "Completed") {

            taskElement.classList.add(
                "completed"
            );

        }


        const checked =
            task.status === "Completed"
                ? "checked"
                : "";


        const priority =
            task.priority || "Medium";


        taskElement.innerHTML = `

            <input
                type="checkbox"
                ${checked}
                onchange="completeTask(${task.id}, this)"
            >

            <div class="task-info">

                <strong>
                    ${escapeHTML(
                        task.title || "Untitled Task"
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        task.description || "Task"
                    )}
                </span>

            </div>

            <div class="priority ${priority.toLowerCase()}">

                ${escapeHTML(priority)}

            </div>

        `;


        taskList.appendChild(
            taskElement
        );

    });

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =====================================================
// TASK STATISTICS
// =====================================================

function updateTaskStatistics() {

    const totalTasks =
        tasks.length;


    const completedTasks =
        tasks.filter(
            task =>
                task.status === "Completed"
        ).length;


    const taskStat =
        document.getElementById(
            "taskStat"
        );


    if (taskStat) {

        taskStat.innerText =
            `${completedTasks} / ${totalTasks}`;

    }


    const summaryTasks =
        document.getElementById(
            "summaryTasks"
        );


    if (summaryTasks) {

        summaryTasks.innerText =
            completedTasks;

    }

}


// =====================================================
// COMPLETE / UNCOMPLETE TASK
// =====================================================

async function completeTask(
    taskId,
    checkbox
) {

    try {

        const newStatus =
            checkbox.checked
                ? "Completed"
                : "Pending";


        const response =
            await fetch(
                `${API_BASE}/tasks/${taskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to update task."
            );


            checkbox.checked =
                !checkbox.checked;


            return;

        }


        await loadTasks();

        await loadProductivity();


    } catch (error) {

        console.error(
            "Task update error:",
            error
        );


        alert(
            "Backend connection failed."
        );

    }

}


// =====================================================
// ADD TASK
// =====================================================

async function addTask() {

    const taskName =
        prompt(
            "Enter new task name:"
        );


    if (
        !taskName ||
        !taskName.trim()
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/tasks/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        employee_id:
                            EMPLOYEE_ID,

                        title:
                            taskName.trim(),

                        description:
                            "Dashboard task",

                        priority:
                            "Low"

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to create task."
            );

            return;

        }


        await loadTasks();

        await loadProductivity();


        alert(
            "Task added successfully!"
        );


    } catch (error) {

        console.error(
            "Add task error:",
            error
        );


        alert(
            "Backend connection failed."
        );

    }

}


// =====================================================
// LOAD WORK SESSIONS
// =====================================================

async function loadWorkSessions() {

    try {

        const response =
            await fetch(
                `${API_BASE}/work/history/${EMPLOYEE_ID}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load work sessions"
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            sessions = data;

        } else {

            sessions = [];

        }


        updateWorkStatistics();

        await updateCurrentSession();


    } catch (error) {

        console.error(
            "Work session error:",
            error
        );

    }

}


// =====================================================
// TODAY WORK STATISTICS
// =====================================================

function getTodayWorkMinutes() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    let totalMinutes = 0;


    sessions.forEach(session => {

        if (!session.start_time) {
            return;
        }


        const sessionDate =
            new Date(
                session.start_time
            )
            .toISOString()
            .split("T")[0];


        if (
            sessionDate === today
        ) {

            totalMinutes +=
                session.total_work_minutes || 0;

        }

    });


    return totalMinutes;

}


// =====================================================
// UPDATE WORK STATISTICS
// =====================================================

function updateWorkStatistics() {

    const totalMinutes =
        getTodayWorkMinutes();


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    const formattedTime =
        `${hours}h ${String(minutes).padStart(2, "0")}m`;


    const hoursStat =
        document.getElementById(
            "hoursStat"
        );


    if (hoursStat) {

        hoursStat.innerText =
            formattedTime;

    }


    const focusTime =
        document.getElementById(
            "focusTime"
        );


    if (focusTime) {

        focusTime.innerText =
            formattedTime;

    }


    const summaryHours =
        document.getElementById(
            "summaryHours"
        );


    if (summaryHours) {

        summaryHours.innerText =
            `${hours}h`;

    }

}


// =====================================================
// CURRENT SESSION
// =====================================================

async function updateCurrentSession() {

    try {

        const response =
            await fetch(
                `${API_BASE}/work/current/${EMPLOYEE_ID}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to check current session"
            );

        }


        const data =
            await response.json();


        const workStatus =
            document.getElementById(
                "workStatus"
            );


        const statusMessage =
            document.getElementById(
                "statusMessage"
            );


        const startBtn =
            document.getElementById(
                "startBtn"
            );


        const breakBtn =
            document.getElementById(
                "breakBtn"
            );


        const endBtn =
            document.getElementById(
                "endBtn"
            );


        if (data.active) {

            if (workStatus) {

                workStatus.innerText =
                    "Working";

            }


            if (statusMessage) {

                statusMessage.innerText =
                    "Your work session is currently active.";

            }


            if (startBtn) {

                startBtn.disabled = true;

            }


            if (breakBtn) {

                breakBtn.disabled = false;

            }


            if (endBtn) {

                endBtn.disabled = false;

            }


            startDashboardTimer(
                data.start_time
            );


        } else {

            if (workStatus) {

                workStatus.innerText =
                    "Not Working";

            }


            if (statusMessage) {

                statusMessage.innerText =
                    "Start your work session to begin tracking.";

            }


            if (startBtn) {

                startBtn.disabled = false;

            }


            if (breakBtn) {

                breakBtn.disabled = true;

            }


            if (endBtn) {

                endBtn.disabled = true;

            }


            stopDashboardTimer();

        }


    } catch (error) {

        console.error(
            "Current session error:",
            error
        );

    }

}


// =====================================================
// START WORK
// =====================================================

async function startWork() {

    try {

        const response =
            await fetch(
                `${API_BASE}/work/start/${EMPLOYEE_ID}`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to start work."
            );

            return;

        }


        document.getElementById(
            "workStatus"
        ).innerText =
            "Working";


        document.getElementById(
            "statusMessage"
        ).innerText =
            "Your work session is currently active.";


        document.getElementById(
            "startBtn"
        ).disabled = true;


        document.getElementById(
            "breakBtn"
        ).disabled = false;


        document.getElementById(
            "endBtn"
        ).disabled = false;


        startDashboardTimer(
            data.start_time
        );


        await loadWorkSessions();


    } catch (error) {

        console.error(
            "Start work error:",
            error
        );


        alert(
            "Backend connection failed."
        );

    }

}


// =====================================================
// DASHBOARD TIMER
// =====================================================

function startDashboardTimer(
    startTime
) {

    stopDashboardTimer();


    const start =
        new Date(
            startTime
        ).getTime();


    function updateTimer() {

        const now =
            new Date().getTime();


        const elapsedSeconds =
            Math.max(
                0,
                Math.floor(
                    (now - start) / 1000
                )
            );


        const hours =
            Math.floor(
                elapsedSeconds / 3600
            );


        const minutes =
            Math.floor(
                (elapsedSeconds % 3600) / 60
            );


        const seconds =
            elapsedSeconds % 60;


        const timer =
            document.getElementById(
                "timer"
            );


        if (timer) {

            timer.innerText =
                `${String(hours).padStart(2, "0")}:` +
                `${String(minutes).padStart(2, "0")}:` +
                `${String(seconds).padStart(2, "0")}`;

        }

    }


    updateTimer();


    dashboardTimer =
        setInterval(
            updateTimer,
            1000
        );

}


// =====================================================
// STOP TIMER
// =====================================================

function stopDashboardTimer() {

    if (dashboardTimer) {

        clearInterval(
            dashboardTimer
        );

        dashboardTimer = null;

    }


    const timer =
        document.getElementById(
            "timer"
        );


    if (timer) {

        timer.innerText =
            "00:00:00";

    }

}


// =====================================================
// BREAK
// =====================================================

function toggleBreak() {

    if (!dashboardTimer) {

        return;

    }


    const breakBtn =
        document.getElementById(
            "breakBtn"
        );


    if (!isOnBreak) {

        isOnBreak = true;


        breakStartTime =
            new Date().getTime();


        document.getElementById(
            "workStatus"
        ).innerText =
            "On Break";


        document.getElementById(
            "statusMessage"
        ).innerText =
            "Break timer is running.";


        if (breakBtn) {

            breakBtn.innerText =
                "▶ Resume Work";

        }


    } else {

        const now =
            new Date().getTime();


        if (breakStartTime) {

            totalBreakSeconds +=
                Math.floor(
                    (
                        now -
                        breakStartTime
                    ) / 1000
                );

        }


        breakStartTime = null;

        isOnBreak = false;


        document.getElementById(
            "workStatus"
        ).innerText =
            "Working";


        document.getElementById(
            "statusMessage"
        ).innerText =
            "Your work session is currently active.";


        if (breakBtn) {

            breakBtn.innerText =
                "☕ Break";

        }


        updateBreakDisplay();

    }

}


// =====================================================
// BREAK DISPLAY
// =====================================================

function updateBreakDisplay() {

    let seconds =
        totalBreakSeconds;


    if (
        isOnBreak &&
        breakStartTime
    ) {

        seconds +=
            Math.floor(
                (
                    new Date().getTime() -
                    breakStartTime
                ) / 1000
            );

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const breakStat =
        document.getElementById(
            "breakStat"
        );


    const breakTime =
        document.getElementById(
            "breakTime"
        );


    if (breakStat) {

        breakStat.innerText =
            `${minutes}m`;

    }


    if (breakTime) {

        breakTime.innerText =
            `${minutes}m`;

    }

}


// =====================================================
// END WORK
// =====================================================

async function endWork() {

    try {

        const response =
            await fetch(
                `${API_BASE}/work/current/${EMPLOYEE_ID}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const current =
            await response.json();


        if (!current.active) {

            alert(
                "No active work session."
            );

            return;

        }


        // Finish active break locally

        if (
            isOnBreak &&
            breakStartTime
        ) {

            totalBreakSeconds +=
                Math.floor(
                    (
                        new Date().getTime() -
                        breakStartTime
                    ) / 1000
                );

        }


        isOnBreak = false;

        breakStartTime = null;


        const endResponse =
            await fetch(
                `${API_BASE}/work/end/${current.session_id}`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await endResponse.json();


        if (!endResponse.ok) {

            alert(
                data.detail ||
                "Unable to end work."
            );

            return;

        }


        stopDashboardTimer();


        document.getElementById(
            "workStatus"
        ).innerText =
            "Work Session Ended";


        document.getElementById(
            "statusMessage"
        ).innerText =
            "Today's work session has been recorded.";


        document.getElementById(
            "startBtn"
        ).disabled = false;


        document.getElementById(
            "breakBtn"
        ).disabled = true;


        document.getElementById(
            "endBtn"
        ).disabled = true;


        document.getElementById(
            "breakBtn"
        ).innerText =
            "☕ Break";


        updateBreakDisplay();


        await loadWorkSessions();

        await loadProductivity();


        alert(
            `Work session completed!\n\nTotal Work: ${data.total_work_minutes} minutes`
        );


    } catch (error) {

        console.error(
            "End work error:",
            error
        );


        alert(
            "Backend connection failed."
        );

    }

}


// =====================================================
// PRODUCTIVITY
// =====================================================

async function loadProductivity() {

    try {

        const totalTasks =
            tasks.length;


        const completedTasks =
            tasks.filter(
                task =>
                    task.status === "Completed"
            ).length;


        let productivity = 0;


        if (totalTasks > 0) {

            productivity =
                Math.round(
                    (
                        completedTasks /
                        totalTasks
                    ) * 100
                );

        }


        productivity =
            Math.min(
                100,
                productivity
            );


        // Productivity Stat

        const productivityStat =
            document.getElementById(
                "productivityStat"
            );


        if (productivityStat) {

            productivityStat.innerText =
                `${productivity}%`;

        }


        // Summary

        const summaryProductivity =
            document.getElementById(
                "summaryProductivity"
            );


        if (summaryProductivity) {

            summaryProductivity.innerText =
                `${productivity}%`;

        }


        // Circle

        const circle =
            document.getElementById(
                "productivityCircle"
            );


        if (circle) {

            const degree =
                productivity * 3.6;


            circle.style.background =
                `conic-gradient(
                    #4f46e5 ${degree}deg,
                    #e9ecf3 ${degree}deg
                )`;


            const circleText =
                circle.querySelector(
                    "strong"
                );


            if (circleText) {

                circleText.innerText =
                    `${productivity}%`;

            }

        }


    } catch (error) {

        console.error(
            "Productivity error:",
            error
        );

    }

}


// =====================================================
// SAVE DAILY WORK LOG
// =====================================================

async function saveLog() {

    const logElement =
        document.getElementById(
            "workLog"
        );


    const message =
        document.getElementById(
            "logMessage"
        );


    if (!logElement) {
        return;
    }


    const log =
        logElement.value.trim();


    if (!log) {

        if (message) {

            message.style.color =
                "#dc2626";

            message.innerText =
                "Please write something in your work log.";

        }

        return;

    }


    try {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        const completedTasks =
            tasks.filter(
                task =>
                    task.status === "Completed"
            ).length;


        const totalMinutes =
            getTodayWorkMinutes();


        const productivity =
            tasks.length > 0

                ? Math.round(
                    (
                        completedTasks /
                        tasks.length
                    ) * 100
                )

                : 0;


        const payload = {

            employee_id:
                EMPLOYEE_ID,

            work_date:
                today,

            tasks_completed:
                completedTasks,

            total_work_minutes:
                totalMinutes,

            break_minutes:
                Math.floor(
                    totalBreakSeconds / 60
                ),

            productivity:
                productivity,

            notes:
                JSON.stringify({
                    workSummary: log,
                    achievements: "",
                    challenges: "",
                    nextPlan: "",
                    workStatus:
                        productivity >= 80
                            ? "Excellent"
                            : productivity >= 60
                                ? "Good"
                                : productivity >= 40
                                    ? "Average"
                                    : "Difficult"
                })

        };


        const response =
            await fetch(
                `${API_BASE}/daily-logs/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(payload)

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (message) {

                message.style.color =
                    "#dc2626";

                message.innerText =
                    data.detail ||
                    "Unable to save daily log.";

            }

            return;

        }


        if (message) {

            message.style.color =
                "#16a34a";

            message.innerText =
                "✓ Daily work log saved successfully.";

        }


    } catch (error) {

        console.error(
            "Daily log error:",
            error
        );


        if (message) {

            message.style.color =
                "#dc2626";

            message.innerText =
                "Unable to save daily log.";

        }

    }

}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem(
        "devsync_token"
    );

    localStorage.removeItem(
        "devsync_user_id"
    );

    localStorage.removeItem(
        "devsync_username"
    );

    localStorage.removeItem(
        "devsync_email"
    );

    localStorage.removeItem(
        "devsync_role"
    );


    window.location.href = "/";

}


// =====================================================
// INITIALIZE
// =====================================================

async function initializeDashboard() {

    if (!EMPLOYEE_ID) {

        alert(
            "Employee ID not found. Please login again."
        );

        logout();

        return;

    }


    loadUser();


    await loadTasks();

    await loadWorkSessions();

    await loadProductivity();

    updateBreakDisplay();

}


// =====================================================
// START DASHBOARD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);