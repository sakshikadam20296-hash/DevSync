// ==========================================
// DEVSYNC - TASK MANAGEMENT
// DATABASE CONNECTED VERSION
// ==========================================

const API_BASE = window.location.origin;


// ==========================================
// LOGIN DATA
// ==========================================

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

        console.error("Token decode error:", error);

        return null;
    }
}


const employeeId = getEmployeeIdFromToken();


// ==========================================
// USER INFORMATION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const usernameElement =
        document.getElementById("username");

    const avatarElement =
        document.getElementById("avatar");

    if (usernameElement && username) {
        usernameElement.innerText = username;
    }

    if (avatarElement && username) {
        avatarElement.innerText =
            username.charAt(0).toUpperCase();
    }

    loadTasks();
});


// ==========================================
// CURRENT TASK DATA
// ==========================================

let allTasks = [];


// ==========================================
// LOAD TASKS
// ==========================================

async function loadTasks() {

    if (!employeeId) {

        showMessage(
            "Employee ID not found.",
            "error"
        );

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/tasks/employee/${employeeId}`
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail || "Failed to load tasks"
            );
        }

        allTasks = data.tasks || [];

        displayTasks(allTasks);

        updateTaskStatistics(allTasks);

    } catch (error) {

        console.error(
            "Load Tasks Error:",
            error
        );

        showMessage(
            "Unable to load tasks from server.",
            "error"
        );
    }
}


// ==========================================
// DISPLAY TASKS
// ==========================================

function displayTasks(tasks) {

    const taskList =
        document.getElementById("taskList");

    if (!taskList) {
        return;
    }

    taskList.innerHTML = "";


    if (!tasks || tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-task">
                <h3>No tasks found</h3>
                <p>
                    Add a task to start tracking your work.
                </p>
            </div>
        `;

        return;
    }


    tasks.forEach(function (task) {

        const taskElement =
            document.createElement("div");

        taskElement.className = "task";


        if (task.status === "Completed") {
            taskElement.classList.add("completed");
        }


        const checked =
            task.status === "Completed"
                ? "checked"
                : "";


        taskElement.innerHTML = `

            <input
                type="checkbox"
                ${checked}
                onchange="
                    toggleTaskStatus(
                        ${task.id},
                        this.checked
                    )
                "
            >

            <div class="task-info">

                <strong>
                    ${escapeHTML(task.title)}
                </strong>

                <span>
                    ${
                        task.description
                            ? escapeHTML(task.description)
                            : "No description"
                    }
                </span>

            </div>

            <div class="
                priority
                ${getPriorityClass(task.priority)}
            ">
                ${escapeHTML(task.priority)}
            </div>

            <div class="task-actions">

                <button
                    onclick="editTask(${task.id})"
                >
                    Edit
                </button>

                <button
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>

            </div>
        `;


        taskList.appendChild(taskElement);

    });
}


// ==========================================
// OPEN ADD TASK MODAL
// ==========================================

function openTaskModal() {

    const modal =
        document.getElementById("taskModal");

    if (modal) {

        modal.style.display = "flex";

    }
}


// ==========================================
// CLOSE ADD TASK MODAL
// ==========================================

function closeTaskModal() {

    const modal =
        document.getElementById("taskModal");

    if (modal) {

        modal.style.display = "none";

    }
}


// ==========================================
// ADD TASK
// ==========================================

async function addTask() {

    const titleElement =
        document.getElementById("taskTitle");

    const descriptionElement =
        document.getElementById("taskDescription");

    const priorityElement =
        document.getElementById("taskPriority");


    if (!titleElement) {

        showMessage(
            "Task title field not found.",
            "error"
        );

        return;
    }


    const title =
        titleElement.value.trim();

    const description =
        descriptionElement
            ? descriptionElement.value.trim()
            : "";

    const priority =
        priorityElement
            ? priorityElement.value
            : "Medium";


    if (!title) {

        alert("Please enter task title.");

        return;
    }


    try {

        const response = await fetch(
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
                        employeeId,

                    title:
                        title,

                    description:
                        description,

                    priority:
                        priority

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Task creation failed"
            );
        }


        showMessage(
            "✓ Task created successfully!",
            "success"
        );


        // Clear form

        titleElement.value = "";

        if (descriptionElement) {
            descriptionElement.value = "";
        }


        closeTaskModal();


        // Reload database tasks

        await loadTasks();


    } catch (error) {

        console.error(
            "Add Task Error:",
            error
        );

        showMessage(
            "Unable to create task.",
            "error"
        );
    }
}


// ==========================================
// COMPLETE / PENDING
// ==========================================

