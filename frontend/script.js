const chatMessages = document.getElementById('chatMessages');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');

// Welcome message on load
document.addEventListener('DOMContentLoaded', () => {
  addMessage(
    'Hello! 👋 I can convert your text to Indian female voice. Just type something and hit Send!',
    'bot'
  );
});

async function sendMessage() {
  const text = textInput.value.trim();
  
  if (!text) return;

  // Add user message to chat
  addMessage(text, 'user');
  textInput.value = '';
  textInput.focus();
  sendBtn.disabled = true;

  try {
    // Call backend API
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to convert text to speech');
    }

    // Get audio blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Add bot message with play button
    addMessage(text, 'bot', audioUrl);

  } catch (error) {
    console.error('Error:', error);
    addMessage(
      `❌ Error: ${error.message}. Please try again.`,
      'bot'
    );
  } finally {
    sendBtn.disabled = false;
    textInput.focus();
  }
}

function addMessage(text, sender, audioUrl = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  if (sender === 'bot' && audioUrl) {
    messageDiv.innerHTML = `
      <button class="play-btn" onclick="playAudio(this, '${audioUrl}')" title="Play audio">🔊</button>
      <div class="message-content">${escapeHtml(text)}</div>
    `;
  } else {
    messageDiv.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
  }

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function playAudio(button, audioUrl) {
  // Prevent multiple simultaneous plays
  const allPlayBtns = document.querySelectorAll('.play-btn');
  const currentAudio = button.dataset.audio;

  if (currentAudio) {
    const audio = new Audio(currentAudio);
    audio.pause();
    button.classList.remove('playing');
    button.dataset.audio = '';
    return;
  }

  // Stop other audio
  allPlayBtns.forEach(btn => {
    if (btn.dataset.audio) {
      const audio = new Audio(btn.dataset.audio);
      audio.pause();
      btn.classList.remove('playing');
      btn.dataset.audio = '';
    }
  });

  // Play new audio
  const audio = new Audio(audioUrl);
  button.classList.add('playing');
  button.dataset.audio = audioUrl;

  audio.addEventListener('ended', () => {
    button.classList.remove('playing');
    button.dataset.audio = '';
  });

  audio.play().catch(err => console.error('Playback error:', err));
}

function handleKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
