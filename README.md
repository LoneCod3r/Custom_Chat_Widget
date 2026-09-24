# Apex Growth Partners — Website + Custom Chat Widget

A single-file, self-hosted business website with a built-in custom chat widget
(no third-party chat service, no volume limits, no monthly chat fees).

- `index.html` — the entire site: HTML, CSS, and JavaScript in one file.
- No build tools, no npm install, no framework required.

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

## 1. What's inside

| Feature | Details |
|---|---|
| Site sections | Header/nav, hero, services (features), pricing, CTA band, footer |
| Chat widget | Floating bubble, bottom-right, opens a chat window with a menu-driven bot |
| Chat options | Explore Services and Pricing, FAQ and Quick Questions, Talk to a Consultant |
| Contact form | Inside the chat widget, submits via [Formspree](https://formspree.io) to your email |
| Styling | Corporate palette — deep navy, dark slate, accent blue, white |

---

## 2. Quick install (fastest way to see it working)

1. Copy `index.html` to any folder on your computer.
2. Double-click it (or right-click → Open with → your browser).
3. The site loads directly from your file system — no server required to look at it.

**Note:** some browsers restrict scripts on `file://` pages. If the chat widget
or the contact form behaves oddly when opened this way, use the local-server
method below instead — it takes one extra command and avoids that entirely.

### Run it through a local server (recommended for testing the chat form)

If you have Python installed:

```bash
cd path/to/this/folder
python -m http.server 8000
```

Then open `http://localhost:8000/index.html` in your browser.

If you have Node.js installed instead:

```bash
npx serve .
```

---

## 3. Deploying it live (so real visitors can reach it)

Because this is a single static HTML file, it can be hosted anywhere that
serves static files. Pick whichever you already use:

- **Netlify / Vercel** — drag and drop the folder (or connect a Git repo) and deploy. Free tier is enough.
- **GitHub Pages** — push this folder to a repository, enable Pages in the repo settings, point it at the branch/folder.
- **Traditional web hosting (cPanel, FTP, etc.)** — upload `index.html` to your `public_html` (or equivalent) root via FTP/File Manager.
- **Any static file host** (S3 + CloudFront, Cloudflare Pages, Firebase Hosting, etc.) — upload `index.html` as-is.

No environment variables, no server-side code, and no database are required.

---

## 4. Setting up the contact form (Formspree)

The "Talk to a Consultant" option inside the chat widget submits messages to
[Formspree](https://formspree.io), a free service that forwards form
submissions straight to your email address.

1. Go to **https://formspree.io** and create a free account.
2. Click **New Form**, name it (e.g. "Website Contact"), and set the
   destination email to the inbox where you want messages delivered.
3. Copy the endpoint Formspree gives you — it looks like:
   `https://formspree.io/f/xxxxxxxx`
4. Open `index.html`, find this line near the top of the `<script>` block:

   ```js
   var FORMSPREE_ACTION = "https://formspree.io/f/xeaokykk";
   ```

5. Replace the URL with your own endpoint and save the file.
6. **First-time confirmation:** the very first submission to a brand-new
   Formspree form does not get delivered automatically — Formspree emails
   you a confirmation link instead. Submit one test message through the
   chat widget, then check your inbox and click that link. Every
   submission after that arrives normally.

The free Formspree plan currently allows 50 submissions/month. If you expect
higher volume, upgrade your Formspree plan or replace the `fetch()` call in
the script with a call to your own backend/email API.

---

## 5. Customizing the content

Everything lives in the one `index.html` file — open it in any text editor.

| To change... | Look for... |
|---|---|
| Company name / branding | `Apex Growth Partners` (appears in `<title>`, header logo, footer) |
| Hero headline & copy | The `<section class="hero">` block |
| Services / features | The three `.feature-card` blocks under `id="features"` |
| Pricing plans & prices | The two `.price-card` blocks under `id="pricing"` |
| Colors | The CSS variables at the top of the `<style>` block (`--navy`, `--blue`, etc.) |
| Chat welcome message | `addBotMessage("Hello. Welcome to our Business Solutions Hub...")` in the `<script>` block |
| Chat menu buttons | The `opts` array inside `showMainMenu()` |
| FAQ questions/answers | The `faqs` array inside `showFAQ()` |
| Pricing link the bot points to | `var PLANS_LINK = "#pricing";` near the top of the script |

No rebuild step is needed — just save the file and refresh the browser.

---

## 6. Browser support

Works in all modern evergreen browsers (Chrome, Edge, Firefox, Safari) on
desktop and mobile. No polyfills or transpilation are used.

---

## 7. Support the creator

If this template saved you time and you'd like to support further
development, donations are welcome via bank transfer:

**IBAN:** `BG75STSA93000029979791`

Entirely optional — the template is free to use, modify, and deploy without
any obligation.
