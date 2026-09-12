// ==========================================
// USER INFORMATION
// ==========================================

const username =
    localStorage.getItem("devsync_username") || "Employee";

document.getElementById("username").innerText =
    username;

document.getElementById("avatar").innerText =
    username.charAt(0).toUpperCase();

document.getElementById("largeAvatar").innerText =
    username.charAt(0).toUpperCase();

document.getElementById("profileName").innerText =
    username;


// ==========================================
// EMAIL
// ==========================================

const savedEmail =
    localStorage.getItem("devsync_email");

document.getElementById("profileEmail").innerText =
    savedEmail || "Employee account";


// ==========================================
// DEFAULT SETTINGS
// ==========================================

let settings = JSON.parse(
    localStorage.getItem("devsync_settings")
) || {

    dailyTarget: "6",

    breakDuration: "15",

    taskNotifications: true,

    workNotifications: true,

    productivityNotifications: true,

    compactDashboard: false

};


// ==========================================
// LOAD SETTINGS
// ==========================================

function loadSettings() {

    document.getElementById(
        "dailyTarget"
    ).value =
        settings.dailyTarget;

    document.getElementById(
        "breakDuration"
    ).value =
        settings.breakDuration;

    document.getElementById(
        "taskNotifications"
    ).checked =
        settings.taskNotifications;

    document.getElementById(
        "workNotifications"
    ).checked =
        settings.workNotifications;

    document.getElementById(
        "productivityNotifications"
    ).checked =
        settings.productivityNotifications;

    document.getElementById(
        "compactDashboard"
    ).checked =
        settings.compactDashboard;

}


// ==========================================
// SAVE SETTINGS
// ==========================================

function saveSettings() {

    settings = {

        dailyTarget:
            document.getElementById(
                "dailyTarget"
            ).value,

        breakDuration:
            document.getElementById(
                "breakDuration"
            ).value,

        taskNotifications:
            document.getElementById(
                "taskNotifications"
            ).checked,

        workNotifications:
            document.getElementById(
                "workNotifications"
            ).checked,

        productivityNotifications:
            document.getElementById(
                "productivityNotifications"
            ).checked,

        compactDashboard:
            document.getElementById(
                "compactDashboard"
            ).checked

    };


    localStorage.setItem(
        "devsync_settings",
        JSON.stringify(settings)
    );


    const message =
        document.getElementById(
            "settingsMessage"
        );


    message.innerText =
        "✓ Settings saved successfully!";


    setTimeout(function() {

        message.innerText = "";

    }, 3000);

}


// ==========================================
// RESET SETTINGS
// ==========================================

function resetSettings() {

    const confirmReset =
        confirm(
            "Are you sure you want to reset all settings?"
        );


    if (!confirmReset) {
        return;
    }


    settings = {

        dailyTarget: "6",

        breakDuration: "15",

        taskNotifications: true,

        workNotifications: true,

        productivityNotifications: true,

        compactDashboard: false

    };


    localStorage.setItem(
        "devsync_settings",
        JSON.stringify(settings)
    );


    loadSettings();


    const message =
        document.getElementById(
            "settingsMessage"
        );


    message.innerText =
        "✓ Settings reset successfully!";


    setTimeout(function() {

        message.innerText = "";

    }, 3000);

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


// ==========================================
// INITIALIZE
// ==========================================

loadSettings();