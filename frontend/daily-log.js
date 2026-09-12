// ==========================================
// DEVSYNC - DAILY WORK LOG
// Backend Connected Version
// ==========================================

const API_BASE = window.location.origin;

const token = localStorage.getItem("devsync_token");
const username = localStorage.getItem("devsync_username");
const email = localStorage.getItem("devsync_email");


// ==========================================
// LOGIN CHECK
// ==========================================

if (!token) {
    alert("Please login first.");
    window.location.href = "/";
}


// ==========================================
// GET EMPLOYEE ID FROM JWT
// ==========================================

function getEmployeeIdFromToken() {

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

        console.error(
            "Token decode error:",
            error
        );

        return null;
    }
}


const employeeId =
    getEmployeeIdFromToken();


// ==========================================
// PROFILE
// ==========================================

const usernameElement =
    document.getElementById("username");

const avatarElement =
    document.getElementById("avatar");

if (usernameElement && username) {

    usernameElement.innerText =
        username;
}

if (avatarElement && username) {

    avatarElement.innerText =
        username
            .charAt(0)
            .toUpperCase();
}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTodayDate();

        loadTodayLog();

        loadRecentLogs();

    }
);


// ==========================================
// TODAY'S DATE
// ==========================================

function getTodayDate() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ==========================================
// DISPLAY TODAY DATE
// ==========================================

function setTodayDate() {

    const element =
        document.getElementById(
            "todayDate"
        );

    if (!element) {
        return;
    }

    const now = new Date();

    const formatted =
        now.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    element.innerText =
        formatted;
}


// ==========================================
// LOAD TODAY'S LOG
// ==========================================

