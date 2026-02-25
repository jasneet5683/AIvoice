// ✅ RAILWAY BACKEND URL
const API_URL = 'https://ai-voice-production-d044.up.railway.app';

let isSpeechEnabled = false;
const synth = window.speechSynthesis;

// 🎤 Indian Female Voice Configuration
const indianFemaleVoice = {
    pitch: 1.2,
    rate: 0.9,
    volume: 1
};

// Send message function
async function sendMessage() {
    const textInput = document.getElementById('textInput');
    const message = textInput.value.trim();

    if (!message) return;

    // Display user message
    displayMessage(message, 'user');
    textInput.value = '';

    // Show loading indicator
    const loadingId = 'loading-' + Date.now();
    displayMessage('⏳ Processing...', 'bot', loadingId);

    try {
        // ✅ FETCH FROM RAILWAY BACKEND
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.reply || 'Sorry, I could not process your request.';

        // Remove loading indicator
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        // Display bot response
        displayMessage(botReply, 'bot');

        // Play voice if enabled
        if (isSpeechEnabled) {
            speakText(botReply);
        }
    } catch (error) {
        console.error('Error:', error);
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();
        displayMessage(`❌ Error: ${error.message}`, 'bot');
    }
}

// Display message in chat
function displayMessage(text, sender, messageId = null) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    if (messageId) messageDiv.id = messageId;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = text;

    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 🔊 Text-to-Speech with Indian Female Voice
function speakText(text) {
    if (synth.speaking) {
        synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = indianFemaleVoice.pitch;
    utterance.rate = indianFemaleVoice.rate;
    utterance.volume = indianFemaleVoice.volume;
    utterance.lang = 'en-IN'; // Indian English

    // Try to select Indian female voice if available
    const voices = synth.getVoices();
    const indianVoice = voices.find(voice => 
        voice.name.includes('Indian') || 
        voice.lang.includes('en-IN')
    );
    if (indianVoice) {
        utterance.voice = indianVoice;
    }

    synth.speak(utterance);
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Load voices when they're ready
synth.onvoiceschanged = function() {
    console.log('🎤 Voices loaded');
};

// Initial greeting
window.onload = function() {
    displayMessage('👋 Hello! I\'m your AI Chat Agent. How can I help you today?', 'bot');
};
