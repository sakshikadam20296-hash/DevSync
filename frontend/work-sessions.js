const API_BASE = window.location.origin;

const token = localStorage.getItem("devsync_token");
const username = localStorage.getItem("devsync_username") || "Employee";

let employeeId = null;
let currentSessionId = null;
let timerInterval = null;

let breakStartTime = null;
let totalBreakSeconds = 0;


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

        console.error("Token error:", error);

        return null;
    }
}

employeeId = getEmployeeId();


// =====================================================
// DISPLAY USERNAME
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const usernameElement =
        document.getElementById("username");

    if (usernameElement) {
        usernameElement.textContent = username;
    }

    const avatar =
        document.getElementById("avatar");

    if (avatar) {
        avatar.textContent =
            username.charAt(0).toUpperCase();
    }

    loadCurrentSession();
    loadSessions();

});


// =====================================================
// START WORK
// =====================================================

async function startSession() {

    if (!employeeId) {

        alert("Employee ID not found.");

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/work/start/${employeeId}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to start work."
            );

            return;
        }

        currentSessionId = data.session_id;

        document.getElementById(
            "sessionStatus"
        ).textContent = "Working";

        document.getElementById(
            "sessionMessage"
        ).textContent =
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

        startTimer(data.start_time);

        alert("Work started successfully!");

        loadSessions();

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
// END WORK
// =====================================================

async function endSession() {

    if (!currentSessionId) {

        alert("No active work session.");

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/work/end/${currentSessionId}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to end work."
            );

            return;
        }

        stopTimer();

        document.getElementById(
            "sessionStatus"
        ).textContent = "No Active Session";

        document.getElementById(
            "sessionMessage"
        ).textContent =
            "You are currently not working.";

        document.getElementById(
            "sessionTimer"
        ).textContent = "00:00:00";

        document.getElementById(
            "startBtn"
        ).disabled = false;

        document.getElementById(
            "breakBtn"
        ).disabled = true;

        document.getElementById(
            "endBtn"
        ).disabled = true;

        currentSessionId = null;

        alert(
            `Work completed!\n\nTotal Work: ${data.total_work_minutes} minutes`
        );

        loadSessions();

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
// CURRENT SESSION
// =====================================================

