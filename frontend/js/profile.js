// ===============================
// HealthAI - Profile
// ===============================

// ===============================
// Load Logged In User
// ===============================

const userData = localStorage.getItem("user");
const token = localStorage.getItem("token");

if (!userData || !token) {
    window.location.href = "login.html";
}

const user = JSON.parse(userData);


// ===============================
// Show User Details
// ===============================

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");

if (profileName) {
    profileName.innerText = user.name || "HealthAI User";
}

if (profileEmail) {
    profileEmail.innerText = user.email || "";
}

if (nameInput) {
    nameInput.value = user.name || "";
}

if (emailInput) {
    emailInput.value = user.email || "";
}

if (ageInput) {
    ageInput.value = user.age || "";
}

if (genderInput) {
    genderInput.value = user.gender || "";
}


// ===============================
// Load Real Statistics
// ===============================

async function loadProfileStatistics() {

    try {

        const response = await fetch(
            "https://healthai-backend-ashy.vercel.app/api/history",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                },

                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load prediction history."
            );

        }

        const history =
            Array.isArray(data.history)
                ? data.history
                : [];


        // ===============================
        // Real Prediction Count
        // ===============================

        const predictionCount =
            document.getElementById(
                "predictionCount"
            );

        if (predictionCount) {

            predictionCount.innerText =
                history.length;

        }


        // ===============================
        // Report Count
        // ===============================
        // Reports are currently not stored
        // separately in MongoDB.
        //
        // Keep the existing reportCount value
        // until report tracking is implemented.

        const reportCount =
            document.getElementById(
                "reportCount"
            );

        if (reportCount) {

            reportCount.innerText =
                localStorage.getItem(
                    "reportCount"
                ) || "0";

        }


        console.log(
            "Profile statistics loaded successfully."
        );

        console.log(
            "Real prediction count:",
            history.length
        );

    }

    catch (error) {

        console.error(
            "PROFILE STATISTICS ERROR:",
            error
        );

        const predictionCount =
            document.getElementById(
                "predictionCount"
            );

        if (predictionCount) {

            predictionCount.innerText = "0";

        }

    }

}


// ===============================
// Save Profile
// ===============================

const updateBtn =
    document.getElementById("updateBtn");

if (updateBtn) {

    updateBtn.addEventListener(
        "click",
        () => {

            user.name =
                document.getElementById(
                    "name"
                ).value;

            user.age =
                document.getElementById(
                    "age"
                ).value;

            user.gender =
                document.getElementById(
                    "gender"
                ).value;


            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            alert(
                "✅ Profile Updated Successfully"
            );


            location.reload();

        }
    );

}


// ===============================
// Logout
// ===============================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem("user");

            localStorage.removeItem("token");

            window.location.href =
                "login.html";

        }
    );

}


// ===============================
// Start
// ===============================

loadProfileStatistics();