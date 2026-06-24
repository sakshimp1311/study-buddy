// API key will be taken from input box - not stored in code!

let currentMode = "explain";

// ─── Mode Selection ──────────────────────────────────────
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-${mode}`).classList.add('active');

  const labels = {
    explain:   "💡 Enter topic you want explained:",
    summarize: "📝 Paste your notes to summarize:",
    quiz:      "🧠 Enter topic to generate quiz:",
    flashcard: "🃏 Enter topic to create flashcards:"
  };

  const placeholders = {
    explain:   "e.g. Photosynthesis, Newton's Laws, World War 2...",
    summarize: "Paste your lecture notes or paragraph here...",
    quiz:      "e.g. Human Digestive System, French Revolution...",
    flashcard: "e.g. Periodic Table, Python Programming Basics..."
  };

  document.getElementById('inputLabel').textContent = labels[mode];
  document.getElementById('userInput').placeholder = placeholders[mode];
}

// ─── Character Count ─────────────────────────────────────
document.getElementById('userInput').addEventListener('input', () => {
  const len = document.getElementById('userInput').value.length;
  document.getElementById('wordCount').textContent = `${len} characters`;
});

// ─── Ask AI (Groq API) ───────────────────────────────────
async function askAI() {

  // Get API key from input box
  var API_KEY = document.getElementById('apiKeyInput').value.trim();
  
  if (!API_KEY || API_KEY === "") {
    alert("Please enter your Groq API key first!\n\nGet it FREE from: console.groq.com");
    return;
  }

  // Save key in browser for next time
  localStorage.setItem('study_buddy_key', API_KEY);

  var input = document.getElementById('userInput').value.trim();
  if (!input || input.length < 10) {
    alert("Please type something first! Minimum 10 characters required.");
    return;
  }

  var prompts = {
    explain: "You are a friendly study buddy. Explain this topic in very simple, easy-to-understand language with examples. Use bullet points and emojis:\n\nTopic: " + input,
    summarize: "Summarize these notes into clear, concise key points. Use bullet points:\n\nNotes: " + input,
    quiz: "Create 5 multiple choice questions (MCQs) based on this topic.\nFormat:\nQ1. [Question]\nA) Option  B) Option  C) Option  D) Option\n✅ Answer: [correct option]\n\nTopic: " + input,
    flashcard: "Create 8 flashcards for studying this topic.\nFormat:\n🃏 Q: [question]\n   A: [answer]\n\nTopic: " + input
  };

  var titles = {
    explain:   "💡 Explanation",
    summarize: "📝 Summary",
    quiz:      "🧠 Practice Quiz",
    flashcard: "🃏 Flashcards"
  };

  var btn = document.getElementById('askBtn');
  var outputCard = document.getElementById('outputCard');
  var outputContent = document.getElementById('outputContent');

  btn.disabled = true;
  btn.textContent = "✨ Generating...";
  outputCard.classList.remove('hidden');
  document.getElementById('outputTitle').textContent = titles[currentMode];
  outputContent.innerHTML = '<div class="loading-pulse">🤖 AI is thinking...</div>';

  try {
    var response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + API_KEY
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content: "You are a helpful and friendly AI study buddy for students. Always explain things clearly and simply."
            },
            {
              role: "user",
              content: prompts[currentMode]
            }
          ]
        })
      }
    );

    var data = await response.json();

    if (data.choices && data.choices[0]) {
      outputContent.textContent = data.choices[0].message.content;
    } else {
      outputContent.textContent = "❌ Error: " + JSON.stringify(data);
    }

  } catch (err) {
    outputContent.textContent = "❌ Error: " + err.message + "\n\nPlease check your API key!";
  }

  btn.disabled = false;
  btn.textContent = "✨ Ask AI";
}

// ─── Copy Output ─────────────────────────────────────────
function copyOutput() {
  var text = document.getElementById('outputContent').textContent;
  navigator.clipboard.writeText(text).then(function() {
    var btn = document.querySelector('.copy-btn');
    btn.textContent = "✅ Copied!";
    setTimeout(function() { btn.textContent = "📋 Copy"; }, 2000);
  });
}

// ─── Load Saved API Key ───────────────────────────────────
window.onload = function() {
  var savedKey = localStorage.getItem('study_buddy_key');
  if (savedKey) {
    document.getElementById('apiKeyInput').value = savedKey;
  }
}