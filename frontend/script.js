const API_URL = 'https://ai-voice-production-d044.up.railway.app';

async function sendMessage() {
  const textInput = document.getElementById('textInput');
  const chatMessages = document.getElementById('chatMessages');
  const sendBtn = document.getElementById('sendBtn');
  
  const messageText = textInput.value.trim();
  
  if (!messageText) {
    alert('Please enter some text');
    return;
  }
  
  sendBtn.disabled = true;
  sendBtn.textContent = '⏳ Processing...';
  
  try {
    // Display user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = messageText;
    chatMessages.appendChild(userMessageDiv);
    
    textInput.value = '';
    
    console.log('Sending text:', messageText);
    
    const response = await fetch(`${API_URL}/api/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: messageText })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      throw new Error(errorData.error || 'Failed to process text');
    }
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Display AI response with audio
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'message ai-message';
    aiMessageDiv.innerHTML = `
      <p>🎤 AI Response:</p>
      <audio controls>
        <source src="${audioUrl}" type="audio/mpeg">
      </audio>
    `;
    chatMessages.appendChild(aiMessageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
  } catch (error) {
    console.error('Error:', error);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error-message';
    errorDiv.textContent = `❌ Error: ${error.message}`;
    chatMessages.appendChild(errorDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

window.addEventListener('load', () => {
  document.getElementById('textInput').focus();
});
