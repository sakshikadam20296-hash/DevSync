const API_BASE = window.location.origin;

const token = localStorage.getItem("devsync_token");


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


const EMPLOYEE_ID = getEmployeeId();


// =====================================================
// HELPER - FORMAT MINUTES
// =====================================================

function formatMinutes(totalMinutes) {

    totalMinutes = Number(totalMinutes) || 0;

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
}


// =====================================================
// LOAD PRODUCTIVITY
// =====================================================

async function loadProductivity() {

    const message =
        document.getElementById("message");

    try {

        if (!EMPLOYEE_ID) {
            throw new Error("Employee ID not found");
        }

        if (message) {
            message.textContent = "";
        }


        // =================================================
        // 1. LOAD TASKS
        // =================================================

        const taskResponse = await fetch(
            `${API_BASE}/tasks/employee/${EMPLOYEE_ID}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!taskResponse.ok) {
            throw new Error("Unable to load tasks");
        }


        const taskData =
            await taskResponse.json();


        const tasks =
            taskData.tasks || [];


        const totalTasks =
            tasks.length;


        const completedTasks =
            tasks.filter(
                task =>
                    task.status === "Completed"
            ).length;


        const inProgressTasks =
            tasks.filter(
                task =>
                    task.status === "In Progress"
            ).length;


        const pendingTasks =
            tasks.filter(
                task =>
                    task.status === "Pending"
            ).length;


        // =================================================
        // 2. LOAD WORK SESSIONS
        // =================================================

        const workResponse = await fetch(
            `${API_BASE}/work/history/${EMPLOYEE_ID}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!workResponse.ok) {
            throw new Error(
                "Unable to load work sessions"
            );
        }


        const workData =
            await workResponse.json();


        const sessions =
            Array.isArray(workData)
                ? workData
                : [];


        // =================================================
        // 3. TOTAL WORKING TIME
        // =================================================

        let totalMinutes = 0;


        sessions.forEach(session => {

            totalMinutes +=
                Number(
                    session.total_work_minutes
                ) || 0;

        });


        // =================================================
        // 4. TASK COMPLETION SCORE
        // =================================================

        let taskCompletion = 0;


        if (totalTasks > 0) {

            taskCompletion =
                Math.round(
                    (
                        completedTasks /
                        totalTasks
                    ) * 100
                );

        }


        // =================================================
        // 5. WORK CONSISTENCY
        // =================================================

        let consistency = 0;


        if (sessions.length > 0) {

            /*
             * Each completed work session
             * contributes 20%.
             */

            consistency =
                Math.min(
                    100,
                    sessions.length * 20
                );

        }


        // =================================================
        // 6. WORK TIME SCORE
        // =================================================

        /*
         * 8 hours = 100%
         */

        const workTimeScore =
            Math.min(
                100,
                Math.round(
                    (totalMinutes / 480) * 100
                )
            );


        // =================================================
        // 7. OVERALL PRODUCTIVITY
        // =================================================

        /*
         * Productivity is calculated from:
         *
         * 50% Task Completion
         * 30% Working Time
         * 20% Consistency
         */

        const productivity =
            Math.round(
                (
                    taskCompletion * 0.50
                ) +
                (
                    workTimeScore * 0.30
                ) +
                (
                    consistency * 0.20
                )
            );


        // =================================================
        // 8. WORKING HOURS
        // =================================================

        const workingHours =
            formatMinutes(totalMinutes);


        // =================================================
        // 9. HERO PRODUCTIVITY
        // =================================================

        const heroProductivity =
            document.getElementById(
                "heroProductivity"
            );


        if (heroProductivity) {

            heroProductivity.textContent =
                `${productivity}%`;

        }


        const circleValue =
            document.getElementById(
                "circleValue"
            );


        if (circleValue) {

            circleValue.textContent =
                `${productivity}%`;

        }


        // =================================================
        // 10. STAT CARDS
        // =================================================

        const totalTasksElement =
            document.getElementById(
                "totalTasks"
            );


        if (totalTasksElement) {

            totalTasksElement.textContent =
                totalTasks;

        }


        const completedTasksElement =
            document.getElementById(
                "completedTasks"
            );


        if (completedTasksElement) {

            completedTasksElement.textContent =
                completedTasks;

        }


        const workingHoursElement =
            document.getElementById(
                "workingHours"
            );


        if (workingHoursElement) {

            workingHoursElement.textContent =
                workingHours;

        }


        const productivityElement =
            document.getElementById(
                "productivity"
            );


        if (productivityElement) {

            productivityElement.textContent =
                `${productivity}%`;

        }


        // =================================================
        // 11. TASK COMPLETION
        // =================================================

        const taskPercentage =
            document.getElementById(
                "taskPercentage"
            );


        if (taskPercentage) {

            taskPercentage.textContent =
                `${taskCompletion}%`;

        }


        const taskProgress =
            document.getElementById(
                "taskProgress"
            );


        if (taskProgress) {

            taskProgress.style.width =
                `${taskCompletion}%`;

        }


        // =================================================
        // 12. OVERALL PRODUCTIVITY
        // =================================================

        const productivityPercentage =
            document.getElementById(
                "productivityPercentage"
            );


        if (productivityPercentage) {

            productivityPercentage.textContent =
                `${productivity}%`;

        }


        const productivityProgress =
            document.getElementById(
                "productivityProgress"
            );


        if (productivityProgress) {

            productivityProgress.style.width =
                `${productivity}%`;

        }


        // =================================================
        // 13. CONSISTENCY
        // =================================================

        const consistencyPercentage =
            document.getElementById(
                "consistencyPercentage"
            );


        if (consistencyPercentage) {

            consistencyPercentage.textContent =
                `${consistency}%`;

        }


        const consistencyProgress =
            document.getElementById(
                "consistencyProgress"
            );


        if (consistencyProgress) {

            consistencyProgress.style.width =
                `${consistency}%`;

        }


        // =================================================
        // 14. HERO CIRCLE
        // =================================================

        const circle =
            document.getElementById(
                "progressCircle"
            );


        if (circle) {

            const degree =
                productivity * 3.6;


            circle.style.background =
                `conic-gradient(
                    white ${degree}deg,
                    rgba(255,255,255,0.25)
                    ${degree}deg
                )`;

        }


        // =================================================
        // 15. DAILY TARGET
        // =================================================

        const dailyTarget = 5;


        const targetPercentage =
            Math.min(
                100,
                Math.round(
                    (
                        completedTasks /
                        dailyTarget
                    ) * 100
                )
            );


        const dailyProgress =
            document.getElementById(
                "dailyProgress"
            );


        if (dailyProgress) {

            dailyProgress.style.width =
                `${targetPercentage}%`;

        }


        const targetText =
            document.getElementById(
                "targetText"
            );


        if (targetText) {

            targetText.textContent =
                `${completedTasks} / ${dailyTarget} Tasks`;

        }


        // =================================================
        // 16. PRODUCTIVITY INSIGHTS
        // =================================================

        const taskInsight =
            document.getElementById(
                "taskInsight"
            );


        const timeInsight =
            document.getElementById(
                "timeInsight"
            );


        const productivityInsight =
            document.getElementById(
                "productivityInsight"
            );


        // TASK INSIGHT

        if (taskInsight) {

            if (taskCompletion >= 80) {

                taskInsight.textContent =
                    "Excellent task completion. Keep maintaining this performance.";

            }
            else if (taskCompletion >= 50) {

                taskInsight.textContent =
                    "Good progress. Complete more assigned tasks to improve your score.";

            }
            else {

                taskInsight.textContent =
                    `You have completed ${completedTasks} of ${totalTasks} tasks. Focus on completing pending tasks.`;

            }

        }


        // TIME INSIGHT

        if (timeInsight) {

            if (totalMinutes >= 480) {

                timeInsight.textContent =
                    "Excellent working time. You have completed a full working day.";

            }
            else if (totalMinutes >= 240) {

                timeInsight.textContent =
                    `You have worked for ${workingHours}. Keep maintaining consistent working hours.`;

            }
            else {

                timeInsight.textContent =
                    `Current working time is ${workingHours}. Track your work sessions regularly.`;

            }

        }


        // PRODUCTIVITY INSIGHT

        if (productivityInsight) {

            if (productivity >= 80) {

                productivityInsight.textContent =
                    "Excellent overall performance. Keep maintaining this productivity level.";

            }
            else if (productivity >= 60) {

                productivityInsight.textContent =
                    "Good productivity. Stay consistent and complete more tasks.";

            }
            else if (productivity >= 40) {

                productivityInsight.textContent =
                    "Your performance is improving. Focus on task completion and working consistency.";

            }
            else {

                productivityInsight.textContent =
                    "Focus on completing tasks and tracking work sessions consistently.";

            }

        }


        // =================================================
        // DEBUG INFORMATION
        // =================================================

        console.log(
            "Productivity Analytics:",
            {
                employeeId: EMPLOYEE_ID,
                totalTasks: totalTasks,
                completedTasks: completedTasks,
                inProgressTasks: inProgressTasks,
                pendingTasks: pendingTasks,
                totalMinutes: totalMinutes,
                taskCompletion: taskCompletion,
                workTimeScore: workTimeScore,
                consistency: consistency,
                productivity: productivity
            }
        );

    }
    catch (error) {

        console.error(
            "Productivity Error:",
            error
        );


        if (message) {

            message.textContent =
                "Unable to load productivity data.";

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
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProductivity();

    }
);