async function toggleTaskStatus(
    taskId,
    isCompleted
) {

    const newStatus =
        isCompleted
            ? "Completed"
            : "Pending";


    try {

        const response = await fetch(
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

                    status:
                        newStatus

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Task update failed"
            );
        }


        showMessage(
            isCompleted
                ? "✓ Task completed!"
                : "Task marked as pending.",
            "success"
        );


        await loadTasks();


    } catch (error) {

        console.error(
            "Task Status Error:",
            error
        );


        showMessage(
            "Unable to update task.",
            "error"
        );
    }
}


// ==========================================
// EDIT TASK
// ==========================================

async function editTask(taskId) {

    const task =
        allTasks.find(
            item => item.id === taskId
        );


    if (!task) {

        alert("Task not found.");

        return;
    }


    const newTitle =
        prompt(
            "Edit task title:",
            task.title
        );


    if (
        newTitle === null ||
        !newTitle.trim()
    ) {

        return;
    }


    const newDescription =
        prompt(
            "Edit description:",
            task.description || ""
        );


    if (newDescription === null) {
        return;
    }


    const newPriority =
        prompt(
            "Enter priority: Low / Medium / High",
            task.priority
        );


    if (newPriority === null) {
        return;
    }


    const validPriorities = [
        "Low",
        "Medium",
        "High"
    ];


    const finalPriority =
        validPriorities.includes(
            newPriority
        )
            ? newPriority
            : task.priority;


    try {

        const response = await fetch(
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

                    title:
                        newTitle.trim(),

                    description:
                        newDescription.trim(),

                    priority:
                        finalPriority

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Task update failed"
            );
        }


        showMessage(
            "✓ Task updated successfully!",
            "success"
        );


        await loadTasks();


    } catch (error) {

        console.error(
            "Edit Task Error:",
            error
        );


        showMessage(
            "Unable to update task.",
            "error"
        );
    }
}


// ==========================================
// DELETE TASK
// ==========================================

async function deleteTask(taskId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_BASE}/tasks/${taskId}`,
            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Task deletion failed"
            );
        }


        showMessage(
            "✓ Task deleted successfully!",
            "success"
        );


        await loadTasks();


    } catch (error) {

        console.error(
            "Delete Task Error:",
            error
        );


        showMessage(
            "Unable to delete task.",
            "error"
        );
    }
}


// ==========================================
// FILTER TASKS
// ==========================================

function filterTasks(
    filter,
    button
) {

    let filteredTasks = [];


    if (filter === "all") {

        filteredTasks = allTasks;

    } else if (filter === "pending") {

        filteredTasks =
            allTasks.filter(
                task =>
                    task.status === "Pending"
            );

    } else if (filter === "progress") {

        filteredTasks =
            allTasks.filter(
                task =>
                    task.status === "In Progress"
            );

    } else if (filter === "completed") {

        filteredTasks =
            allTasks.filter(
                task =>
                    task.status === "Completed"
            );

    } else {

        filteredTasks = allTasks;

    }


    displayTasks(filteredTasks);


    // Active filter button

    document
        .querySelectorAll(".filter-btn")
        .forEach(
            btn =>
                btn.classList.remove("active")
        );


    if (button) {

        button.classList.add("active");

    }
}


// ==========================================
// TASK STATISTICS
// ==========================================

function updateTaskStatistics(tasks) {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                task.status === "Completed"
        ).length;


    const inProgress =
        tasks.filter(
            task =>
                task.status === "In Progress"
        ).length;


    const pending =
        tasks.filter(
            task =>
                task.status === "Pending"
        ).length;


    const completionRate =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    // Total

    const totalElement =
        document.getElementById(
            "totalTasks"
        );

    if (totalElement) {

        totalElement.innerText =
            total;

    }


    // In Progress

    const progressElement =
        document.getElementById(
            "progressTasks"
        );

    if (progressElement) {

        progressElement.innerText =
            inProgress;

    }


    // Completed

    const completedElement =
        document.getElementById(
            "completedTasks"
        );

    if (completedElement) {

        completedElement.innerText =
            completed;

    }


    // Completion Rate

    const rateElement =
        document.getElementById(
            "completionRate"
        );

    if (rateElement) {

        rateElement.innerText =
            completionRate + "%";

    }
}


// ==========================================
// PRIORITY CLASS
// ==========================================

function getPriorityClass(priority) {

    if (priority === "High") {
        return "high";
    }

    if (priority === "Low") {
        return "low";
    }

    return "medium";
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    message,
    type
) {

    let element =
        document.getElementById(
            "taskMessage"
        );


    if (!element) {

        element =
            document.createElement(
                "div"
            );

        element.id =
            "taskMessage";

        document.body.prepend(
            element
        );
    }


    element.innerText =
        message;

    element.className =
        type;


    setTimeout(
        function () {

            element.innerText = "";

        },
        3000
    );
}


// ==========================================
// SECURITY
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


    window.location.href = "/";
}