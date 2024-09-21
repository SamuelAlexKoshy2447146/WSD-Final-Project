document.getElementById("first-name").addEventListener("input", () => {
    toggleSaveButton();
});
document.getElementById("email").addEventListener("input", () => {
    toggleSaveButton();
});
document.getElementById("mobile").addEventListener("input", () => {
    toggleSaveButton();
});

document.getElementById("photo-upload").addEventListener("input", () => {
    toggleSaveButton();
});

function toggleSaveButton() {
    document.getElementById("save-btn").classList.remove("disabled");
}

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
                document.getElementById("first-name").value = user.name || "";
                document.getElementById("email").value = user.email || "";
                document.getElementById("mobile").value = user.mobile || "";

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

        let name = document.getElementById("first-name").value.trim();
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