async function loadTodayLog() {

    if (!employeeId) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE}/daily-logs/employee/${employeeId}`
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Unable to load daily logs"
            );
        }

        const today =
            getTodayDate();

        const todayLog =
            data.logs.find(
                log =>
                    log.work_date === today
            );

        if (todayLog) {

            fillLogForm(
                todayLog
            );

            setSaveStatus(
                "Saved"
            );

        }

    } catch (error) {

        console.error(
            "Load Today Log Error:",
            error
        );

    }
}


// ==========================================
// FILL FORM
// ==========================================

function fillLogForm(log) {

    try {

        const notes =
            JSON.parse(
                log.notes || "{}"
            );

        document.getElementById(
            "workSummary"
        ).value =
            notes.workSummary || "";

        document.getElementById(
            "achievements"
        ).value =
            notes.achievements || "";

        document.getElementById(
            "challenges"
        ).value =
            notes.challenges || "";

        document.getElementById(
            "nextPlan"
        ).value =
            notes.nextPlan || "";

        const status =
            notes.workStatus;

        if (status) {

            const radio =
                document.querySelector(
                    `input[name="workStatus"][value="${status}"]`
                );

            if (radio) {
                radio.checked = true;
            }
        }

    } catch (error) {

        // Old/simple notes format
        document.getElementById(
            "workSummary"
        ).value =
            log.notes || "";
    }
}


// ==========================================
// SAVE DAILY LOG
// ==========================================

async function saveLog() {

    if (!employeeId) {

        alert(
            "Employee ID not found. Please login again."
        );

        return;
    }


    const workSummary =
        document.getElementById(
            "workSummary"
        ).value.trim();


    const achievements =
        document.getElementById(
            "achievements"
        ).value.trim();


    const challenges =
        document.getElementById(
            "challenges"
        ).value.trim();


    const nextPlan =
        document.getElementById(
            "nextPlan"
        ).value.trim();


    const selectedStatus =
        document.querySelector(
            'input[name="workStatus"]:checked'
        );


    const workStatus =
        selectedStatus
            ? selectedStatus.value
            : "Good";


    // ======================================
    // VALIDATION
    // ======================================

    if (!workSummary) {

        alert(
            "Please enter what you worked on today."
        );

        return;
    }


    // ======================================
    // GET TASK INFORMATION
    // ======================================

    let tasksCompleted = 0;

    try {

        const taskResponse =
            await fetch(
                `${API_BASE}/tasks/employee/${employeeId}`
            );

        const taskData =
            await taskResponse.json();

        if (taskResponse.ok) {

            tasksCompleted =
                taskData.tasks.filter(
                    task =>
                        task.status ===
                        "Completed"
                ).length;
        }

    } catch (error) {

        console.error(
            "Task information error:",
            error
        );
    }


    // ======================================
    // GET WORK SESSION INFORMATION
    // ======================================

    let totalWorkMinutes = 0;
    let breakMinutes = 0;

    try {

        const workResponse =
            await fetch(
                `${API_BASE}/work/history/${employeeId}`
            );

        const workData =
            await workResponse.json();

        if (
            workResponse.ok &&
            workData.sessions
        ) {

            const today =
                getTodayDate();

            workData.sessions.forEach(
                session => {

                    if (
                        session.start_time &&
                        session.start_time
                            .startsWith(today)
                    ) {

                        totalWorkMinutes +=
                            Number(
                                session.total_work_minutes ||
                                0
                            );

                        breakMinutes +=
                            Number(
                                session.break_minutes ||
                                0
                            );
                    }

                }
            );
        }

    } catch (error) {

        console.error(
            "Work session error:",
            error
        );
    }


    // ======================================
    // PRODUCTIVITY
    // ======================================

    let productivity = 0;

    if (tasksCompleted > 0) {

        productivity = Math.min(
            100,
            tasksCompleted * 20
        );

    } else if (totalWorkMinutes > 0) {

        productivity =
            Math.min(
                100,
                Math.round(
                    (
                        totalWorkMinutes /
                        480
                    ) * 100
                )
            );
    }


    // ======================================
    // STORE ALL FORM DATA
    // ======================================

    const notesData = {

        workSummary:
            workSummary,

        achievements:
            achievements,

        challenges:
            challenges,

        nextPlan:
            nextPlan,

        workStatus:
            workStatus
    };


    const notes =
        JSON.stringify(
            notesData
        );


    // ======================================
    // CHECK EXISTING TODAY LOG
    // ======================================

    let existingLog = null;

    try {

        const response =
            await fetch(
                `${API_BASE}/daily-logs/employee/${employeeId}`
            );

        const data =
            await response.json();

        if (response.ok) {

            existingLog =
                data.logs.find(
                    log =>
                        log.work_date ===
                        getTodayDate()
                );
        }

    } catch (error) {

        console.error(
            "Existing log check error:",
            error
        );
    }


    // ======================================
    // UPDATE EXISTING LOG
    // ======================================

    if (existingLog) {

        try {

            const response =
                await fetch(
                    `${API_BASE}/daily-logs/${existingLog.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify({

                                tasks_completed:
                                    tasksCompleted,

                                total_work_minutes:
                                    totalWorkMinutes,

                                break_minutes:
                                    breakMinutes,

                                productivity:
                                    productivity,

                                notes:
                                    notes
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Unable to update log"
                );
            }


            setSaveStatus(
                "Saved ✓"
            );


            alert(
                "Daily log updated successfully!"
            );


            loadRecentLogs();

        } catch (error) {

            console.error(
                "Update Log Error:",
                error
            );

            alert(
                "Unable to update daily log."
            );
        }

        return;
    }


    // ======================================
    // CREATE NEW LOG
    // ======================================

    try {

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
                        JSON.stringify({

                            employee_id:
                                employeeId,

                            work_date:
                                getTodayDate(),

                            tasks_completed:
                                tasksCompleted,

                            total_work_minutes:
                                totalWorkMinutes,

                            break_minutes:
                                breakMinutes,

                            productivity:
                                productivity,

                            notes:
                                notes
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to save daily log"
            );
        }


        setSaveStatus(
            "Saved ✓"
        );


        alert(
            "Daily log saved successfully!"
        );


        loadRecentLogs();

    } catch (error) {

        console.error(
            "Save Log Error:",
            error
        );

        alert(
            "Unable to save daily log."
        );
    }
}


