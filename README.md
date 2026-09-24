# Custom Chat Widget — Modular Embed Architecture

A self-hosted chat widget — no third-party service, no volume limits, no fees. The widget ships as a single **embed script** (`chat-widget.js`) that programmatically injects its own CSS, builds its DOM at runtime, and mounts onto one root `<div>` — the same pattern used by commercial embeds like Tawk.to or Crisp, but self-hosted and dependency-free.

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

> **[`/demo`](demo/index.html) is not part of the widget.** It's a sample business page showing the widget in context — screenshots above are taken from it.

---

## ✨ Refactored Features

- 🪶 **Ultra-Light Footprint:** end-users paste a 3-line HTML snippet — no `<style>` block, no inline `<script>` body to maintain.
- ⚡ **Dynamic DOM Injection:** JS builds and mounts `#vc-bubble` and `#vc-window` at runtime — nothing needs to pre-exist in your markup.
- 🎨 **Encapsulated Styling:** CSS is compiled as a string inside JS and injected into `<head>` once, so it can never bleed into (or be broken by) the host page's stylesheet.
- 🔌 **Zero-Config Deployment:** the Formspree endpoint is read straight off a `data-formspree` attribute — no editing JS source to configure it.
- 📦 **Two ship weights:** full source (`chat-widget.js`, readable, ~19KB) or the compact production build (`dist/chat-widget.min.js`, ~16KB).

---

## 🛠 The New Implementation Snippet (Usage)

Paste this before `</body>`:

```html
<!-- Custom Chat Widget -->
<div id="custom-chat-widget" data-formspree="YOUR_FORMSPREE_ENDPOINT"></div>
<script src="dist/chat-widget.min.js" defer></script>
```

Get a free endpoint at [formspree.io](https://formspree.io) (50 submissions/month on the free tier) and drop it into `data-formspree`. That's the entire integration — no other setup.

---

## 📂 Architectural Code Refactoring

[`chat-widget.js`](chat-widget.js) is a single IIFE with four responsibilities, in order of execution:

| Step | Function | What it does |
|---|---|---|
| 1 | `autoInit()` | Finds `#custom-chat-widget` on the page, reads `data-formspree` off it |
| 2 | `injectStyles()` | Appends a `<style id="vc-widget-styles">` tag to `<head>` from the `CSS_TEXT` string — guarded so it only ever runs once |
| 3 | `mount(root)` | Sets `root.innerHTML` from the `MARKUP_TEXT` string, then queries the bubble/window/body/close-button references back out |
| 4 | `initChat(el, formspreeAction)` | Wires every event listener — bubble toggle (`.vc-open` / `.vc-visible`), the menu → FAQ → form state transitions, and the `fetch()` lifecycle against `formspreeAction` |

The state machine itself (welcome message → main menu → plans/FAQ/form → thank-you) is unchanged from the original inline widget — only *how it's delivered* changed. See the full commented source in the file itself for the implementation.

---

## 🔧 Component Layer Mapping

| Asset | Role / Function | Footprint |
| :--- | :--- | :--- |
| `chat-widget.js` | Full source — DOM creation, style injection, state machine. Human-readable, for forking/customizing. | ~19 KB |
| `dist/chat-widget.min.js` | Production bundle — comments and indentation stripped. Drop-in for the 3-line embed. | ~16 KB |
| `chat-widget.html` | Alternative: the same widget as a raw `<style>`+HTML+`<script>` block, for projects that don't want to host a separate `.js` file. | ~17 KB |
| `chat-widget.min.html` | Compact version of the above. | ~14 KB |

> Both formats implement the identical bot/FAQ/contact-form logic — pick the embed script for a clean 3-line integration, or the HTML block if you'd rather inline everything into one page.

---

## 🚀 Future Performance Optimizations

- [ ] **Shadow DOM Integration** — wrap `#custom-chat-widget`'s contents in a Shadow Root for airtight style isolation (currently relies on unique `.vc-*` class names + injected `<head>` styles, which is safe but not bulletproof against an aggressive host stylesheet).
- [ ] **Build Pipeline** — wire up a one-command esbuild/Rollup config to regenerate `dist/chat-widget.min.js` from `chat-widget.js` automatically instead of the current manual minify pass.
- [ ] **Multi-instance support** — current version assumes one `#custom-chat-widget` root per page; scoping the internal IDs would allow multiple independently-configured widgets.

---

## ☕ Support the Creator

[![Support via Bank Transfer](https://img.shields.io/badge/Support-Bank%20Transfer-4f7fff?style=for-the-badge&logo=buymeacoffee&logoColor=white)](#)

If this widget saved you time, a small transfer helps keep free projects like this maintained.

| 🏦 Bank Transfer |  |
|---|---|
| **IBAN** | `BG75STSA93000029979791` |

> Entirely optional — free to use, modify, and deploy without any obligation (see [LICENSE](LICENSE)). ⭐ Star the repo if it was useful!
