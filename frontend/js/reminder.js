const user = JSON.parse(localStorage.getItem("user"));

if (!user) {

    alert("Please Login First");

    window.location.href = "login.html";

}

// ======================================
// Browser Notification Permission
// ======================================

if ("Notification" in window) {

    if (Notification.permission !== "granted") {

        Notification.requestPermission();

    }

}

const medicineName = document.getElementById("medicineName");
const medicineTime = document.getElementById("medicineTime");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const saveReminder = document.getElementById("saveReminder");
const reminderList = document.getElementById("reminderList");

let remindersData = [];

// ============================
// Load Reminders
// ============================

async function loadReminders() {

    try {

        const response = await fetch(

            `https://healthai-backend-ashy.vercel.app/api/reminder/${user.id}`

        );

        const reminders = await response.json();

        remindersData = reminders;

        reminderList.innerHTML = "";

        if (!reminders.length) {

            reminderList.innerHTML = `

            <div class="no-reminder">

                <h2>💊 No Medicine Reminders</h2>

                <p>Add your first reminder above.</p>

            </div>

            `;

            return;

        }

        reminders.forEach(item => {

            reminderList.innerHTML += `

            <div class="reminder-card">

                <h2>💊 ${item.medicine}</h2>

                <p><strong>⏰ Time:</strong> ${item.time}</p>

                <p><strong>📅 Start:</strong> ${item.startDate}</p>

                <p><strong>📅 End:</strong> ${item.endDate}</p>

                <button
                    class="delete-btn"
                    onclick="deleteReminder('${item._id}')">

                    Delete

                </button>

            </div>

            `;

        });

    }

    catch (error) {

        console.log(error);

        alert("Unable to Load Reminders");

    }

}

// ============================
// Save Reminder
// ============================

saveReminder.addEventListener("click", async () => {

    if (

        medicineName.value === "" ||
        medicineTime.value === "" ||
        startDate.value === "" ||
        endDate.value === ""

    ) {

        alert("Please fill all fields.");

        return;

    }

    try {

        const response = await fetch(

            "https://healthai-backend-ashy.vercel.app/api/reminder",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    userId: user.id,

                    medicine: medicineName.value,

                    time: medicineTime.value,

                    startDate: startDate.value,

                    endDate: endDate.value

                })

            }

        );

        if (!response.ok) {

            throw new Error();

        }

        medicineName.value = "";
        medicineTime.value = "";
        startDate.value = "";
        endDate.value = "";

        alert("✅ Reminder Saved");

        loadReminders();

    }

    catch (error) {

        console.log(error);

        alert("Unable to Save Reminder");

    }

});

// ============================
// Delete Reminder
// ============================

async function deleteReminder(id) {

    try {

        await fetch(

            `https://healthai-backend-ashy.vercel.app/api/reminder/${id}`,

            {

                method: "DELETE"

            }

        );

        loadReminders();

    }

    catch (error) {

        console.log(error);

        alert("Unable to Delete Reminder");

    }

}

// ======================================
// Check Medicine Reminder Every Minute
// ======================================

function checkMedicineReminder() {

    if (Notification.permission !== "granted") return;

    const now = new Date();

    const today = now.toISOString().split("T")[0];

    const currentTime = now.toTimeString().slice(0, 5);

    remindersData.forEach(item => {

        if (

            today >= item.startDate &&
            today <= item.endDate &&
            currentTime === item.time

        ) {

            new Notification("💊 HealthAI Medicine Reminder", {

                body: `Time to take ${item.medicine}`,

                icon: "images/logo.png"

            });

        }

    });

}

// Check immediately
setInterval(checkMedicineReminder, 60000);

// Load reminders
loadReminders();