# Custom Chat Widget

A fully self-hosted, custom-built chat widget — no third-party chat service, no volume limits, no monthly fees. A floating bubble opens a menu-driven bot with a working, Formspree-backed contact form.

`index.html` is a **demo page only**, built to show the widget in context. The widget is the project — everything else on that page is scaffolding.

---

## Demo

<table>
  <tr>
    <td align="center"><strong>Contact form (desktop)</strong></td>
    <td align="center"><strong>Chat widget (mobile)</strong></td>
  </tr>
  <tr>
    <td><img src="screenshots/04-chat-widget-contact-form-desktop.png" width="380" alt="Chat widget showing the Talk to a Consultant contact form"></td>
    <td><img src="screenshots/05-chat-widget-mobile.png" width="380" alt="Chat widget open on a mobile viewport"></td>
  </tr>
</table>

---

## Features

- Floating bubble, bottom-right, toggles the chat window
- Welcome message + main menu on first open
- Menu-driven bot with configurable options
- Expandable FAQ list
- Name/Email/Message contact form → [Formspree](https://formspree.io) → your inbox
- Simulated typing delay before bot replies
- Plain HTML/CSS/JS — no build step, no framework

---

## Quick start

1. Open `index.html` in your browser and click the chat bubble.
2. For the contact form to work reliably, serve it locally instead of opening as a file:
   ```bash
   python -m http.server 8000
   ```
   then visit `http://localhost:8000/index.html`.

---

## Source Code

MIT-licensed — free to copy, modify, and use commercially, no attribution required. The widget needs three pieces: HTML, CSS, and JS. Paste all three into any page and it works standalone.

The CSS uses a handful of color variables — add these to your page's `:root` (or replace them inline with the literal values):

```css
:root {
  --blue: #4f7fff;
  --blue-bright: #7aa0ff;
  --blue-light: rgba(79, 127, 255, 0.14);
  --navy-dark: #060a14;
  --navy: #0d1526;
  --bg-alt: #0d1220;
  --surface: #121a2c;
  --surface-2: #182238;
  --text-dark: #eef1f8;
  --text-muted: #8b96b3;
  --white: #ffffff;
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.14);
}
```

<details>
<summary><strong>HTML</strong> — place right before <code>&lt;/body&gt;</code></summary>

```html
<button id="vc-bubble" aria-label="Open chat">
  <svg class="vc-chat-icon" viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.94 2 11.7c0 2.61 1.36 4.95 3.5 6.53V22l3.6-2.02c.93.24 1.9.37 2.9.37 5.52 0 10-3.94 10-8.65S17.52 3 12 3z"/></svg>
  <svg class="vc-close-icon" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.3 1.41 1.41 6.3-6.3 6.3 6.3 1.41-1.41-6.3-6.3 6.3-6.3z"/></svg>
</button>

<div id="vc-window">
  <div class="vc-header">
    <div class="vc-header-info">
      <div class="vc-avatar">AG</div>
      <div>
        <h4>Business Solutions Hub</h4>
        <div class="vc-status"><span class="vc-status-dot"></span> Usually responds within minutes</div>
      </div>
    </div>
    <button class="vc-header-close" id="vc-close" aria-label="Close chat">&#10005;</button>
  </div>
  <div class="vc-body" id="vc-body"></div>
  <div class="vc-footer">Free and unlimited chat &middot; Powered by Apex Growth Partners</div>
</div>
```
</details>

<details>
<summary><strong>CSS</strong></summary>

```css
#vc-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: var(--blue);
  box-shadow: 0 10px 28px rgba(79, 127, 255, 0.4);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: transform 0.2s ease, background 0.2s ease;
}

#vc-bubble:hover {
  background: var(--blue-bright);
  transform: translateY(-2px) scale(1.04);
}

#vc-bubble svg {
  width: 26px;
  height: 26px;
  fill: var(--white);
}

#vc-bubble .vc-close-icon { display: none; }
#vc-bubble.vc-open .vc-chat-icon { display: none; }
#vc-bubble.vc-open .vc-close-icon { display: block; }

#vc-window {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 360px;
  max-width: calc(100vw - 32px);
  height: 520px;
  max-height: calc(100vh - 140px);
  background: var(--surface);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  border: 1px solid var(--border-strong);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 999;
  opacity: 0;
  transform: translateY(16px) scale(0.98);
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease;
}

#vc-window.vc-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.vc-header {
  background: linear-gradient(135deg, var(--navy-dark), var(--navy));
  color: var(--white);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.vc-header-info { display: flex; align-items: center; gap: 10px; }

.vc-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255,255,255,0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.vc-header h4 { font-size: 0.98rem; font-weight: 700; }

.vc-header .vc-status {
  font-size: 0.76rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 5px;
}

.vc-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4f8bff;
  display: inline-block;
}

.vc-header-close {
  background: rgba(255,255,255,0.12);
  border: none;
  color: var(--white);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.vc-header-close:hover { background: rgba(255,255,255,0.25); }

.vc-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  background: var(--bg-alt);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vc-body::-webkit-scrollbar { width: 6px; }
.vc-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 6px; }

.vc-msg {
  max-width: 85%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 12px 14px;
  border-radius: 10px 10px 10px 2px;
  font-size: 0.9rem;
  color: var(--text-dark);
  align-self: flex-start;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  animation: vc-pop 0.18s ease;
}

.vc-msg.vc-user {
  align-self: flex-end;
  background: var(--blue);
  color: var(--white);
  border-color: var(--blue);
  border-radius: 10px 10px 2px 10px;
}

@keyframes vc-pop {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.vc-options { display: flex; flex-direction: column; gap: 8px; align-self: stretch; }

.vc-option-btn {
  background: var(--surface-2);
  border: 1.5px solid var(--border-strong);
  color: var(--text-dark);
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
}

.vc-option-btn:hover {
  background: var(--blue);
  border-color: var(--blue);
  color: var(--white);
  transform: translateY(-1px);
}

.vc-faq-item {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  align-self: stretch;
}

.vc-faq-q {
  padding: 11px 14px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-dark);
}

.vc-faq-q::after {
  content: "+";
  color: var(--blue);
  font-weight: 700;
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.vc-faq-item.vc-open .vc-faq-q::after { transform: rotate(45deg); }

.vc-faq-a {
  max-height: 0;
  overflow: hidden;
  font-size: 0.85rem;
  color: var(--text-muted);
  padding: 0 14px;
  transition: max-height 0.25s ease, padding 0.25s ease;
}

.vc-faq-item.vc-open .vc-faq-a { max-height: 160px; padding: 0 14px 12px; }

.vc-form {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vc-form label { font-size: 0.8rem; font-weight: 600; color: var(--text-dark); }

.vc-form input,
.vc-form textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.88rem;
  resize: vertical;
  background: var(--bg-alt);
  color: var(--text-dark);
}

.vc-form input:focus,
.vc-form textarea:focus { outline: none; border-color: var(--blue); }

.vc-form .vc-submit {
  margin-top: 4px;
  background: var(--blue);
  color: var(--white);
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.vc-form .vc-submit:hover { background: var(--blue-bright); }
.vc-form .vc-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.vc-form .vc-error { color: #ff6b6b; font-size: 0.78rem; display: none; }

.vc-thankyou {
  align-self: stretch;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 26px 18px;
  text-align: center;
}

.vc-thankyou .vc-check {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--blue-light);
  color: var(--blue-bright);
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.vc-thankyou h4 { font-size: 1rem; margin-bottom: 6px; color: var(--white); }
.vc-thankyou p { font-size: 0.85rem; color: var(--text-muted); }

.vc-typing {
  align-self: flex-start;
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 12px 16px;
  border-radius: 10px 10px 10px 2px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.vc-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  opacity: 0.5;
  animation: vc-blink 1.2s infinite ease-in-out;
}

.vc-typing span:nth-child(2) { animation-delay: 0.15s; }
.vc-typing span:nth-child(3) { animation-delay: 0.3s; }

@keyframes vc-blink {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
  40% { opacity: 1; transform: scale(1); }
}

.vc-footer {
  padding: 10px 16px;
  text-align: center;
  font-size: 0.72rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}

@media (max-width: 480px) {
  #vc-window { right: 16px; left: 16px; width: auto; bottom: 92px; }
  #vc-bubble { right: 16px; bottom: 16px; }
}
```
</details>

<details>
<summary><strong>JavaScript</strong></summary>

```js
(function () {
  // ---- Configuration ----
  var PLANS_LINK = "#pricing";
  var FORMSPREE_ACTION = "https://formspree.io/f/xeaokykk"; // ← replace with your own

  var bubble = document.getElementById("vc-bubble");
  var win = document.getElementById("vc-window");
  var body = document.getElementById("vc-body");
  var closeBtn = document.getElementById("vc-close");

  var started = false;

  function scrollToBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function addBotMessage(text) {
    var el = document.createElement("div");
    el.className = "vc-msg";
    el.textContent = text;
    body.appendChild(el);
    scrollToBottom();
    return el;
  }

  function addBotMessageWithDelay(text, callback) {
    var typing = document.createElement("div");
    typing.className = "vc-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(typing);
    scrollToBottom();
    setTimeout(function () {
      typing.remove();
      addBotMessage(text);
      if (callback) callback();
    }, 550);
  }

  function addUserMessage(text) {
    var el = document.createElement("div");
    el.className = "vc-msg vc-user";
    el.textContent = text;
    body.appendChild(el);
    scrollToBottom();
    return el;
  }

  function clearOptions() {
    var existing = body.querySelectorAll(".vc-options, .vc-form, .vc-thankyou");
    existing.forEach(function (n) { n.remove(); });
  }

  function showMainMenu() {
    clearOptions();
    var wrap = document.createElement("div");
    wrap.className = "vc-options";

    var opts = [
      { label: "Explore Services and Pricing", action: showPlans },
      { label: "FAQ and Quick Questions", action: showFAQ },
      { label: "Talk to a Consultant", action: showForm }
    ];

    opts.forEach(function (opt) {
      var b = document.createElement("button");
      b.className = "vc-option-btn";
      b.textContent = opt.label;
      b.addEventListener("click", function () {
        addUserMessage(opt.label);
        opt.action();
      });
      wrap.appendChild(b);
    });

    body.appendChild(wrap);
    scrollToBottom();
  }

  function showPlans() {
    clearOptions();
    addBotMessageWithDelay("You can view our full range of growth solutions and pricing tiers right here in the pricing section on this page. Let us know if you need a custom quote.", function () {
      var backWrap = document.createElement("div");
      backWrap.className = "vc-options";
      var backBtn = document.createElement("button");
      backBtn.className = "vc-option-btn";
      backBtn.textContent = "Back to Menu";
      backBtn.addEventListener("click", function () {
        addUserMessage("Back to Menu");
        showMainMenu();
      });
      backWrap.appendChild(backBtn);
      body.appendChild(backWrap);
      scrollToBottom();
    });
  }

  function showFAQ() {
    clearOptions();
    addBotMessageWithDelay("Here are some quick answers. Select a question to expand it.", function () {
      var faqs = [
        { q: "How quickly can we get started?", a: "Most engagements kick off within one week of signing, starting with a strategy and audit phase before campaigns go live." },
        { q: "Do you require long-term contracts?", a: "No. Engagements run month to month, and you can adjust scope or cancel with 30 days notice." },
        { q: "How do you measure success?", a: "We track ROI, cost per acquisition, and pipeline growth, with transparent monthly reporting for every engagement." }
      ];

      faqs.forEach(function (f) {
        var item = document.createElement("div");
        item.className = "vc-faq-item";

        var q = document.createElement("div");
        q.className = "vc-faq-q";
        q.textContent = f.q;

        var a = document.createElement("div");
        a.className = "vc-faq-a";
        a.textContent = f.a;

        q.addEventListener("click", function () {
          item.classList.toggle("vc-open");
        });

        item.appendChild(q);
        item.appendChild(a);
        body.appendChild(item);
      });

      var backWrap = document.createElement("div");
      backWrap.className = "vc-options";
      var backBtn = document.createElement("button");
      backBtn.className = "vc-option-btn";
      backBtn.textContent = "Back to Menu";
      backBtn.addEventListener("click", function () {
        addUserMessage("Back to Menu");
        showMainMenu();
      });
      backWrap.appendChild(backBtn);
      body.appendChild(backWrap);
      scrollToBottom();
    });
  }

  function showForm() {
    clearOptions();
    addBotMessageWithDelay("Leave your details below and a consultant will reply by email shortly.", function () {
      var form = document.createElement("form");
      form.className = "vc-form";
      form.innerHTML =
        '<label for="vc-name">Name</label>' +
        '<input type="text" id="vc-name" name="name" required placeholder="Your name">' +
        '<label for="vc-email">Email</label>' +
        '<input type="email" id="vc-email" name="email" required placeholder="you@example.com">' +
        '<label for="vc-message">Message</label>' +
        '<textarea id="vc-message" name="message" rows="3" required placeholder="How can we help?"></textarea>' +
        '<div class="vc-error" id="vc-form-error">Something went wrong. Please try again.</div>' +
        '<button type="submit" class="vc-submit">Send Message</button>';

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var submitBtn = form.querySelector(".vc-submit");
        var errorBox = form.querySelector("#vc-form-error");
        errorBox.style.display = "none";
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        var payload = {
          name: form.querySelector("#vc-name").value,
          email: form.querySelector("#vc-email").value,
          message: form.querySelector("#vc-message").value
        };

        fetch(FORMSPREE_ACTION, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (res) {
            if (res.ok) {
              showThankYou();
            } else {
              throw new Error("Request failed");
            }
          })
          .catch(function () {
            errorBox.style.display = "block";
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
          });
      });

      body.appendChild(form);
      scrollToBottom();
    });
  }

  function showThankYou() {
    clearOptions();
    var box = document.createElement("div");
    box.className = "vc-thankyou";
    box.innerHTML =
      '<div class="vc-check">&#10003;</div>' +
      '<h4>Thank You</h4>' +
      '<p>A member of our team will contact you shortly via email.</p>';
    body.appendChild(box);

    var backWrap = document.createElement("div");
    backWrap.className = "vc-options";
    var backBtn = document.createElement("button");
    backBtn.className = "vc-option-btn";
    backBtn.textContent = "Back to Menu";
    backBtn.addEventListener("click", function () {
      addUserMessage("Back to Menu");
      showMainMenu();
    });
    backWrap.appendChild(backBtn);
    body.appendChild(backWrap);
    scrollToBottom();
  }

  function openChat() {
    win.classList.add("vc-visible");
    bubble.classList.add("vc-open");
    if (!started) {
      started = true;
      addBotMessageWithDelay("Hello. Welcome to our Business Solutions Hub. Looking to scale your business or improve your marketing? Please choose an option below:", showMainMenu);
    }
  }

  function closeChat() {
    win.classList.remove("vc-visible");
    bubble.classList.remove("vc-open");
  }

  bubble.addEventListener("click", function () {
    if (win.classList.contains("vc-visible")) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener("click", closeChat);
})();
```
</details>

Update the copy/links to match your business (see **Customizing** below).

---

## Setting up Formspree

1. Create a free form at [formspree.io](https://formspree.io) and copy its endpoint (`https://formspree.io/f/xxxxxxxx`).
2. In `index.html`, replace:
   ```js
   var FORMSPREE_ACTION = "https://formspree.io/f/xeaokykk";
   ```
3. Submit one test message — Formspree emails you a one-time confirmation link the first time. Click it, and future submissions arrive normally.

Free tier allows 50 submissions/month.

---

## Customizing

| To change... | Look for... |
|---|---|
| Header title / avatar | `Business Solutions Hub` / `AG` in `#vc-window` |
| Welcome message | `addBotMessageWithDelay(...)` in `openChat()` |
| Menu buttons | `opts` array in `showMainMenu()` |
| FAQ content | `faqs` array in `showFAQ()` |
| Widget colors | CSS variables at the top of `<style>` (`--blue`, `--surface`, etc.) |

---

## ☕ Support the Creator

[![Support via Bank Transfer](https://img.shields.io/badge/Support-Bank%20Transfer-4f7fff?style=for-the-badge&logo=buymeacoffee&logoColor=white)](#)

If this widget saved you time, a small transfer helps keep free projects like this maintained.

| 🏦 Bank Transfer |  |
|---|---|
| **IBAN** | `BG75STSA93000029979791` |

> Entirely optional — the widget is free to use, modify, and deploy without any obligation. ⭐ Star the repo if it was useful!
