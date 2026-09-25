const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
function fileUrl(relPath) {
  return "file://" + path.resolve(ROOT, relPath).replace(/\\/g, "/");
}

// The 5 shipped copies of the widget, as file:// URLs a Playwright page can load.
const TARGETS = {
  source: fileUrl("test/fixtures/embed-source.html"),
  minified: fileUrl("test/fixtures/embed-min.html"),
  html: fileUrl("chat-widget.html"),
  minHtml: fileUrl("chat-widget.min.html"),
  demo: fileUrl("demo/index.html")
};

async function openChat(page) {
  await page.locator("#vc-bubble").click();
  await page.locator("#vc-window").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelectorAll(".vc-option-btn").length === 3);
}

async function clickOption(page, text) {
  await page.locator(".vc-option-btn", { hasText: text }).click();
}

// Browser-native network diagnostics (e.g. Chrome logging "Failed to load
// resource: net::ERR_FAILED", or Firefox's differently-worded equivalent,
// when a request we deliberately aborted in a test fails) are not
// application errors — the widget's own catch() handler is what we're
// actually testing. Wording for these varies too much across engines to
// pattern-match reliably, so tests that deliberately trigger a network
// failure should use collectPageErrors() (uncaught exceptions only) instead
// of collectConsoleErrors() (which also flags console.error from real
// application code — useful everywhere that isn't intentionally breaking
// the network).
function collectConsoleErrors(page) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

function collectPageErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

module.exports = { fileUrl, TARGETS, openChat, clickOption, collectConsoleErrors, collectPageErrors };
