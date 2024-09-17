const sidebarToggle = document.querySelector(".toggle-btn");

sidebarToggle.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");
});