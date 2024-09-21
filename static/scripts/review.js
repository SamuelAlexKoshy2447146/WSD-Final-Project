document.getElementById("reviewForm").addEventListener("submit", (event) => {
    event.preventDefault();

    let reviewTitle = document.getElementById("reviewTitle").value.trim();
    let reviewContent = document.getElementById("reviewText").value.trim();

    fetch("/review/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: reviewTitle,
            content: reviewContent,
        }),
    }).then((response) => {
        document.getElementById("notification").style.display = "block";
        setTimeout(() => {
            document.getElementById("notification").style.display = "none";
        }, 3000);
        return response.json();
    });
});
