/*!
 * Custom Chat Widget — embed script
 * Source: https://github.com/LoneCod3r/Custom_Chat_Widget
 *
 * Usage (paste before </body>):
 *   <div id="custom-chat-widget" data-formspree="https://formspree.io/f/yourid"></div>
 *   <script src="chat-widget.js" defer></script>
 *
 * One instance per page. All markup and styles are created at runtime —
 * nothing needs to exist in your page's HTML or CSS beforehand.
 */
(function () {
  "use strict";

  var STYLE_ID = "vc-widget-styles";

  var CSS_TEXT = "\n"
    + "#vc-bubble {\n"
    + "  position: fixed;\n"
    + "  bottom: 24px;\n"
    + "  right: 24px;\n"
    + "  width: 62px;\n"
    + "  height: 62px;\n"
    + "  border-radius: 50%;\n"
    + "  background: #4f7fff;\n"
    + "  box-shadow: 0 10px 28px rgba(79, 127, 255, 0.4);\n"
    + "  border: none;\n"
    + "  cursor: pointer;\n"
    + "  display: flex;\n"
    + "  align-items: center;\n"
    + "  justify-content: center;\n"
    + "  z-index: 1000;\n"
    + "  transition: transform 0.2s ease, background 0.2s ease;\n"
    + "}\n"
    + "#vc-bubble:hover {\n"
    + "  background: #7aa0ff;\n"
    + "  transform: translateY(-2px) scale(1.04);\n"
    + "}\n"
    + "#vc-bubble svg {\n"
    + "  width: 26px;\n"
    + "  height: 26px;\n"
    + "  fill: #ffffff;\n"
    + "}\n"
    + "#vc-bubble .vc-close-icon { display: none; }\n"
    + "#vc-bubble.vc-open .vc-chat-icon { display: none; }\n"
    + "#vc-bubble.vc-open .vc-close-icon { display: block; }\n"
    + "#vc-window {\n"
    + "  position: fixed;\n"
    + "  bottom: 100px;\n"
    + "  right: 24px;\n"
    + "  width: 360px;\n"
    + "  max-width: calc(100vw - 32px);\n"
    + "  height: 520px;\n"
    + "  max-height: calc(100vh - 140px);\n"
    + "  background: #121a2c;\n"
    + "  border-radius: 16px;\n"
    + "  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);\n"
    + "  border: 1px solid rgba(255, 255, 255, 0.14);\n"
    + "  display: flex;\n"
    + "  flex-direction: column;\n"
    + "  overflow: hidden;\n"
    + "  z-index: 999;\n"
    + "  opacity: 0;\n"
    + "  transform: translateY(16px) scale(0.98);\n"
    + "  pointer-events: none;\n"
    + "  transition: opacity 0.22s ease, transform 0.22s ease;\n"
    + "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;\n"
    + "}\n"
    + "#vc-window.vc-visible {\n"
    + "  opacity: 1;\n"
    + "  transform: translateY(0) scale(1);\n"
    + "  pointer-events: auto;\n"
    + "}\n"
    + ".vc-header {\n"
    + "  background: linear-gradient(135deg, #060a14, #0d1526);\n"
    + "  color: #ffffff;\n"
    + "  padding: 18px 20px;\n"
    + "  display: flex;\n"
    + "  align-items: center;\n"
    + "  justify-content: space-between;\n"
    + "  flex-shrink: 0;\n"
    + "}\n"
    + ".vc-header-info { display: flex; align-items: center; gap: 10px; }\n"
    + ".vc-header h4 { font-size: 0.98rem; font-weight: 700; margin: 0; }\n"
    + ".vc-header .vc-status { font-size: 0.76rem; opacity: 0.8; display: flex; align-items: center; gap: 5px; }\n"
    + ".vc-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4f8bff; display: inline-block; }\n"
    + ".vc-header-close {\n"
    + "  background: rgba(255,255,255,0.12);\n"
    + "  border: none;\n"
    + "  color: #ffffff;\n"
    + "  width: 28px;\n"
    + "  height: 28px;\n"
    + "  border-radius: 6px;\n"
    + "  cursor: pointer;\n"
    + "  font-size: 1rem;\n"
    + "  line-height: 1;\n"
    + "  display: flex;\n"
    + "  align-items: center;\n"
    + "  justify-content: center;\n"
    + "  transition: background 0.2s ease;\n"
    + "}\n"
    + ".vc-header-close:hover { background: rgba(255,255,255,0.25); }\n"
    + ".vc-body {\n"
    + "  flex: 1;\n"
    + "  overflow-y: auto;\n"
    + "  padding: 18px;\n"
    + "  background: #0d1220;\n"
    + "  display: flex;\n"
    + "  flex-direction: column;\n"
    + "  gap: 12px;\n"
    + "}\n"
    + ".vc-body::-webkit-scrollbar { width: 6px; }\n"
    + ".vc-body::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 6px; }\n"
    + ".vc-msg {\n"
    + "  max-width: 85%;\n"
    + "  background: #182238;\n"
    + "  border: 1px solid rgba(255, 255, 255, 0.08);\n"
    + "  padding: 12px 14px;\n"
    + "  border-radius: 10px 10px 10px 2px;\n"
    + "  font-size: 0.9rem;\n"
    + "  color: #eef1f8;\n"
    + "  align-self: flex-start;\n"
    + "  box-shadow: 0 2px 6px rgba(0,0,0,0.2);\n"
    + "  animation: vc-pop 0.18s ease;\n"
    + "  margin: 0;\n"
    + "}\n"
    + ".vc-msg.vc-user { align-self: flex-end; background: #4f7fff; color: #ffffff; border-color: #4f7fff; border-radius: 10px 10px 2px 10px; }\n"
    + "@keyframes vc-pop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }\n"
    + ".vc-options { display: flex; flex-direction: column; gap: 8px; align-self: stretch; }\n"
    + ".vc-option-btn {\n"
    + "  background: #182238;\n"
    + "  border: 1.5px solid rgba(255, 255, 255, 0.14);\n"
    + "  color: #eef1f8;\n"
    + "  padding: 11px 14px;\n"
    + "  border-radius: 8px;\n"
    + "  font-size: 0.88rem;\n"
    + "  font-weight: 600;\n"
    + "  text-align: left;\n"
    + "  cursor: pointer;\n"
    + "  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease, border-color 0.18s ease;\n"
    + "  font-family: inherit;\n"
    + "}\n"
    + ".vc-option-btn:hover { background: #4f7fff; border-color: #4f7fff; color: #ffffff; transform: translateY(-1px); }\n"
    + ".vc-faq-item { background: #182238; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; align-self: stretch; }\n"
    + ".vc-faq-q { position: relative; padding: 11px 34px 11px 14px; font-size: 0.88rem; font-weight: 600; cursor: pointer; color: #eef1f8; }\n"
    + ".vc-faq-q::after { content: '+'; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #4f7fff; font-weight: 700; font-size: 1.1rem; transition: transform 0.2s ease; }\n"
    + ".vc-faq-item.vc-open .vc-faq-q::after { transform: translateY(-50%) rotate(45deg); }\n"
    + ".vc-faq-a { max-height: 0; overflow: hidden; font-size: 0.85rem; color: #8b96b3; padding: 0 14px; transition: max-height 0.25s ease, padding 0.25s ease; }\n"
    + ".vc-faq-item.vc-open .vc-faq-a { max-height: 160px; padding: 0 14px 12px; }\n"
    + ".vc-form { background: #182238; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; align-self: stretch; display: flex; flex-direction: column; gap: 10px; }\n"
    + ".vc-form label { font-size: 0.8rem; font-weight: 600; color: #eef1f8; }\n"
    + ".vc-form input, .vc-form textarea {\n"
    + "  width: 100%;\n"
    + "  padding: 10px 12px;\n"
    + "  border: 1px solid rgba(255, 255, 255, 0.14);\n"
    + "  border-radius: 8px;\n"
    + "  font-family: inherit;\n"
    + "  font-size: 0.88rem;\n"
    + "  resize: vertical;\n"
    + "  background: #0d1220;\n"
    + "  color: #eef1f8;\n"
    + "  box-sizing: border-box;\n"
    + "}\n"
    + ".vc-form input:focus, .vc-form textarea:focus { outline: none; border-color: #4f7fff; }\n"
    + ".vc-form .vc-submit {\n"
    + "  margin-top: 4px;\n"
    + "  background: #4f7fff;\n"
    + "  color: #ffffff;\n"
    + "  border: none;\n"
    + "  padding: 12px;\n"
    + "  border-radius: 8px;\n"
    + "  font-weight: 700;\n"
    + "  font-size: 0.9rem;\n"
    + "  cursor: pointer;\n"
    + "  transition: background 0.2s ease;\n"
    + "  font-family: inherit;\n"
    + "}\n"
    + ".vc-form .vc-submit:hover { background: #7aa0ff; }\n"
    + ".vc-form .vc-submit:disabled { opacity: 0.6; cursor: not-allowed; }\n"
    + ".vc-form .vc-error { color: #ff6b6b; font-size: 0.78rem; display: none; }\n"
    + ".vc-thankyou { align-self: stretch; background: #182238; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 26px 18px; text-align: center; }\n"
    + ".vc-thankyou .vc-check {\n"
    + "  width: 48px;\n"
    + "  height: 48px;\n"
    + "  border-radius: 8px;\n"
    + "  background: rgba(79, 127, 255, 0.14);\n"
    + "  color: #7aa0ff;\n"
    + "  font-size: 1.4rem;\n"
    + "  display: flex;\n"
    + "  align-items: center;\n"
    + "  justify-content: center;\n"
    + "  margin: 0 auto 14px;\n"
    + "}\n"
    + ".vc-thankyou h4 { font-size: 1rem; margin: 0 0 6px; color: #ffffff; }\n"
    + ".vc-thankyou p { font-size: 0.85rem; color: #8b96b3; margin: 0; }\n"
    + ".vc-typing { align-self: flex-start; background: #182238; border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 16px; border-radius: 10px 10px 10px 2px; display: flex; gap: 4px; align-items: center; }\n"
    + ".vc-typing span { width: 6px; height: 6px; border-radius: 50%; background: #8b96b3; opacity: 0.5; animation: vc-blink 1.2s infinite ease-in-out; display: block; }\n"
    + ".vc-typing span:nth-child(2) { animation-delay: 0.15s; }\n"
    + ".vc-typing span:nth-child(3) { animation-delay: 0.3s; }\n"
    + "@keyframes vc-blink { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }\n"
    + ".vc-footer { padding: 10px 16px; text-align: center; font-size: 0.72rem; color: #8b96b3; border-top: 1px solid rgba(255, 255, 255, 0.08); background: #121a2c; flex-shrink: 0; }\n"
    + "@media (max-width: 480px) {\n"
    + "  #vc-window { right: 16px; left: 16px; width: auto; bottom: 92px; }\n"
    + "  #vc-bubble { right: 16px; bottom: 16px; }\n"
    + "}\n";

  var MARKUP_TEXT = ""
    + '<button id="vc-bubble" aria-label="Open chat">'
    + '<svg class="vc-chat-icon" viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.94 2 11.7c0 2.61 1.36 4.95 3.5 6.53V22l3.6-2.02c.93.24 1.9.37 2.9.37 5.52 0 10-3.94 10-8.65S17.52 3 12 3z"/></svg>'
    + '<svg class="vc-close-icon" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.3 1.41 1.41 6.3-6.3 6.3 6.3 1.41-1.41-6.3-6.3 6.3-6.3z"/></svg>'
    + '</button>'
    + '<div id="vc-window">'
    + '  <div class="vc-header">'
    + '    <div class="vc-header-info">'
    + '      <div>'
    + '        <h4>Business Solutions Hub</h4>'
    + '        <div class="vc-status"><span class="vc-status-dot"></span> Usually responds within minutes</div>'
    + '      </div>'
    + '    </div>'
    + '    <button class="vc-header-close" id="vc-close" aria-label="Close chat">&#10005;</button>'
    + '  </div>'
    + '  <div class="vc-body" id="vc-body"></div>'
    + '  <div class="vc-footer">Free and unlimited chat &middot; Created by Lone Coder</div>'
    + '</div>';

  /** Inject the widget's stylesheet into <head> once, no matter how many roots init. */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    document.head.appendChild(style);
  }

  /** Build the bubble + window DOM inside the given root element. */
  function mount(root) {
    root.innerHTML = MARKUP_TEXT;
    return {
      bubble: root.querySelector("#vc-bubble"),
      win: root.querySelector("#vc-window"),
      body: root.querySelector("#vc-body"),
      closeBtn: root.querySelector("#vc-close")
    };
  }

  /** Wire up the full chat state machine. Mirrors the original inline widget 1:1. */
  function initChat(el, formspreeAction) {
    var bubble = el.bubble, win = el.win, body = el.body, closeBtn = el.closeBtn;
    var started = false;

    function scrollToBottom() {
      body.scrollTop = body.scrollHeight;
    }

    function addBotMessage(text) {
      var node = document.createElement("div");
      node.className = "vc-msg";
      node.textContent = text;
      body.appendChild(node);
      scrollToBottom();
      return node;
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
      var node = document.createElement("div");
      node.className = "vc-msg vc-user";
      node.textContent = text;
      body.appendChild(node);
      scrollToBottom();
      return node;
    }

    function clearOptions() {
      body.querySelectorAll(".vc-options, .vc-form, .vc-thankyou").forEach(function (n) {
        n.remove();
      });
    }

    function backButton(onClick) {
      var wrap = document.createElement("div");
      wrap.className = "vc-options";
      var btn = document.createElement("button");
      btn.className = "vc-option-btn";
      btn.textContent = "Back to Menu";
      btn.addEventListener("click", function () {
        addUserMessage("Back to Menu");
        onClick();
      });
      wrap.appendChild(btn);
      body.appendChild(wrap);
      scrollToBottom();
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
      addBotMessageWithDelay(
        "You can view our full range of growth solutions and pricing tiers right here in the pricing section on this page. Let us know if you need a custom quote.",
        function () { backButton(showMainMenu); }
      );
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
          q.addEventListener("click", function () { item.classList.toggle("vc-open"); });
          item.appendChild(q);
          item.appendChild(a);
          body.appendChild(item);
        });
        backButton(showMainMenu);
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

          if (!formspreeAction) {
            errorBox.textContent = "This widget has no data-formspree endpoint configured.";
            errorBox.style.display = "block";
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
            return;
          }

          fetch(formspreeAction, {
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
              errorBox.textContent = "Something went wrong. Please try again.";
              errorBox.style.display = "block";
              submitBtn.disabled = false;
              submitBtn.textContent = "Send Message";
            });
        });

        body.appendChild(form);
        scrollToBottom();
        backButton(showMainMenu);
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
      backButton(showMainMenu);
    }

    function openChat() {
      win.classList.add("vc-visible");
      bubble.classList.add("vc-open");
      if (!started) {
        started = true;
        addBotMessageWithDelay(
          "Hello. Welcome to our Business Solutions Hub. Looking to scale your business or improve your marketing? Please choose an option below:",
          showMainMenu
        );
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
  }

  function autoInit() {
    var root = document.getElementById("custom-chat-widget");
    if (!root) return;
    var formspreeAction = root.getAttribute("data-formspree") || "";
    injectStyles();
    var el = mount(root);
    initChat(el, formspreeAction);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
})();
