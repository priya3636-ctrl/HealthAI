function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.href = "login.html";
}