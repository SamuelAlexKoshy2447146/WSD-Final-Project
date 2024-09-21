document.getElementById("name").addEventListener("input", () => {
    validateName();
    toggleSaveButton();
});
document.getElementById("role").addEventListener("input", () => {
    toggleSaveButton();
});
document.getElementById("email").addEventListener("input", () => {
    validateEmail();
    toggleSaveButton();
});
document.getElementById("mobile").addEventListener("input", () => {
    validatePhone();
    toggleSaveButton();
});
document.getElementById("photo-upload").addEventListener("input", () => {
    toggleSaveButton();
});

// function toggleSaveButton() {
//     document.getElementById("save-btn").classList.remove("disabled");
// }

document.addEventListener("DOMContentLoaded", () => {
    fetch("/get_user", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                let user = data.user;
                document.getElementById("name").value = user.name || "";
                document.getElementById("email").value = user.email || "";
                document.getElementById("mobile").value = user.mobile || "";
                document.getElementById("role").value = user.role;

                if (user.profile_picture) {
                    document.getElementById(
                        "profile-picture"
                    ).src = `data:image/jpeg;base64,${user.profile_picture}`;
                }
            } else {
                console.error(data.message);
            }
        })
        .catch((error) => console.error("Error: ", error));
});

document
    .getElementById("updateDetails")
    .addEventListener("submit", async (event) => {
        event.preventDefault();

        let name = document.getElementById("name").value.trim();
        let email = document.getElementById("email").value.trim();
        let mobile = document.getElementById("mobile").value.trim();
        let fileInput = document.getElementById("photo-upload");
        let file = fileInput.files[0];

        // Create a FormData object
        let formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("mobile", mobile);
        if (file) {
            formData.append("profile_picture", file);
        }

        await fetch("/update", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    // Reload the page to reflect updated session data
                    window.location.reload();
                } else {
                    console.error(data.message);
                }
            })
            .catch((error) => console.error("Error: ", error));
    });

function validateName() {
    console.log();
    const name = document.getElementById("name").value.trim();
    const nameRegex = /^[a-zA-Z\s]{3,}$/;
    if (!nameRegex.test(name)) {
        showError(
            "registerName",
            "nameError",
            "Name must be at least 3 letters"
        );
        return false;
    } else {
        hideError("nameError");
        return true;
    }
}

function validateEmail() {
    const email = document.getElementById("email").value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError("registerEmail", "emailError", "Invalid email address.");
        return false;
    } else {
        hideError("emailError");
        return true;
    }
}

function validatePhone() {
    const phone = document.getElementById("mobile").value.trim();
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        showError(
            "mobile",
            "mobileError",
            "Invalid phone number. Please enter a 10-digit number."
        );
        return false;
    } else {
        hideError("mobileError");
        return true;
    }
}

function showError(inputId, errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
    } else {
        console.error(`Error: Element with ID ${errorId} not found.`);
    }
}

function hideError(errorId) {
    document.getElementById(errorId).textContent = "";
}

function toggleSaveButton() {
    document.getElementById("save-btn").classList.remove("disabled");
    const formIsValid = validateName() && validateEmail() && validatePhone();
    document.getElementById("save-btn").disabled = !formIsValid;
}
