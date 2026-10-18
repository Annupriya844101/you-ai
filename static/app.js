const form = document.querySelector("#chat-form");
const promptBox = document.querySelector("#prompt");
const messagesEl = document.querySelector("#messages");
const welcome = document.querySelector("#welcome");
const sendButton = document.querySelector("#send");
const newChat = document.querySelector("#new-chat");
const sidebar = document.querySelector(".sidebar");
const statusText = document.querySelector("#connection-status");
let history = [];

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/static/sw.js").catch(() => {}));
}

async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    statusText.textContent = data.model_configured ? "AI connected" : "Model setup needed";
  } catch { statusText.textContent = "Backend unavailable"; }
}
checkHealth();

function addMessage(role, content) {
  welcome.classList.add("hidden");
  const wrap = document.createElement("div");
  wrap.className = `message ${role}`;
  const inner = document.createElement("div");
  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = role === "user" ? "You" : "YOU AI";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;
  inner.append(label, bubble);
  wrap.append(inner);
  messagesEl.append(wrap);
  wrap.scrollIntoView({behavior:"smooth", block:"nearest"});
  return bubble;
}

async function sendMessage(text) {
  const clean = text.trim();
  if (!clean || sendButton.disabled) return;
  addMessage("user", clean);
  history.push({role:"user", content:clean});
  promptBox.value = "";
  promptBox.style.height = "auto";
  sendButton.disabled = true;
  const answerBubble = addMessage("assistant", "Thinking…");
  try {
    const response = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({messages:history})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Request failed. Please try again.");
    answerBubble.textContent = data.reply || "No response received.";
    history.push({role:"assistant", content:answerBubble.textContent});
  } catch (error) {
    answerBubble.textContent = `Connection error: ${error.message}. Check the backend and deployment logs.`;
  } finally {
    sendButton.disabled = false;
    promptBox.focus();
  }
}
form.addEventListener("submit", event => { event.preventDefault(); sendMessage(promptBox.value); });
promptBox.addEventListener("input", () => {
  promptBox.style.height = "auto";
  promptBox.style.height = Math.min(promptBox.scrollHeight, 180) + "px";
});
promptBox.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
});
document.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => sendMessage(button.dataset.prompt)));
newChat.addEventListener("click", () => {
  history = [];
  messagesEl.replaceChildren();
  welcome.classList.remove("hidden");
  sidebar.classList.remove("open");
  promptBox.focus();
});
document.querySelector("#menu-toggle").addEventListener("click", () => sidebar.classList.toggle("open"));
document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => {
  if (button.dataset.mode !== "chat") addMessage("assistant", `${button.textContent.trim()} is planned for a later phase. Chat is the first active module.`);
  sidebar.classList.remove("open");
}));
