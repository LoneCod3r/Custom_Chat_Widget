# Custom Chat Widget

A self-hosted chat widget — no third-party service, no volume limits, no fees.

**[`chat-widget.html`](chat-widget.html) is the project.** One self-contained file — copy its contents into any page, right before `</body>`, and it works standalone. No build step, no dependencies.

Need a smaller footprint? [`chat-widget.min.html`](chat-widget.min.html) is the same widget with the CSS minified and comments/indentation stripped from the JS (~20% smaller, ~14KB vs ~17KB). Functionally identical — same file, same behavior.

**[`/demo`](demo/index.html) is not part of the widget.** It's a sample business page showing the widget in context — screenshots below are taken from it.

---

## Demo

<table>
  <tr>
    <td align="center"><strong>Contact form (desktop)</strong></td>
    <td align="center"><strong>Chat widget (mobile)</strong></td>
  </tr>
  <tr>
    <td><img src="demo/screenshots/04-chat-widget-contact-form-desktop.png" width="380" alt="Chat widget showing the Talk to a Consultant contact form"></td>
    <td><img src="demo/screenshots/05-chat-widget-mobile.png" width="380" alt="Chat widget open on a mobile viewport"></td>
  </tr>
</table>

---

## Usage

1. Copy everything in [`chat-widget.html`](chat-widget.html) into your own page, right before `</body>`.
2. In the `<script>` block, replace `FORMSPREE_ACTION` with your own endpoint from [formspree.io](https://formspree.io) (free tier: 50 submissions/month).
3. Edit the welcome message, header title, and menu option text to match your business — they're plain strings in the same script.

---

## ☕ Support the Creator

[![Support via Bank Transfer](https://img.shields.io/badge/Support-Bank%20Transfer-4f7fff?style=for-the-badge&logo=buymeacoffee&logoColor=white)](#)

If this widget saved you time, a small transfer helps keep free projects like this maintained.

| 🏦 Bank Transfer |  |
|---|---|
| **IBAN** | `BG75STSA93000029979791` |

> Entirely optional — free to use, modify, and deploy without any obligation (see [LICENSE](LICENSE)). ⭐ Star the repo if it was useful!
