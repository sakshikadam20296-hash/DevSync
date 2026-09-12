// ================= MODALS =================

function openLogin() {
    document.getElementById("loginModal").classList.add("show");
}

function closeLogin() {
    document.getElementById("loginModal").classList.remove("show");
}

function openRegister() {
    document.getElementById("registerModal").classList.add("show");
}

function closeRegister() {
    document.getElementById("registerModal").classList.remove("show");
}


// ================= SWITCH MODALS =================

function switchToRegister() {
    closeLogin();
    openRegister();
}

function switchToLogin() {
    closeRegister();
    openLogin();
}


// ================= FEATURES SCROLL =================

function scrollToFeatures() {

    const features =
        document.getElementById("features");

    if (features) {

        features.scrollIntoView({
            behavior: "smooth"
        });

    }
}


// ================= CLOSE MODAL OUTSIDE =================

window.addEventListener("click", function(event) {

    const loginModal =
        document.getElementById("loginModal");

    const registerModal =
        document.getElementById("registerModal");

    if (event.target === loginModal) {
        closeLogin();
    }

    if (event.target === registerModal) {
        closeRegister();
    }

});


// ================= REGISTER =================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const username =
                document
                    .getElementById("registerUsername")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("registerEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("registerPassword")
                    .value;

            const message =
                document.getElementById(
                    "registerMessage"
                );

            message.innerText =
                "Creating account...";


            try {

                const response =
                    await fetch(
                        "/auth/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                username: username,

                                email: email,

                                password: password

                            })

                        }
                    );


                const data =
                    await response.json();


                // ================= REGISTER SUCCESS =================

                if (response.ok) {

                    message.innerText =
                        "✓ Account created successfully!";

                    registerForm.reset();


                    setTimeout(function() {

                        closeRegister();

                        openLogin();

                    }, 1200);

                }


                // ================= REGISTER ERROR =================

                else {

                    message.innerText =
                        "⚠ " +
                        (
                            data.detail ||
                            "Registration failed"
                        );

                }


            } catch (error) {

                console.error(
                    "Register Error:",
                    error
                );

                message.innerText =
                    "⚠ Backend connection failed.";

            }

        }
    );

}


// ================= LOGIN =================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            message.innerText =
                "Logging in...";


            try {

                const response =
                    await fetch(
                        "/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email: email,

                                password: password

                            })

                        }
                    );


                const data =
                    await response.json();


                // ================= LOGIN SUCCESS =================

                if (response.ok) {

                    // Save JWT token
                    localStorage.setItem(
                        "devsync_token",
                        data.access_token
                    );


                    // Save User ID
                    localStorage.setItem(
                        "devsync_user_id",
                        data.user_id
                    );


                    // Save Username
                    localStorage.setItem(
                        "devsync_username",
                        data.username
                    );


                    // Save Email
                    localStorage.setItem(
                        "devsync_email",
                        data.email
                    );


                    // Save Role
                    localStorage.setItem(
                        "devsync_role",
                        data.role
                    );


                    message.innerText =
                        "✓ Login successful!";


                    // ================= ROLE BASED REDIRECT =================

                    setTimeout(function() {

                        if (
                            data.role &&
                            data.role.toLowerCase() === "manager"
                        ) {

                            window.location.href =
                                "/manager";

                        } else {

                            window.location.href =
                                "/dashboard";

                        }

                    }, 800);

                }


                // ================= LOGIN ERROR =================

                else {

                    message.innerText =
                        "⚠ " +
                        (
                            data.detail ||
                            "Login failed"
                        );

                }


            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );

                message.innerText =
                    "⚠ Backend connection failed.";

            }

        }
    );

}


// ================= ESC KEY =================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeLogin();

            closeRegister();

        }

    }
);