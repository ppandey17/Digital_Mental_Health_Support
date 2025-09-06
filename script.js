const chatBtn = document.getElementById('chatBtn');
const volunteerForm = document.getElementById('volunteerForm');
const volunteerDetailsForm = document.getElementById('volunteerDetailsForm');
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const closeChatBtn = document.getElementById('closeChatBtn');

let volunteers = {}; // store volunteer details

// Step 1: Show volunteer form when Start Chat clicked
chatBtn.addEventListener('click', () => {
  volunteerForm.classList.remove('hidden');
  chatBox.style.display = 'none';
});

// Step 2: After submitting volunteer details → show chatbox
volunteerDetailsForm.addEventListener('submit', (e) => {
  e.preventDefault();

  volunteers = {
    v1: {
      email: document.getElementById('volunteer1Email').value,
      phone: document.getElementById('volunteer1Phone').value
    },
    v2: {
      email: document.getElementById('volunteer2Email').value,
      phone: document.getElementById('volunteer2Phone').value
    }
  };

  // Hide form & open chat
  volunteerForm.classList.add('hidden');
  chatBox.style.display = 'flex';
  chatInput.focus();

  addMessage(`Bot: ✅ Volunteers registered. You can now start chatting.`, 'ai');
});

// Step 3: Close chat
closeChatBtn.addEventListener('click', () => {
  chatBox.style.display = 'none';
});

// Step 4: Send message logic
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendBtn.click();
  }
});

sendBtn.addEventListener('click', async () => {
  const msg = chatInput.value.trim();
  if (msg) {
    addMessage('You: ' + msg, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    sendBtn.disabled = true;

    const typingMsg = addMessage("AI is typing...", "ai");

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      let aiResponse = data.reply || "Sorry, I could not process that.";

      chatMessages.removeChild(typingMsg);
      addMessage("AI: " + aiResponse, "ai");

      // --- Escalation logic: check if severe depression detected ---
      if (/depress|suicid|can't go on|end my life/i.test(aiResponse)) {
        addMessage(
          `⚠️ Bot: It seems you might need extra support. Connecting you to volunteers:\n\n📧 ${volunteers.v1.email}, 📞 ${volunteers.v1.phone}\n📧 ${volunteers.v2.email}, 📞 ${volunteers.v2.phone}`,
          'ai'
        );
      }

    } catch (error) {
      chatMessages.removeChild(typingMsg);
      addMessage("AI: Sorry, there was an error connecting to the AI service.", "ai");
      console.error("Chat error:", error);
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }
});

function addMessage(text, type) {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = text;
  msgDiv.className = type === 'ai' ? 'mb-2 text-blue-600' : 'mb-2 text-green-600';
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgDiv;
}
