const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const typing = document.getElementById("typing");

// =========================
// Add Chat Message
// =========================
function addMessage(message, sender) {

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    if (sender === "user-message") {

        messageDiv.innerHTML = `
            <div class="message-content user">
                <p>${message}</p>
                <span class="time">${time}</span>
            </div>

            <div class="avatar">
                👤
            </div>
        `;

    } else {

        messageDiv.innerHTML = `
            <div class="avatar">
                🤖
            </div>

            <div class="message-content bot">
                <p>${message}</p>
                <span class="time">${time}</span>
            </div>
        `;

    }

    chatBox.appendChild(messageDiv);

    chatBox.scrollTop = chatBox.scrollHeight;

}

// =========================
// Button Click
// =========================
sendBtn.addEventListener("click", sendMessage);

// =========================
// Enter Key
// =========================
userInput.addEventListener("keypress", function(e){

    if(e.key==="Enter"){

        sendMessage();

    }

});

// =========================
// Send Message
// =========================
async function sendMessage(){

    const message = userInput.value.trim();

    if(message==="") return;

    addMessage(message,"user-message");

    userInput.value="";

    typing.style.display="block";

    try{

        const response = await fetch("https://healthai-backend-ashy.vercel.app/api/chatbot/chat",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                message:message
            })

        });

        const data = await response.json();

        typing.style.display="none";

        console.log("Gemini Response:",data);

        let reply="";

        if(data.reply){

            reply=data.reply;

        }
        else if(data.response){

            reply=data.response;

        }
        else if(data.text){

            reply=data.text;

        }
        else if(data.message){

            reply=data.message;

        }
        else{

            reply="Sorry, I couldn't understand the response.";

        }

        addMessage(reply,"bot-message");

    }

    catch(error){

        typing.style.display="none";

        console.log(error);

        addMessage(
            "❌ Unable to connect to HealthAI AI Assistant.",
            "bot-message"
        );

    }

}