// ==========================================
// LOAD RECENT LOGS
// ==========================================

async function loadRecentLogs() {

    const container =
        document.getElementById(
            "recentLogs"
        );

    if (!container || !employeeId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/daily-logs/employee/${employeeId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to load logs"
            );
        }


        displayRecentLogs(
            data.logs
        );

    } catch (error) {

        console.error(
            "Recent Logs Error:",
            error
        );

        container.innerHTML = `
            <div class="empty-log">
                Unable to load recent work logs.
            </div>
        `;
    }
}


// ==========================================
// DISPLAY RECENT LOGS
// ==========================================

function displayRecentLogs(logs) {

    const container =
        document.getElementById(
            "recentLogs"
        );

    if (!container) {
        return;
    }


    if (
        !logs ||
        logs.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-log">
                <h3>No work logs yet</h3>

                <p>
                    Save your first daily work log.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    logs.forEach(
        log => {

            let notes = {};

            try {

                notes =
                    JSON.parse(
                        log.notes || "{}"
                    );

            } catch {

                notes = {
                    workSummary:
                        log.notes || ""
                };
            }


            const date =
                new Date(
                    log.work_date
                );


            const formattedDate =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );


            const workHours =
                Math.floor(
                    log.total_work_minutes /
                    60
                );


            const workMinutes =
                log.total_work_minutes %
                60;


            const logElement =
                document.createElement(
                    "div"
                );


            logElement.className =
                "recent-log";


            logElement.innerHTML = `

                <div class="recent-log-header">

                    <strong>
                        ${escapeHTML(
                            formattedDate
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            notes.workStatus ||
                            "Good"
                        )}
                    </span>

                </div>


                <div class="recent-log-content">

                    <p>
                        <strong>
                            Work:
                        </strong>

                        ${escapeHTML(
                            notes.workSummary ||
                            "No work summary"
                        )}
                    </p>


                    <p>
                        <strong>
                            Achievements:
                        </strong>

                        ${escapeHTML(
                            notes.achievements ||
                            "No achievements recorded"
                        )}
                    </p>


                    <p>
                        <strong>
                            Challenges:
                        </strong>

                        ${escapeHTML(
                            notes.challenges ||
                            "No challenges recorded"
                        )}
                    </p>


                    <p>
                        <strong>
                            Next Plan:
                        </strong>

                        ${escapeHTML(
                            notes.nextPlan ||
                            "No plan added"
                        )}
                    </p>


                    <div class="log-stats">

                        <span>
                            Tasks:
                            ${log.tasks_completed}
                        </span>

                        <span>
                            Work:
                            ${workHours}h
                            ${workMinutes}m
                        </span>

                        <span>
                            Break:
                            ${log.break_minutes}m
                        </span>

                        <span>
                            Productivity:
                            ${log.productivity}%
                        </span>

                    </div>

                </div>
            `;


            container.appendChild(
                logElement
            );

        }
    );
}


// ==========================================
// SAVE STATUS
// ==========================================

function setSaveStatus(status) {

    const element =
        document.getElementById(
            "saveStatus"
        );

    if (element) {

        element.innerText =
            status;
    }
}


// ==========================================
// CLEAR FORM
// ==========================================

function clearLog() {

    const confirmed =
        confirm(
            "Are you sure you want to clear today's log?"
        );


    if (!confirmed) {
        return;
    }


    document.getElementById(
        "workSummary"
    ).value = "";


    document.getElementById(
        "achievements"
    ).value = "";


    document.getElementById(
        "challenges"
    ).value = "";


    document.getElementById(
        "nextPlan"
    ).value = "";


    document.querySelectorAll(
        'input[name="workStatus"]'
    ).forEach(
        radio => {
            radio.checked = false;
        }
    );


    setSaveStatus(
        "Not saved"
    );
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value || "";

    return div.innerHTML;
}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        "devsync_token"
    );

    localStorage.removeItem(
        "devsync_username"
    );

    localStorage.removeItem(
        "devsync_email"
    );


    window.location.href =
        "/";
}