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

## Using it on your own site

The widget is self-contained near the bottom of `index.html`, right before `</body>`:

1. Copy the widget CSS (`#vc-bubble` through the `@media (max-width: 480px)` block).
2. Copy the `<button id="vc-bubble">` and `<div id="vc-window">` markup.
3. Copy the `<script>` block that follows.
4. Update the copy/links to match your business (see **Customizing** below).

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
