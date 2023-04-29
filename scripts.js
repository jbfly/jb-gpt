const SERVER_URL = "https://bonewitz.net/chatgpt";

let conversationHistory = [];

function setTheme(themeName) {
    document.body.className = themeName;
}

// Call the function to load conversation history when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
    loadConversationHistory();
    displayConversationHistory(); // Add this line to display the loaded conversation history
    const themeSelector = document.createElement("select");
    themeSelector.id = "theme-selector";

    const themes = [
        { name: "Groovy", value: "groovy" },
        { name: "Plain White", value: "plain-white" },
        { name: "Google-style", value: "google-style" },
    ];


    themes.forEach((theme) => {
        const option = document.createElement("option");
        option.value = theme.value;
        option.text = theme.name;
        themeSelector.appendChild(option);
    });

    themeSelector.addEventListener("change", function (event) {
        setTheme(event.target.value);
    });

    // Set the default theme
    setTheme("google-style");

    // Add the theme selector to the desired location on the page
    const body = document.body;
    body.insertBefore(themeSelector, body.firstChild);
});


// ... (rest of the code remains the same)

async function sendChatMessage(e) {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message !== "") {
        let messageElement = document.createElement("div");
        messageElement.className = "user-message";
        messageElement.textContent = `You: ${message}`;
        document.getElementById("chat-output").appendChild(messageElement);

        conversationHistory.push({ role: "user", content: message });
        saveConversationHistory(); // Save the conversation history to local storage

        document.getElementById("loading-indicator").style.display = "block";

        try {
            console.log(JSON.stringify({ messages: conversationHistory }));
            const response = await fetch(SERVER_URL + "/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: conversationHistory
                })
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            let aiMessage = data.message;
            conversationHistory.push({ role: "assistant", content: aiMessage });
            saveConversationHistory(); // Save the conversation history to local storage

            let aiMessageElement = document.createElement("div");
            aiMessageElement.className = "ai-message";
            aiMessageElement.textContent = `AI: ${aiMessage}`;
            document.getElementById("chat-output").appendChild(aiMessageElement);
            // Hide the loading indicator
            document.getElementById("loading-indicator").style.display = "none";

        } catch (error) {
            console.error("Error in sending chat message:", error);
        }
        messageInput.value = "";
    }
    messageInput.focus();
}

document.getElementById("message-form").addEventListener("submit", sendChatMessage);

document.getElementById("new-conversation-btn").addEventListener("click", function () {
    conversationHistory = [];
    saveConversationHistory(); // Save the conversation history to local storage

    document.getElementById("chat-output").innerHTML = "";
});

function autoResizeInput(inputElement, maxRows) {
    inputElement.style.height = "auto"; // Temporarily set height to auto to calculate the right scroll height
    const numRows = Math.min(inputElement.scrollHeight / 20, maxRows); // Calculate the number of rows, limited by maxRows
    inputElement.style.height = 20 * numRows + "px"; // Set the new height based on the number of rows
}


const messageInput = document.getElementById("message-input");

const messageForm = document.getElementById("message-form"); // Add this line to get the message form

messageInput.addEventListener("keydown", (e) => {
    autoResizeInput(messageInput, 8);

    if (e.key === "Enter") {
        if (!e.shiftKey) {
            e.preventDefault();
            messageForm.dispatchEvent(new Event("submit"));
        }
    }
});




// Saving conversation history to local storage
function saveConversationHistory() {
    localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
}

// Loading conversation history from local storage
function loadConversationHistory() {
    const storedHistory = localStorage.getItem("conversationHistory");
    if (storedHistory) {
        conversationHistory = JSON.parse(storedHistory);
    } else {
        conversationHistory = [];
    }
}

function displayConversationHistory() {
    const chatOutput = document.getElementById("chat-output");
    chatOutput.innerHTML = "";

    conversationHistory.forEach((message) => {
        let messageElement = document.createElement("div");
        messageElement.className = message.role === "user" ? "user-message" : "ai-message";
        messageElement.textContent = `${message.role === "user" ? "You" : "AI"}: ${message.content}`;
        chatOutput.appendChild(messageElement);
    });
}

