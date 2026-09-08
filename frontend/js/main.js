// Login
document.getElementById("loginBtn")?.addEventListener("click", () => {
    window.location.href = "login.html";
});

// Get Started
document.getElementById("getStartedBtn")?.addEventListener("click", () => {
    window.location.href = "register.html";
});

// CTA Button
document.getElementById("ctaBtn")?.addEventListener("click", () => {
    window.location.href = "register.html";
});

// Learn More
document.getElementById("learnMoreBtn")?.addEventListener("click", () => {
    document.getElementById("features").scrollIntoView({
        behavior: "smooth"
    });
});