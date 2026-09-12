// ===============================
// USER INFORMATION
// ===============================

const username =
    localStorage.getItem("devsync_username") || "Employee";

const employeeId =
    localStorage.getItem("devsync_user_id");

document.getElementById("username").innerText = username;

document.getElementById("avatar").innerText =
    username.charAt(0).toUpperCase();


// ===============================
// API
// ===============================

const API_BASE = window.location.origin;

let notifications = [];

let currentFilter = "all";


// ===============================
// LOAD NOTIFICATIONS
// ===============================

async function loadNotifications() {

    const container =
        document.getElementById("notificationList");

    try {

        if (!employeeId) {

            container.innerHTML = `
                <div class="empty-notifications">
                    <div class="empty-icon">🔔</div>
                    <h3>Login required</h3>
                    <p>Please login to view your notifications.</p>
                </div>
            `;

            return;
        }


        container.innerHTML = `
            <div class="empty-notifications">
                <div class="empty-icon">⏳</div>
                <h3>Loading notifications...</h3>
            </div>
        `;


        const token =
            localStorage.getItem("devsync_token");


        const response = await fetch(
            `${API_BASE}/notifications/employee/${employeeId}`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load notifications"
            );

        }


        const data =
            await response.json();


        console.log(
            "NOTIFICATIONS DATA:",
            data
        );


        notifications =
            data.notifications || [];


        renderNotifications();


    } catch (error) {

        console.error(
            "Notification Error:",
            error
        );


        container.innerHTML = `
            <div class="empty-notifications">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to load notifications</h3>
                <p>Please try again.</p>
            </div>
        `;

    }
}


// ===============================
// RENDER NOTIFICATIONS
// ===============================

function renderNotifications() {

    const container =
        document.getElementById(
            "notificationList"
        );


    let filteredNotifications =
        notifications;


    // FILTER

    if (currentFilter === "unread") {

        filteredNotifications =
            notifications.filter(
                notification =>
                    notification.is_read === false
            );

    }

    else if (currentFilter !== "all") {

        filteredNotifications =
            notifications.filter(
                notification =>
                    notification.type ===
                    currentFilter
            );

    }


    // EMPTY

    if (
        filteredNotifications.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-notifications">

                <div class="empty-icon">
                    🔔
                </div>

                <h3>
                    No notifications
                </h3>

                <p>
                    You don't have any notifications in this category.
                </p>

            </div>
        `;

        updateBadge();

        return;
    }


    // CLEAR

    container.innerHTML = "";


    // CREATE ITEMS

    filteredNotifications.forEach(
        notification => {

            const item =
                document.createElement("div");


            item.className =
                "notification-item" +
                (
                    !notification.is_read
                        ? " unread"
                        : ""
                );


            const date =
                notification.created_at
                    ? new Date(
                        notification.created_at
                    ).toLocaleString()
                    : "Recently";


            item.innerHTML = `

                <div class="notification-icon">

                    ${escapeHTML(
                        notification.icon || "🔔"
                    )}

                </div>


                <div class="notification-content">

                    <h3>
                        ${escapeHTML(
                            notification.title
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            notification.message
                        )}
                    </p>


                    <div class="notification-time">

                        ${escapeHTML(date)}

                    </div>

                </div>


                ${
                    !notification.is_read

                    ? `

                        <button
                            class="read-btn"
                            onclick="
                                markAsRead(
                                    ${notification.id}
                                )
                            "
                        >
                            Mark as read
                        </button>

                    `

                    : `

                        <span class="read-btn">
                            ✓ Read
                        </span>

                    `
                }

            `;


            container.appendChild(item);

        }
    );


    updateBadge();
}


// ===============================
// MARK ONE AS READ
// ===============================

async function markAsRead(id) {

    try {

        const token =
            localStorage.getItem(
                "devsync_token"
            );


        const response =
            await fetch(
                `${API_BASE}/notifications/${id}/read`,
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to mark notification as read"
            );

        }


        // Update local data

        const notification =
            notifications.find(
                item =>
                    item.id === id
            );


        if (notification) {

            notification.is_read = true;

        }


        renderNotifications();


    } catch (error) {

        console.error(
            "Mark Read Error:",
            error
        );

    }
}


// ===============================
// MARK ALL AS READ
// ===============================

async function markAllRead() {

    if (!employeeId) {
        return;
    }


    try {

        const token =
            localStorage.getItem(
                "devsync_token"
            );


        const response =
            await fetch(
                `${API_BASE}/notifications/employee/${employeeId}/read-all`,
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to mark all notifications as read"
            );

        }


        notifications.forEach(
            notification => {

                notification.is_read = true;

            }
        );


        renderNotifications();


    } catch (error) {

        console.error(
            "Mark All Read Error:",
            error
        );

    }
}


// ===============================
// FILTER
// ===============================

function filterNotifications(
    filter,
    button
) {

    currentFilter = filter;


    document
        .querySelectorAll(".filter")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    button.classList.add(
        "active"
    );


    renderNotifications();
}


// ===============================
// BADGE
// ===============================

function updateBadge() {

    const unreadCount =
        notifications.filter(
            notification =>
                notification.is_read === false
        ).length;


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    badge.innerText =
        unreadCount;


    if (unreadCount === 0) {

        badge.style.display =
            "none";

    }

    else {

        badge.style.display =
            "flex";

    }
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.innerText =
        text ?? "";


    return div.innerHTML;
}


// ===============================
// LOGOUT
// ===============================

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


// ===============================
// START
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadNotifications();

    }
);