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
  var REQUEST_TIMEOUT_MS = 15000;

  var CSS_TEXT = "\n"
    + "#vc-bubble {\n"
    + "  position: fixed;\n"
    + "  bottom: 24px;\n"
    + "  right: 24px;\n"
    + "  width: 62px;\n"
    + "  height: 62px;\n"
    + "  border-radius: 50%;\n"
    + "  background: #3d5fd1;\n"
    + "  box-shadow: 0 10px 28px rgba(79, 127, 255, 0.4);\n"
    + "  border: none;\n"
    + "  cursor: pointer;\n"
    + "  display: flex;\n"
    + "  align-items: center;\n"
    + "  justify-content: center;\n"
    + "  z-index: 2147483000;\n"
    + "  transition: transform 0.2s ease, background 0.2s ease;\n"
    + "  box-sizing: border-box;\n"
    + "  line-height: normal;\n"
    + "  margin: 0;\n"
    + "  padding: 0;\n"
    + "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;\n"
    + "  -webkit-appearance: none;\n"
    + "  appearance: none;\n"
    + "}\n"
    + "#vc-bubble:hover {\n"
    + "  background: #33509e;\n"
    + "  transform: translateY(-2px) scale(1.04);\n"
    + "}\n"
    + "#vc-bubble:focus-visible, .vc-header-close:focus-visible, .vc-option-btn:focus-visible, .vc-faq-q:focus-visible, .vc-submit:focus-visible {\n"
    + "  outline: 2px solid #7aa0ff;\n"
    + "  outline-offset: 2px;\n"
    + "}\n"
    + "#vc-bubble svg {\n"
    + "  width: 26px;\n"
    + "  height: 26px;\n"
    + "  fill: #ffffff;\n"
    + "  pointer-events: none;\n"
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
    + "  z-index: 2147482999;\n"
    + "  opacity: 0;\n"
    + "  transform: translateY(16px) scale(0.98);\n"
    + "  pointer-events: none;\n"
    + "  transition: opacity 0.22s ease, transform 0.22s ease;\n"
    + "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;\n"
    + "  box-sizing: border-box;\n"
    + "}\n"
    + "#vc-window *, #vc-window *::before, #vc-window *::after { box-sizing: border-box; }\n"
    + "#vc-window:focus { outline: none; }\n"
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
    + ".vc-header h4 { font-size: 0.98rem; font-weight: 700; margin: 0; color: #ffffff; text-transform: none; }\n"
    + ".vc-header .vc-status { font-size: 0.76rem; opacity: 0.8; display: flex; align-items: center; gap: 5px; color: #ffffff; }\n"
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
    + "  font-family: inherit;\n"
    + "  margin: 0;\n"
    + "  padding: 0;\n"
    + "  -webkit-appearance: none;\n"
    + "  appearance: none;\n"
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
    + ".vc-msg.vc-user { align-self: flex-end; background: #3d5fd1; color: #ffffff; border-color: #3d5fd1; border-radius: 10px 10px 2px 10px; }\n"
    + "@keyframes vc-pop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }\n"
    + ".vc-options { display: flex; flex-direction: column; gap: 8px; align-self: stretch; margin: 0; padding: 0; list-style: none; }\n"
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
    + "  width: 100%;\n"
    + "  display: block;\n"
    + "  margin: 0;\n"
    + "  -webkit-appearance: none;\n"
    + "  appearance: none;\n"
    + "}\n"
    + ".vc-option-btn:hover { background: #3d5fd1; border-color: #3d5fd1; color: #ffffff; transform: translateY(-1px); }\n"
    + ".vc-faq-item { background: #182238; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; align-self: stretch; }\n"
    + ".vc-faq-q {\n"
    + "  position: relative;\n"
    + "  padding: 11px 34px 11px 14px;\n"
    + "  font-size: 0.88rem;\n"
    + "  font-weight: 600;\n"
    + "  cursor: pointer;\n"
    + "  color: #eef1f8;\n"
    + "  background: transparent;\n"
    + "  border: none;\n"
    + "  text-align: left;\n"
    + "  width: 100%;\n"
    + "  display: block;\n"
    + "  font-family: inherit;\n"
    + "  margin: 0;\n"
    + "  -webkit-appearance: none;\n"
    + "  appearance: none;\n"
    + "}\n"
    + ".vc-faq-q::after { content: '+'; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #4f7fff; font-weight: 700; font-size: 1.1rem; transition: transform 0.2s ease; }\n"
    + ".vc-faq-item.vc-open .vc-faq-q::after { transform: translateY(-50%) rotate(45deg); }\n"
    + ".vc-faq-a { max-height: 0; overflow: hidden; font-size: 0.85rem; color: #a6b0c8; padding: 0 14px; transition: max-height 0.25s ease, padding 0.25s ease; margin: 0; }\n"
    + ".vc-faq-item.vc-open .vc-faq-a { max-height: 160px; padding: 0 14px 12px; }\n"
    + ".vc-form { background: #182238; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; align-self: stretch; display: flex; flex-direction: column; gap: 10px; margin: 0; }\n"
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
    + "  line-height: normal;\n"
    + "  appearance: none;\n"
    + "  -webkit-appearance: none;\n"
    + "}\n"
    + ".vc-form input:focus, .vc-form textarea:focus { outline: none; border-color: #4f7fff; }\n"
    + ".vc-form .vc-submit {\n"
    + "  margin-top: 4px;\n"
    + "  background: #3d5fd1;\n"
    + "  color: #ffffff;\n"
    + "  border: none;\n"
    + "  padding: 12px;\n"
    + "  border-radius: 8px;\n"
    + "  font-weight: 700;\n"
    + "  font-size: 0.9rem;\n"
    + "  cursor: pointer;\n"
    + "  transition: background 0.2s ease;\n"
    + "  font-family: inherit;\n"
    + "  width: 100%;\n"
    + "  -webkit-appearance: none;\n"
    + "  appearance: none;\n"
    + "}\n"
    + ".vc-form .vc-submit:hover { background: #33509e; }\n"
    + ".vc-form .vc-submit:disabled, .vc-form .vc-submit[aria-disabled=\"true\"] { opacity: 0.6; cursor: not-allowed; }\n"
    + ".vc-form .vc-error { color: #ff8a8a; font-size: 0.78rem; display: none; }\n"
    + ".vc-thankyou { align-self: stretch; background: #182238; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 26px 18px; text-align: center; margin: 0; }\n"
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
    + ".vc-thankyou h4 { font-size: 1rem; margin: 0 0 6px; color: #ffffff; text-transform: none; font-weight: 700; }\n"
    + ".vc-thankyou p { font-size: 0.85rem; color: #a6b0c8; margin: 0; }\n"
    + ".vc-typing { align-self: flex-start; background: #182238; border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 16px; border-radius: 10px 10px 10px 2px; display: flex; gap: 4px; align-items: center; }\n"
    + ".vc-typing span { width: 6px; height: 6px; border-radius: 50%; background: #a6b0c8; opacity: 0.5; animation: vc-blink 1.2s infinite ease-in-out; display: block; }\n"
    + ".vc-typing span:nth-child(2) { animation-delay: 0.15s; }\n"
    + ".vc-typing span:nth-child(3) { animation-delay: 0.3s; }\n"
    + "@keyframes vc-blink { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }\n"
    + ".vc-footer { padding: 10px 16px; text-align: center; font-size: 0.72rem; color: #a6b0c8; border-top: 1px solid rgba(255, 255, 255, 0.08); background: #121a2c; flex-shrink: 0; }\n"
    + "@media (max-width: 480px) {\n"
    + "  #vc-window { right: 16px; left: 16px; width: auto; bottom: 92px; }\n"
    + "  #vc-bubble { right: 16px; bottom: 16px; }\n"
    + "}\n"
    + "@media (prefers-reduced-motion: reduce) {\n"
    + "  #vc-bubble, #vc-window, .vc-msg, .vc-option-btn, .vc-faq-q::after, .vc-faq-a, .vc-header-close, .vc-typing span, .vc-form .vc-submit {\n"
    + "    animation-duration: 0.001ms !important;\n"
    + "    animation-iteration-count: 1 !important;\n"
    + "    transition-duration: 0.001ms !important;\n"
    + "  }\n"
    + "}\n";

  var MARKUP_TEXT = ""
    + '<button id="vc-bubble" type="button" aria-label="Open chat" aria-haspopup="dialog" aria-expanded="false" aria-controls="vc-window">'
    + '<svg class="vc-chat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.48 3 2 6.94 2 11.7c0 2.61 1.36 4.95 3.5 6.53V22l3.6-2.02c.93.24 1.9.37 2.9.37 5.52 0 10-3.94 10-8.65S17.52 3 12 3z"/></svg>'
    + '<svg class="vc-close-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.3 1.41 1.41 6.3-6.3 6.3 6.3 1.41-1.41-6.3-6.3 6.3-6.3z"/></svg>'
    + '</button>'
    + '<div id="vc-window" role="dialog" aria-modal="true" aria-label="Business Solutions Hub chat" tabindex="-1">'
    + '  <div class="vc-header">'
    + '    <div class="vc-header-info">'
    + '      <div>'
    + '        <h4>Business Solutions Hub</h4>'
    + '        <div class="vc-status"><span class="vc-status-dot" aria-hidden="true"></span> Usually responds within minutes</div>'
    + '      </div>'
    + '    </div>'
    + '    <button class="vc-header-close" type="button" id="vc-close" aria-label="Close chat">&#10005;</button>'
    + '  </div>'
    + '  <div class="vc-body" id="vc-body" role="log" aria-live="polite" aria-relevant="additions"></div>'
    + '  <div class="vc-footer">Free and unlimited chat &middot; Created by Lone Coder</div>'
    + '</div>';

  /**
   * Inject the widget's stylesheet into <head> once, no matter how many roots
   * init. Accepts an optional CSP nonce (from a host page using a strict
   * `style-src 'nonce-...'` policy instead of 'unsafe-inline') — without it,
   * a page with that kind of CSP would silently block this <style> tag and
   * the widget would render completely unstyled.
   */
  function injectStyles(nonce) {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    if (nonce) style.setAttribute("nonce", nonce);
    style.textContent = CSS_TEXT;
    document.head.appendChild(style);
  }

  /** Build the bubble + window DOM inside the given root element. */
  function mount(root) {
    // Re-parent to a direct child of <body> if it isn't already one.
    // #vc-bubble/#vc-window use `position: fixed`, which the CSS spec anchors
    // to the *nearest ancestor with a transform/will-change/filter/perspective*
    // instead of the true viewport, if one exists — a very common "GPU
    // acceleration" pattern on real SPA root containers (React/Vue app divs,
    // animation libraries). Moving the root out to <body> sidesteps that
    // regardless of where the host page happens to place the embed <div>.
    if (root.parentNode !== document.body) {
      document.body.appendChild(root);
    }
    root.innerHTML = MARKUP_TEXT;
    return {
      bubble: root.querySelector("#vc-bubble"),
      win: root.querySelector("#vc-window"),
      body: root.querySelector("#vc-body"),
      closeBtn: root.querySelector("#vc-close")
    };
  }

  function getFocusable(container) {
    var nodes = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    return Array.prototype.filter.call(nodes, function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  /** Wire up the full chat state machine. Mirrors the original inline widget 1:1, plus a11y/robustness. */
  function initChat(el, formspreeAction) {
    var bubble = el.bubble, win = el.win, body = el.body, closeBtn = el.closeBtn;
    var started = false;
    var activeAbortController = null;

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
      typing.setAttribute("aria-hidden", "true");
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
      btn.type = "button";
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
        b.type = "button";
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
        faqs.forEach(function (f, index) {
          var item = document.createElement("div");
          item.className = "vc-faq-item";

          var answerId = "vc-faq-a-" + index + "-" + Date.now();

          var q = document.createElement("button");
          q.type = "button";
          q.className = "vc-faq-q";
          q.textContent = f.q;
          q.setAttribute("aria-expanded", "false");
          q.setAttribute("aria-controls", answerId);

          var a = document.createElement("div");
          a.className = "vc-faq-a";
          a.id = answerId;
          a.textContent = f.a;

          q.addEventListener("click", function () {
            var isOpen = item.classList.toggle("vc-open");
            q.setAttribute("aria-expanded", isOpen ? "true" : "false");
          });

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
        form.setAttribute("novalidate", "novalidate");
        form.innerHTML =
          '<label for="vc-name">Name</label>' +
          '<input type="text" id="vc-name" name="name" required placeholder="Your name" autocomplete="name">' +
          '<label for="vc-email">Email</label>' +
          '<input type="email" id="vc-email" name="email" required placeholder="you@example.com" autocomplete="email">' +
          '<label for="vc-message">Message</label>' +
          '<textarea id="vc-message" name="message" rows="3" required placeholder="How can we help?"></textarea>' +
          '<div class="vc-error" id="vc-form-error" role="alert"></div>' +
          '<button type="submit" class="vc-submit">Send Message</button>';

        var submitting = false;

        function setError(message) {
          var errorBox = form.querySelector("#vc-form-error");
          errorBox.textContent = message;
          errorBox.style.display = "block";
        }

        function clearError() {
          var errorBox = form.querySelector("#vc-form-error");
          errorBox.textContent = "";
          errorBox.style.display = "none";
        }

        function resetSubmitState() {
          submitting = false;
          var submitBtn = form.querySelector(".vc-submit");
          // aria-disabled (not the native disabled attribute) during the
          // in-flight request: a truly `disabled` button loses focusability,
          // which — if the user submitted by pressing the button itself
          // rather than Enter in a field — silently drops keyboard/screen-
          // reader focus back to <body> the instant the request starts.
          // Re-entry is already blocked by the `submitting` flag above, so
          // aria-disabled costs nothing functionally while staying focusable.
          submitBtn.removeAttribute("aria-disabled");
          submitBtn.textContent = "Send Message";
        }

        form.addEventListener("submit", function (e) {
          e.preventDefault();

          if (submitting) return; // guards against double-submit (double-click, Enter + click, etc.)

          var nameField = form.querySelector("#vc-name");
          var emailField = form.querySelector("#vc-email");
          var messageField = form.querySelector("#vc-message");

          // Native HTML5 constraint validation (required / type=email) — surfaced
          // via the browser's built-in UI, and mirrored into our own error box
          // for screen readers / consistency with the rest of the widget's styling.
          if (!form.checkValidity()) {
            if (typeof form.reportValidity === "function") form.reportValidity();
            setError("Please fill in all fields with a valid email address.");
            return;
          }

          clearError();
          submitting = true;
          var submitBtn = form.querySelector(".vc-submit");
          submitBtn.setAttribute("aria-disabled", "true");
          submitBtn.textContent = "Sending...";

          var payload = {
            name: nameField.value,
            email: emailField.value,
            message: messageField.value
          };

          if (!formspreeAction || !/^https?:\/\//i.test(formspreeAction)) {
            setError("This widget has no valid data-formspree endpoint configured.");
            resetSubmitState();
            return;
          }

          if (activeAbortController) activeAbortController.abort();
          var controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
          activeAbortController = controller;

          var timeoutId = setTimeout(function () {
            if (controller) controller.abort();
          }, REQUEST_TIMEOUT_MS);

          var fetchPromise;
          try {
            fetchPromise = fetch(formspreeAction, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Accept": "application/json" },
              body: JSON.stringify(payload),
              signal: controller ? controller.signal : undefined
            });
          } catch (syncErr) {
            // Some environments throw synchronously on a malformed URL rather
            // than rejecting the returned promise — cover both paths.
            clearTimeout(timeoutId);
            setError("This widget's data-formspree endpoint looks invalid.");
            resetSubmitState();
            return;
          }

          fetchPromise
            .then(function (res) {
              clearTimeout(timeoutId);
              if (res.ok) {
                showThankYou();
              } else if (res.status === 429) {
                // Rate-limited — a distinct case from a validation error: the
                // request itself was fine, retrying shortly will likely work.
                setError("Too many messages sent recently. Please wait a moment and try again.");
                resetSubmitState();
              } else if (res.status >= 400 && res.status < 500) {
                setError("Your message could not be sent (invalid request). Please check the fields and try again.");
                resetSubmitState();
              } else {
                setError("The server could not process your message right now. Please try again shortly.");
                resetSubmitState();
              }
            })
            .catch(function (err) {
              clearTimeout(timeoutId);
              if (err && err.name === "AbortError") {
                setError("The request timed out. Please check your connection and try again.");
              } else {
                setError("Something went wrong. Please try again.");
              }
              resetSubmitState();
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
        '<div class="vc-check" aria-hidden="true">&#10003;</div>' +
        '<h4>Thank You</h4>' +
        '<p>A member of our team will contact you shortly via email.</p>';
      body.appendChild(box);
      backButton(showMainMenu);
    }

    function trapFocus(e) {
      if (e.key !== "Tab") return;
      var focusable = getFocusable(win);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function onWindowKeydown(e) {
      if (e.key === "Escape" || e.key === "Esc") {
        e.stopPropagation();
        closeChat();
        return;
      }
      trapFocus(e);
    }

    function openChat() {
      win.classList.add("vc-visible");
      bubble.classList.add("vc-open");
      bubble.setAttribute("aria-expanded", "true");
      bubble.setAttribute("aria-label", "Close chat");
      win.addEventListener("keydown", onWindowKeydown);
      win.focus();
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
      bubble.setAttribute("aria-expanded", "false");
      bubble.setAttribute("aria-label", "Open chat");
      win.removeEventListener("keydown", onWindowKeydown);
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
      }
      bubble.focus();
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
    if (root.getAttribute("data-vc-initialized") === "1") return; // guards against the script being loaded twice
    root.setAttribute("data-vc-initialized", "1");

    var formspreeAction = root.getAttribute("data-formspree") || "";
    var cspNonce = root.getAttribute("data-csp-nonce") || "";
    injectStyles(cspNonce);
    var el = mount(root);
    initChat(el, formspreeAction);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
})();
