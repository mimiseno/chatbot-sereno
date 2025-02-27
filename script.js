import { modelYoru, systemInstruction } from "./mainmodule.js";

const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-cont");
console.log("Chat container:", chatContainer);

const promptContainer = document.querySelector(".prompt-suggestions");

const getChatResponse = async (userText) => {
    console.log("User Input:", userText); // Log user input for debugging
const context = userText; // Remove explicit instruction for Yoru


    try {
        const result = await modelYoru.generateContent({
            contents: [
                { role: "user", parts: [{ text: context + " " + userText }] } // Added context to user input
            ]
        });

        const response = await result.response.text(); // Remove extra asterisks from bold text
        const formattedResponse = response.replace(/(\*\*.*?\*\*)/g, "<strong>$1</strong>")
            .replace(/(\*.*?\*)/g, "<em>$1</em>")
            .replace(/(\n)/g, "<br>");

        console.log("AI Response:", response); // Log AI response for debugging

        return formattedResponse; // Return the formatted response instead
    } catch (error) {
        console.error("Error fetching response: ", error);
        return "Please refresh and try again.";
    }
};

// Handle sending messages
const handleAPI = async (userText) => {
    if (!userText) return;

    console.log("Creating chat bubble");
    const chatBubble = document.createElement("div");
    console.log("Chat bubble content:", userText);

    chatBubble.classList.add("user-bubble");
    chatBubble.innerHTML = `<p>${userText}</p>`;
    chatContainer.appendChild(chatBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom

    console.log("Chat bubble appended to chat container with content:", chatBubble.innerHTML);

    console.log("User Input:", userText);
    const response = await getChatResponse(userText); // Pass userText directly



    const botMessage = document.createElement("div");
    const profileImage = document.createElement("img");
    profileImage.src = "./imgs/yoru.jpg";
    profileImage.alt = "Yoru";
    profileImage.classList.add("rounded-full", "w-8", "h-8", "inline-block", "mr-2");
    
    botMessage.classList.add("gemini-response", "bot-bubble");
    botMessage.innerHTML += `<p>${response}</p>`; // Use formatted response

    botMessage.prepend(profileImage);
    chatContainer.appendChild(botMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom after AI response

    chatInput.value = "";

    console.log("User Input:", userText);
    console.log("AI Response:", response);
};

// Generate new prompt suggestions
const generatePromptSuggestions = async () => {
    const result = await modelYoru.generateContent({
        contents: [
            { role: "user", parts: [{ text: "Generate some engaging questions for Yoru from valorant to answer. make the questions interesting for yoru. ask querky questions if youd like. dont add numbers before the questions, and  dont let your questions be too long" }] }
        ]
    });

    const response = await result.response.text();
    const promptOptions = response.split('\n').filter(prompt => prompt.trim() !== '');

    return promptOptions;
};


const generateRandomPrompts = async () => {
    let promptOptions = await generatePromptSuggestions(); // Fetch prompt options dynamically


    if (!promptContainer) return;
    promptContainer.innerHTML = "";
    promptContainer.style.display = "none";

    let usedIndexes = new Set();
    while (usedIndexes.size < 3 && promptOptions.length > 0) { 
        let randomIndex = Math.floor(Math.random() * promptOptions.length);

        if (!usedIndexes.has(randomIndex)) {
            usedIndexes.add(randomIndex);
            let promptText = promptOptions[randomIndex];

            let promptDiv = document.createElement("div");
            promptDiv.className = "prompt-suggestion w-24 h-24 bg-[#72A7A1] text-white flex items-center justify-center rounded-md shadow-md cursor-pointer hover:bg-[#6A4C93] transition-colors";
            promptDiv.innerText = promptText;

            promptDiv.addEventListener("click", () => {
                chatInput.value = "";
                handleAPI(promptText);
                promptContainer.innerHTML = ""; // Clear prompt suggestions
                promptContainer.style.display = "none"; // Hide prompt container
                chatInput.focus();
            });

            promptContainer.appendChild(promptDiv);
        }
    }
    promptContainer.offsetHeight;
    promptContainer.style.display = "flex";
};

// Attach event listeners only if elements exist
if (sendButton && chatInput) {
    sendButton.addEventListener("click", () => {
        handleAPI(chatInput.value);
    });


    chatInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default form submission
            handleAPI(chatInput.value);
            chatInput.value = ""; // Clear input after sending
        }
    });

}

// Initial prompt generation when page loads
if (promptContainer) {
    promptContainer.style.display = "none";
    generateRandomPrompts();
}
