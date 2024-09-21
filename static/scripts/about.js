document.addEventListener("DOMContentLoaded", function () {
    fetch("/review/get")
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                data.reviews.forEach((review, index) => {
                    document.getElementById(`rev${index + 1}`).textContent =
                        review.content;
                    document.getElementById(`name${index + 1}`).textContent =
                        "- " + review.name;
                });
            } else {
                console.error("Failed to load reviews");
            }
        })
        .catch((error) => {
            console.error("Error fetching random reviews: ", error);
        });
});
