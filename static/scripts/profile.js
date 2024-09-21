document.getElementById("first-name").addEventListener("input", () => {
    toggleSaveButton();
});
document.getElementById("email").addEventListener("input", () => {
    toggleSaveButton();
});
document.getElementById("mobile").addEventListener("input", () => {
    toggleSaveButton();
});

function toggleSaveButton() {
    document.getElementById("submit").classList.remove("disabled");
}

document
    .getElementById("updateDetails")
    .addEventListener("submit", async (event) => {
        event.preventDefault();

        let name = document.getElementById("first-name").value.trim();
        let email = document.getElementById("email").value.trim();
        let mobile = document.getElementById("mobile").value.trim();

        await fetch("/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                mobile,
            }),
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
