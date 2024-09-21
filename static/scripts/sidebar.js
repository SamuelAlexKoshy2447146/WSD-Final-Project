const sidebarToggle = document.querySelector(".toggle-btn");

sidebarToggle.addEventListener("click", function () {
    document.querySelector("#sidebar").classList.toggle("expand");
});

const sidebar = document.getElementById("sidebar");
const productSubmenu = document.getElementById("productSubmenu");
const toggleSidebarButton = document.getElementById("toggleSidebar");

toggleSidebarButton.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed"); // Assuming you have a collapsed class for styling
});



// document.getElementById("productToggle").addEventListener("click", function(event) {
//     event.preventDefault(); // Prevent default link behavior

//     // Check if sidebar is collapsed
//     if (sidebar.classList.contains("collapsed")) {
//         sidebar.classList.remove("collapsed"); // Expand the sidebar
//     }

//     // Use a short timeout to allow the sidebar to expand before showing the submenu
//     setTimeout(() => {
//         productSubmenu.classList.toggle("active"); // Toggle the active class
//     }, 300); // Adjust the timeout as needed for the expansion animation
// });
