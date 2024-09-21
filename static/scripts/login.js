function resetForm(modalId) {
    const form = document.querySelector(`#${modalId} form`);
    form.reset();
    const errorMessages = form.querySelectorAll(".text-red-500");
    const errorIcons = form.querySelectorAll(".error-icon");
    errorMessages.forEach((message) => (message.textContent = ""));
    errorIcons.forEach((icon) => (icon.style.display = "none"));
}

function togglePasswordVisibility(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    }
}

// document.getElementById("toggleLoginPassword").addEventListener("click", () => {
//     togglePasswordVisibility("loginPassword", "toggleLoginPassword");
// });

document
    .getElementById("toggleSignupPassword")
    .addEventListener("click", () => {
        togglePasswordVisibility("registerPassword", "toggleSignupPassword");
    });
function formatDateInput(inputId) {
    const input = document.getElementById(inputId);
    const date = new Date(input.value);
    if (input.value && !isNaN(date)) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        input.value = `${year}-${month}-${day}`;
    }
}

function showError(inputId, errorId, iconId, message) {
    const errorElement = document.getElementById(errorId);
    const errorIcon = document.getElementById(iconId);
    if (errorElement && errorIcon) {
        errorElement.textContent = message;
        errorIcon.style.display = "inline";
    } else {
        console.error(
            `Error: Element with ID ${errorId} or ${iconId} not found.`
        );
    }
}

function hideError(errorId, iconId) {
    document.getElementById(errorId).textContent = "";
    document.getElementById(iconId).style.display = "none";
}
function validateName() {
    console.log();
    const name = document.getElementById("registerName").value.trim();
    const nameRegex = /^[a-zA-Z\s]{3,}$/;
    if (!nameRegex.test(name)) {
        showError(
            "registerName",
            "nameError",
            "nameErrorIcon",
            "Name must be at least 3 letters"
        );
        return false;
    } else {
        hideError("nameError", "nameErrorIcon");
        return true;
    }
}

function validateEmail() {
    const email = document.getElementById("registerEmail").value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError(
            "registerEmail",
            "emailError",
            "emailErrorIcon",
            "Invalid email address."
        );
        return false;
    } else {
        hideError("emailError", "emailErrorIcon");
        return true;
    }
}

function validatePassword() {
    const password = document.getElementById("registerPassword").value;
    if (password.length < 6) {
        showError(
            "registerPassword",
            "passwordError",
            "passwordErrorIcon",
            "Password must be at least 6 characters long."
        );
        return false;
    } else {
        hideError("passwordError", "passwordErrorIcon");
        return true;
    }
}

function validateConfirmPassword() {
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
        showError(
            "confirmPassword",
            "confirmPasswordError",
            "confirmPasswordErrorIcon",
            "Passwords do not match."
        );
        return false;
    } else {
        hideError("confirmPasswordError", "confirmPasswordErrorIcon");
        return true;
    }
}

document
    .getElementById("signupForm")
    .addEventListener("submit", async (event) => {
        event.preventDefault();
        if (
            validateName() &&
            validateEmail() &&
            validatePassword() &&
            validateConfirmPassword()
        ) {
            await fetch("/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: document.getElementById("registerName").value.trim(),
                    email: document
                        .getElementById("registerEmail")
                        .value.trim(),
                    password: document.getElementById("registerPassword").value,
                    role: document.getElementById("registerRole").value,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.status === "success") {
                        // Redirect to the home page after successful registration
                        window.location.href = "/";
                    } else {
                        // Show error message if registration failed
                        console.error(data.message);
                        showError(
                            "signupSubmit",
                            "submitError",
                            "submitErrorIcon",
                            "Email already exists in database. Please use another email."
                        );
                        // You can update your modal with the error message
                    }
                })
                .catch((error) => {
                    console.log("Already have email");
                    console.log(error);
                    // alert("Error submitting form");
                });
            // const users = getUserData();
            // users.push({
            //     name: document.getElementById("registerName").value.trim(),
            //     email: document.getElementById("registerEmail").value.trim(),
            //     password: document.getElementById("registerPassword").value,
            // });
            // saveUserData(users);
            // notify("Signup successful!", "success");
            // hideModal("signupModal");
        } else {
            notify("Feilds in form are missing or validation error", "error");
        }
    });
function toggleSignupButton() {
    const formIsValid =
        validateName() &&
        validateEmail() &&
        validatePassword() &&
        validateConfirmPassword();
    document.getElementById("signupSubmit").disabled = !formIsValid;
}

document.getElementById("registerName").addEventListener("input", () => {
    validateName();
    toggleSignupButton();
});
document.getElementById("registerEmail").addEventListener("input", () => {
    validateEmail();
    toggleSignupButton();
});
document.getElementById("registerPassword").addEventListener("input", () => {
    validatePassword();
    toggleSignupButton();
});
document.getElementById("confirmPassword").addEventListener("input", () => {
    validateConfirmPassword();
    toggleSignupButton();
});

document
    .getElementById("loginForm")
    .addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();
        fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })
            .then((response) => {
                return response.json();
            })
            .then((result) => {
                // Handle the JSON result
                console.log(result);
                if (result.status === "success") {
                    // alert("Login successful!");
                    window.location.href = "/";
                } else if (result.message === "No email was found") {
                    document.getElementById("loginEmailError").textContent =
                        "Not a valid email";
                } else if (result.message === "Incorrect password") {
                    document.getElementById("loginEmailError").textContent = "";
                    document.getElementById("loginPasswordError").textContent =
                        "Incorrect password";
                } else {
                    alert("Login failed: " + result.message);
                }
            })
            .catch((error) => {
                // Handle any errors that occurred
                console.error("Error during login:", error);
                alert("Failed to log in. Check your network and try again.");
            });
    });

function notify(message, type = "success", duration = 10000) {
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
    notification.classList.remove("success", "error");
    if (type === "success") {
        notification.classList.add("success");
    } else if (type === "error") {
        notification.classList.add("error");
    }
    notificationMessage.textContent = message;
    notification.classList.remove("hidden");
    notification.classList.add("show");
    setTimeout(() => {
        notification.classList.remove("show");
        notification.classList.add("hidden");
    }, duration);
}
