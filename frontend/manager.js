const API_BASE = window.location.origin;


// ==========================================
// LOAD MANAGER DASHBOARD
// ==========================================

async function loadDashboard() {

    const employeeTable = document.getElementById("employeeTable");
    const message = document.getElementById("message");

    try {

        message.textContent = "";

        employeeTable.innerHTML = `
            <tr>
                <td colspan="9">
                    Loading employee data...
                </td>
            </tr>
        `;


        const response = await fetch(
            `${API_BASE}/manager/dashboard`
        );


        if (!response.ok) {
            throw new Error(
                "Manager dashboard API error"
            );
        }


        const data = await response.json();

        console.log(
            "MANAGER DATA:",
            data
        );


        // ==========================================
        // SUMMARY
        // ==========================================

        const dashboard = data.dashboard || {};

        document.getElementById(
            "totalEmployees"
        ).textContent =
            dashboard.total_employees ?? 0;


        document.getElementById(
            "totalTasks"
        ).textContent =
            dashboard.total_tasks ?? 0;


        document.getElementById(
            "completedTasks"
        ).textContent =
            dashboard.completed_tasks ?? 0;


        document.getElementById(
            "inProgressTasks"
        ).textContent =
            dashboard.in_progress_tasks ?? 0;


        document.getElementById(
            "pendingTasks"
        ).textContent =
            dashboard.pending_tasks ?? 0;


        document.getElementById(
            "workingHours"
        ).textContent =
            dashboard.working_hours ?? "0h 0m";


        document.getElementById(
            "averageProductivity"
        ).textContent =
            `${dashboard.average_productivity ?? 0}%`;


        // ==========================================
        // EMPLOYEES
        // ==========================================

        const employees = data.employees || [];


        if (employees.length === 0) {

            employeeTable.innerHTML = `
                <tr>
                    <td colspan="9">
                        No employee data available.
                    </td>
                </tr>
            `;

            return;
        }


        employeeTable.innerHTML = "";


        // ==========================================
        // EMPLOYEE ROWS
        // ==========================================

        employees.forEach(employee => {

            const row = document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${employee.employee_id ?? 0}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(
                            employee.username
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        employee.email
                    )}
                </td>

                <td>
                    ${employee.total_tasks ?? 0}
                </td>

                <td>
                    ${employee.completed_tasks ?? 0}
                </td>

                <td>
                    ${employee.in_progress_tasks ?? 0}
                </td>

                <td>
                    ${employee.pending_tasks ?? 0}
                </td>

                <td>
                    ${employee.working_hours ?? "0h 0m"}
                </td>

                <td>
                    <strong>
                        ${employee.productivity ?? 0}%
                    </strong>
                </td>

            `;


            employeeTable.appendChild(row);

        });

    }

    catch (error) {

        console.error(
            "Manager Dashboard Error:",
            error
        );


        employeeTable.innerHTML = `
            <tr>
                <td colspan="9">
                    Unable to load employee data.
                </td>
            </tr>
        `;


        message.textContent =
            "Unable to load manager dashboard.";

    }

}


// ==========================================
// ESCAPE HTML
// ==========================================

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


// ==========================================
// LOAD WHEN PAGE OPENS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDashboard();

    }
);