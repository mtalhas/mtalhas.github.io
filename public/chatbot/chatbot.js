/**
 * mtalhas portfolio chatbot widget — single-file, vanilla JS, Shadow DOM.
 *
 * Embed:
 *   <script src="/chatbot/chatbot.js"
 *           data-chat-endpoint="https://func-mtalhas-chat-prod-fx.azurewebsites.net/api"
 *           data-cal-15="https://cal.com/mtalhas/15min"
 *           data-cal-30="https://cal.com/mtalhas/30min"
 *           defer></script>
 *
 * No external dependencies. Shadow DOM isolates all styles from the host page.
 * Session id persisted in sessionStorage (cleared on tab close).
 * Warm-back: localStorage `mtalhas_chat_visitor` (7-day TTL) keeps name + score.
 *
 * Wire shape (matches func-chat ChatResponse):
 *   { sessionId, text, buttons: [{id,label,payload,action,url}],
 *     action: "open-booking"|"submit_lead"|"", data: {url,duration,...},
 *     intentId, tier }
 */
(function () {
  'use strict';

  const SCRIPT = document.currentScript || (function () {
    const s = document.querySelectorAll('script');
    return s[s.length - 1];
  })();
  const CONFIG = {
    endpoint: SCRIPT.dataset.chatEndpoint || 'http://localhost:7071/api',
    cal15: SCRIPT.dataset.cal15 || 'https://cal.com/mtalhas/15min',
    cal30: SCRIPT.dataset.cal30 || 'https://cal.com/mtalhas/30min',
    bubbleLabel: SCRIPT.dataset.bubbleLabel || 'Chat with Talha',
    coldStartMs: parseInt(SCRIPT.dataset.coldStartMs || '5000', 10),
    warmBackDays: 7,
  };

  const SESSION_KEY = 'mtalhas_chat_session';
  const VISITOR_KEY = 'mtalhas_chat_visitor';

  // -------- State --------
  let host, shadow, panel, bubble, log, input, sendBtn, statusEl, ctaBar, honeypot;
  let sessionId = sessionStorage.getItem(SESSION_KEY) || '';
  let waitingTimer = null;
  let coldStartTimer = null;
  let inFlight = false;
  let stickyCtaUrl = null;
  // Anti-bot: widget mount timestamp; first user message before this
  // delay elapses is treated as suspicious by the server. Real users
  // can't read the greeting + type in <1.5s.
  const mountTime = Date.now();

  // -------- Bootstrap --------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  function mount() {
    host = document.createElement('div');
    host.id = 'mtalhas-chatbot-host';
    host.style.cssText = 'position:fixed;bottom:0;right:0;z-index:2147483647;font-family:inherit;';
    document.body.appendChild(host);

    shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = template();

    bubble = shadow.getElementById('bubble');
    panel = shadow.getElementById('panel');
    log = shadow.getElementById('log');
    input = shadow.getElementById('input');
    sendBtn = shadow.getElementById('send');
    statusEl = shadow.getElementById('status');
    ctaBar = shadow.getElementById('cta-bar');
    honeypot = shadow.getElementById('bot-check');

    bubble.addEventListener('click', togglePanel);
    sendBtn.addEventListener('click', onSubmit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(); }
    });
    shadow.getElementById('close').addEventListener('click', closePanel);

    // Pre-warm the Azure Function so the user's first real message doesn't
    // pay the cold-start tax. Fire-and-forget; we don't care about the result.
    fetch(CONFIG.endpoint + '/health', { method: 'GET', mode: 'cors' }).catch(() => {});
  }

  // -------- UI primitives --------
  function template() {
    return `
<style>
:host { all: initial; }
* { box-sizing: border-box; }
button { font: inherit; cursor: pointer; }
#bubble {
  position: fixed; right: 20px; bottom: 20px; width: 56px; height: 56px;
  border-radius: 50%; border: none; background: #2563eb; color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  transition: transform 150ms ease-out;
}
#bubble:hover { transform: scale(1.08); }
#bubble svg { width: 24px; height: 24px; }
#panel {
  position: fixed; right: 20px; bottom: 88px;
  width: min(380px, calc(100vw - 40px)); height: min(560px, calc(100vh - 120px));
  background: #fff; color: #111; border-radius: 14px;
  box-shadow: 0 14px 40px rgba(0,0,0,0.25);
  display: none; flex-direction: column; overflow: hidden;
  border: 1px solid rgba(0,0,0,0.08);
}
#panel.open { display: flex; }
header { display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #1f2937; color: #fff; }
header .hdr-text { min-width: 0; }
header .title { font-weight: 600; font-size: 14px; line-height: 1.2; display: flex; align-items: center; gap: 6px; }
header .badge {
  display: inline-block; font-size: 9.5px; font-weight: 600; letter-spacing: 0.04em;
  padding: 1px 6px; border-radius: 8px; background: rgba(139, 92, 246, 0.25);
  color: #ddd6fe; text-transform: uppercase; line-height: 1.5;
}
header #close { background: transparent; border: none; color: #fff; font-size: 18px; padding: 0; cursor: pointer; }
#log { flex: 1; padding: 12px 16px; overflow-y: auto;
  font-size: 14px; line-height: 1.45; }
.msg { margin: 0 0 10px; display: flex; flex-direction: column; max-width: 85%; }
.msg.bot { align-self: flex-start; }
.msg.user { align-self: flex-end; align-items: flex-end; }
.bubble-text {
  padding: 8px 12px; border-radius: 12px;
  background: #f1f5f9; color: #111; white-space: pre-wrap; word-wrap: break-word;
}
.msg.user .bubble-text { background: #2563eb; color: #fff; border-bottom-right-radius: 4px; }
.msg.bot .bubble-text { border-bottom-left-radius: 4px; }
.msg a { color: #2563eb; text-decoration: underline; }
.chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.chip {
  background: #fff; border: 1px solid #cbd5e1; color: #2563eb;
  padding: 6px 10px; border-radius: 16px; font-size: 12px;
}
.chip:hover { background: #eff6ff; }
.chip.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
.chip.primary:hover { background: #1d4ed8; }
#cta-bar { padding: 8px 16px; border-top: 1px solid #e5e7eb; background: #f8fafc; display: none; }
#cta-bar.show { display: block; }
#cta-bar a { display: inline-block; background: #2563eb; color: #fff;
  padding: 8px 14px; border-radius: 8px; text-decoration: none;
  font-size: 13px; font-weight: 500; }
form { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #e5e7eb; }
#input {
  flex: 1; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px;
  font: inherit; font-size: 14px; outline: none;
}
#input:focus { border-color: #2563eb; }
#send {
  background: #2563eb; color: #fff; border: none; border-radius: 8px;
  padding: 8px 14px; font-size: 14px;
}
#send:disabled { opacity: 0.5; cursor: not-allowed; }
#status {
  padding: 0 16px 6px; font-size: 12px; color: #6b7280; min-height: 18px;
}
.privacy-note { font-size: 11px; color: #6b7280; padding: 4px 16px 0; }
.footer-note { font-size: 10.5px; color: #6b7280; padding: 4px 16px 8px; border-top: 1px solid #f1f5f9; }
header .sub { font-size: 11.5px; opacity: 0.7; margin-top: 1px; }
</style>

<button id="bubble" aria-label="Open chat">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
</button>

<div id="panel" role="dialog" aria-label="Chat with Talha">
  <header>
    <div class="hdr-text">
      <div class="title">Ask Talha <span class="badge">AI</span></div>
      <div class="sub">Portfolio Q&amp;A and booking</div>
    </div>
    <button id="close" aria-label="Close">✕</button>
  </header>
  <div id="log" aria-live="polite"></div>
  <div id="status"></div>
  <div id="cta-bar"></div>
  <form id="form" onsubmit="return false;">
    <input id="input" type="text" autocomplete="off" placeholder="Type a message…" maxlength="500">
    <!-- honeypot: real users never see/touch this. Autofill bots will fill it. -->
    <input id="bot-check" name="bot_check" type="text" autocomplete="off" tabindex="-1" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;">
    <button id="send" type="submit">Send</button>
  </form>
  <div class="footer-note">Privacy: messages stay in this tab. Emails go only to Talha's inbox. No third-party CRM.</div>
</div>
    `;
  }

  function togglePanel() {
    if (panel.classList.contains('open')) { closePanel(); } else { openPanel(); }
  }

  function openPanel() {
    panel.classList.add('open');
    input.focus();
    // First open of this tab: render the greeting INSTANTLY client-side.
    // No server roundtrip, no cold-start wait. The user's first real message
    // is what hits the function (which by now has been pre-warmed via /health).
    if (log.children.length === 0) {
      const greeting = pickRandom([
        "Hey! I'm Talha's site assistant. Ask anything about his work, or tap a topic below.",
        "Hi there. I help visitors learn about Talha's work. What brings you here?",
        "Hello. I can summarize Talha's projects, walk through his skills, or get you on his calendar. What are you after?",
      ]);
      appendBot(greeting);
      renderChips([
        { id: 'about.identity', label: 'About Talha', payload: 'tell me about talha' },
        { id: 'projects.overview', label: 'His projects', payload: 'show me his projects' },
        { id: 'skills.overview', label: 'His skills', payload: 'what are his skills' },
        { id: 'booking.fifteen_min', label: 'Book 15 min', action: 'open-booking', url: CONFIG.cal15 },
        { id: 'booking.thirty_min', label: 'Book 30 min', action: 'open-booking', url: CONFIG.cal30 },
        { id: 'contact.email', label: 'Email Talha', payload: 'how do i email him' },
      ]);
    }
  }

  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function closePanel() { panel.classList.remove('open'); }

  function appendBot(htmlOrText, opts) {
    const m = document.createElement('div');
    m.className = 'msg bot';
    const b = document.createElement('div');
    b.className = 'bubble-text';
    if (opts && opts.raw) { b.innerHTML = htmlOrText; }
    else { b.innerHTML = linkify(escapeHtml(htmlOrText)); }
    m.appendChild(b);
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }

  function appendUser(text) {
    const m = document.createElement('div');
    m.className = 'msg user';
    const b = document.createElement('div');
    b.className = 'bubble-text';
    b.textContent = text;
    m.appendChild(b);
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }

  function renderChips(chips) {
    if (!chips || chips.length === 0) return;
    const row = document.createElement('div');
    row.className = 'chip-row';
    chips.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.className = 'chip' + (i === 0 && (c.action === 'open-booking') ? ' primary' : '');
      btn.textContent = c.label || c.id || 'Tap';
      btn.addEventListener('click', () => onChipClick(c));
      row.appendChild(btn);
    });
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  function onChipClick(c) {
    if (c.action === 'open-booking' && c.url) {
      window.open(c.url, '_blank', 'noopener');
      return;
    }
    if (c.url) {
      window.open(c.url, '_blank', 'noopener');
      return;
    }
    const payload = c.payload || c.label;
    if (payload) {
      appendUser(payload);
      sendToServer(payload);
    }
  }

  function setStickyCta(url, label) {
    if (!url) {
      ctaBar.classList.remove('show');
      ctaBar.innerHTML = '';
      stickyCtaUrl = null;
      return;
    }
    if (stickyCtaUrl === url) return;
    stickyCtaUrl = url;
    ctaBar.innerHTML = `<a href="${url}" target="_blank" rel="noopener">${escapeHtml(label || 'Book a 15-min call')}</a>`;
    ctaBar.classList.add('show');
  }

  // -------- Network --------
  async function onSubmit() {
    if (inFlight) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendUser(text);
    await sendToServer(text);
  }

  async function sendToServer(message) {
    if (inFlight) return;
    inFlight = true;
    sendBtn.disabled = true;
    showThinking();

    const body = { message };
    if (sessionId) body.sessionId = sessionId;
    // Anti-bot: honeypot value (always empty for real users) + time
    // since widget mount (real users take >1.5s to read+type).
    body.botCheck = (honeypot && honeypot.value) || '';
    body.mountMs = Date.now() - mountTime;

    try {
      const res = await fetch(CONFIG.endpoint + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      clearThinking();
      if (!res.ok) {
        appendBot('Hmm, that didn\'t go through. Try again in a moment, or book directly: ' + CONFIG.cal15);
        return;
      }
      const data = await res.json();
      handleResponse(data);
    } catch (err) {
      clearThinking();
      appendBot('Couldn\'t reach the chat service. Email mtalha.dev@gmail.com or book at ' + CONFIG.cal15);
    } finally {
      inFlight = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  function handleResponse(data) {
    if (data.sessionId) {
      sessionId = data.sessionId;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    if (data.text) {
      appendBot(data.text);
    }
    // Render typed buttons (chips).
    if (data.buttons && data.buttons.length) {
      renderChips(data.buttons);
    }
    // Structured action: render prominent CTA + auto-update sticky bar.
    if (data.action === 'open-booking' && data.data && data.data.url) {
      const label = data.data.duration ? `Open ${data.data.duration}-min calendar` : 'Open calendar';
      setStickyCta(data.data.url, label);
      // Also render an in-line primary chip so it's tappable inside the conversation.
      renderChips([{ label, action: 'open-booking', url: data.data.url }]);
    }
    // Privacy consent note before lead-capture turns.
    if (data.text && /your email|email so he can ping|share your email|what's the best email/i.test(data.text)) {
      const note = document.createElement('div');
      note.className = 'privacy-note';
      note.textContent = 'Your email goes only to Talha\'s lead inbox. No third-party CRM.';
      log.appendChild(note);
    }
  }

  function showThinking() {
    if (waitingTimer) return;
    statusEl.textContent = 'thinking…';
    coldStartTimer = setTimeout(() => {
      statusEl.textContent = 'still warming up, one sec…';
    }, CONFIG.coldStartMs);
    waitingTimer = setInterval(() => {
      const dots = statusEl.textContent.endsWith('….') ? '…' : statusEl.textContent + '.';
      // keep it lightweight; no-op refresh
      void dots;
    }, 600);
  }

  function clearThinking() {
    if (waitingTimer) { clearInterval(waitingTimer); waitingTimer = null; }
    if (coldStartTimer) { clearTimeout(coldStartTimer); coldStartTimer = null; }
    statusEl.textContent = '';
  }

  // -------- Visitor persistence (warm-back) --------
  function loadVisitor() {
    try {
      const raw = localStorage.getItem(VISITOR_KEY);
      if (!raw) return null;
      const v = JSON.parse(raw);
      const ttlMs = CONFIG.warmBackDays * 24 * 60 * 60 * 1000;
      if (!v.savedAt || Date.now() - v.savedAt > ttlMs) {
        localStorage.removeItem(VISITOR_KEY);
        return null;
      }
      return v;
    } catch (_) { return null; }
  }

  function saveVisitor(name) {
    try {
      localStorage.setItem(VISITOR_KEY, JSON.stringify({ name, savedAt: Date.now() }));
    } catch (_) {}
  }

  // -------- Helpers --------
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function linkify(htmlEscapedText) {
    return htmlEscapedText.replace(
      /(https?:\/\/[^\s<]+)/g,
      (m) => `<a href="${m}" target="_blank" rel="noopener">${m}</a>`
    );
  }
})();