async function loadCurrentSession() {

    if (!employeeId) return;

    try {

        const response = await fetch(
            `${API_BASE}/work/current/${employeeId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log(
            "Current session:",
            data
        );


        if (data.active) {

            currentSessionId =
                data.session_id;

            document.getElementById(
                "sessionStatus"
            ).textContent = "Working";

            document.getElementById(
                "sessionMessage"
            ).textContent =
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

            startTimer(
                data.start_time
            );

        } else {

            currentSessionId = null;

            document.getElementById(
                "sessionStatus"
            ).textContent =
                "No Active Session";

            document.getElementById(
                "sessionMessage"
            ).textContent =
                "You are currently not working.";

            document.getElementById(
                "startBtn"
            ).disabled = false;

            document.getElementById(
                "breakBtn"
            ).disabled = true;

            document.getElementById(
                "endBtn"
            ).disabled = true;

            stopTimer();

        }

    } catch (error) {

        console.error(
            "Current session error:",
            error
        );
    }
}


// =====================================================
// TIMER
// =====================================================

function startTimer(startTime) {

    stopTimer();

    const start =
        new Date(startTime).getTime();


    timerInterval = setInterval(
        function () {

            const now =
                new Date().getTime();

            const seconds =
                Math.floor(
                    (now - start) / 1000
                );

            const hours =
                Math.floor(
                    seconds / 3600
                );

            const minutes =
                Math.floor(
                    (seconds % 3600) / 60
                );

            const secs =
                seconds % 60;


            document.getElementById(
                "sessionTimer"
            ).textContent =
                `${String(hours).padStart(2, "0")}:` +
                `${String(minutes).padStart(2, "0")}:` +
                `${String(secs).padStart(2, "0")}`;

        },
        1000
    );
}


function stopTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;
    }
}


// =====================================================
// BREAK
// =====================================================

function toggleBreak() {

    const breakButton =
        document.getElementById(
            "breakBtn"
        );


    if (!breakStartTime) {

        breakStartTime =
            new Date().getTime();

        breakButton.textContent =
            "▶ Resume";

        breakButton.classList.add(
            "on-break"
        );

        document.getElementById(
            "sessionStatus"
        ).textContent =
            "On Break";

        document.getElementById(
            "sessionMessage"
        ).textContent =
            "Your work session is paused.";

    } else {

        const now =
            new Date().getTime();

        totalBreakSeconds +=
            Math.floor(
                (now - breakStartTime) / 1000
            );

        breakStartTime = null;

        breakButton.textContent =
            "☕ Break";

        breakButton.classList.remove(
            "on-break"
        );

        document.getElementById(
            "sessionStatus"
        ).textContent =
            "Working";

        document.getElementById(
            "sessionMessage"
        ).textContent =
            "Your work session is currently active.";

        updateBreakDisplay();
    }
}


// =====================================================
// BREAK DISPLAY
// =====================================================

function updateBreakDisplay() {

    const minutes =
        Math.floor(
            totalBreakSeconds / 60
        );

    document.getElementById(
        "breakTime"
    ).textContent =
        `${minutes}m`;
}


// =====================================================
// LOAD SESSION HISTORY
// =====================================================

async function loadSessions() {

    if (!employeeId) return;

    try {

        const response = await fetch(
            `${API_BASE}/work/history/${employeeId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const sessions =
            await response.json();

        console.log(
            "Work history:",
            sessions
        );


        const table =
            document.getElementById(
                "sessionTable"
            );

        table.innerHTML = "";


        if (
            !Array.isArray(sessions) ||
            sessions.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">
                        <div>⏱</div>
                        <strong>
                            No work sessions yet
                        </strong>
                        <p>
                            Start your first work session.
                        </p>
                    </td>
                </tr>
            `;

            updateStatistics([]);

            return;
        }


        sessions.forEach(
            function (session) {

                const row =
                    document.createElement("tr");


                const startDate =
                    session.start_time
                        ? new Date(
                            session.start_time
                        )
                        : null;


                const endDate =
                    session.end_time
                        ? new Date(
                            session.end_time
                        )
                        : null;


                const date =
                    startDate
                        ? startDate.toLocaleDateString()
                        : "-";


                const startTime =
                    startDate
                        ? startDate.toLocaleTimeString()
                        : "-";


                const endTime =
                    endDate
                        ? endDate.toLocaleTimeString()
                        : "-";


                const workMinutes =
                    session.total_work_minutes || 0;


                row.innerHTML = `
                    <td>${date}</td>
                    <td>${startTime}</td>
                    <td>${endTime}</td>
                    <td>0m</td>
                    <td>${workMinutes} min</td>
                    <td>${session.status}</td>
                `;


                table.appendChild(row);

            }
        );


        updateStatistics(sessions);

    } catch (error) {

        console.error(
            "History error:",
            error
        );
    }
}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics(sessions) {

    const today =
        new Date().toLocaleDateString();


    let todayMinutes = 0;
    let todaySessions = 0;


    sessions.forEach(
        function (session) {

            if (!session.start_time)
                return;


            const sessionDate =
                new Date(
                    session.start_time
                ).toLocaleDateString();


            if (
                sessionDate === today
            ) {

                todaySessions++;

                todayMinutes +=
                    session.total_work_minutes || 0;
            }

        }
    );


    const hours =
        Math.floor(
            todayMinutes / 60
        );

    const minutes =
        todayMinutes % 60;


    document.getElementById(
        "todayWork"
    ).textContent =
        `${hours}h ${String(minutes).padStart(2, "0")}m`;


    document.getElementById(
        "sessionCount"
    ).textContent =
        todaySessions;


    updateEfficiency(
        todayMinutes,
        todaySessions
    );
}


// =====================================================
// EFFICIENCY
// =====================================================

function updateEfficiency(
    workMinutes,
    sessionCount
) {

    let efficiency = 0;


    if (workMinutes > 0) {

        // 8 hours = 480 minutes
        efficiency =
            Math.min(
                100,
                Math.round(
                    (workMinutes / 480) * 100
                )
            );
    }


    document.getElementById(
        "efficiency"
    ).textContent =
        `${efficiency}%`;
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