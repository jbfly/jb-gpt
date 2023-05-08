const SERVER_URL = "http://bonewitz.local/app.php";

let conversationHistory;

function setTheme(themeName) {
    document.body.className = themeName;
}

document.addEventListener("DOMContentLoaded", function () {
    loadConversationHistory();
    displayConversationHistory();
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

    setTheme("groovy");

    const chatContainer = document.getElementById("chat-container");
    chatContainer.parentNode.insertBefore(themeSelector, chatContainer);

    // Add the model selector
    const modelSelector = document.createElement("select");
    modelSelector.id = "model-selector";
    modelSelector.innerHTML = `
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="gpt-4">GPT-4</option>
    `;
    chatContainer.parentNode.insertBefore(modelSelector, chatContainer.nextSibling);
});

async function sendChatMessage(e) {
    e.preventDefault();
    const message = messageInput.value.trim();
    const model = document.getElementById("model-selector").value; // Get the selected model from the dropdown
    if (message !== "") {
        let messageElement = document.createElement("div");
        messageElement.className = "user-message";
        messageElement.textContent = `You: ${message}`;
        document.getElementById("chat-output").appendChild(messageElement);

        conversationHistory.push({ role: "user", content: message });
        saveConversationHistory();

        document.getElementById("loading-indicator").style.display = "block";

        const model = document.getElementById("model-selector").value;

        try {
            console.log(JSON.stringify({ messages: conversationHistory }));
            const response = await fetch(SERVER_URL + "/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: conversationHistory,
                    model: model
                })
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            let aiMessage = data.message;
            conversationHistory.push({ role: "assistant", content: aiMessage });
            saveConversationHistory();

            let aiMessageElement = document.createElement("div");
            aiMessageElement.className = "ai-message";
            aiMessageElement.textContent = `AI: ${aiMessage}`;
            document.getElementById("chat-output").appendChild(aiMessageElement);
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
    saveConversationHistory();
    document.getElementById("chat-output").innerHTML = "";
});

function autoResizeInput(inputElement, maxRows) {
    inputElement.style.height = "auto";
    const numRows = Math.min(inputElement.scrollHeight / 20, maxRows);
    inputElement.style.height = 20 * numRows + "px";
}

const messageInput = document.getElementById("message-input");

const messageForm = document.getElementById("message-form");

messageInput.addEventListener("keydown", (e) => {
    autoResizeInput(messageInput, 8);

    if (e.key === "Enter") {
        if (!e.shiftKey) {
            e.preventDefault();
            messageForm.dispatchEvent(new Event("submit"));
        }
    }
});

function saveConversationHistory() {
    localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
}

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
