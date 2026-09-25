/*
 * Smoke test for the Custom Chat Widget.
 *
 * Runs the same interaction flow (open -> menu -> FAQ -> expand answer ->
 * back -> contact form -> back) against every shipped copy of the widget,
 * in a real headless browser. Catches regressions that a plain syntax
 * check can't: e.g. the FAQ-items-render-blank rendering bug and the
 * missing "Back to Menu" button on the contact form, both fixed in this
 * repo's history and guarded against here.
 *
 * No network calls are made — the contact form is never submitted, only
 * checked for presence, so this runs hermetically in CI.
 */
const puppeteer = require("puppeteer");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const fileUrl = (relPath) => "file://" + path.resolve(ROOT, relPath).replace(/\\/g, "/");

const TARGETS = [
  { name: "chat-widget.js (source, via embed)", url: fileUrl("test/fixtures/embed-source.html") },
  { name: "dist/chat-widget.min.js (minified, via embed)", url: fileUrl("test/fixtures/embed-min.html") },
  { name: "chat-widget.html (inline, full source)", url: fileUrl("chat-widget.html") },
  { name: "chat-widget.min.html (inline, minified)", url: fileUrl("chat-widget.min.html") },
  { name: "demo/index.html (full demo page)", url: fileUrl("demo/index.html") }
];

function assert(condition, message) {
  if (!condition) throw new Error("FAIL: " + message);
}

async function clickButtonByText(page, text) {
  const buttons = await page.$$(".vc-option-btn");
  for (const btn of buttons) {
    const label = await page.evaluate((el) => el.textContent, btn);
    if (label.includes(text)) {
      await btn.click();
      return;
    }
  }
  throw new Error("no .vc-option-btn found containing text: " + text);
}

async function runTarget(browser, target) {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto(target.url, { waitUntil: "load" });

  // 1. Bubble opens the window
  await page.waitForSelector("#vc-bubble", { timeout: 5000 });
  await page.click("#vc-bubble");
  await page.waitForFunction(
    () => document.getElementById("vc-window").classList.contains("vc-visible"),
    { timeout: 5000 }
  );

  // 2. Welcome message + 3-option main menu appears
  await page.waitForFunction(
    () => document.querySelectorAll(".vc-option-btn").length === 3,
    { timeout: 5000 }
  );
  const menuLabels = await page.$$eval(".vc-option-btn", (els) => els.map((e) => e.textContent.trim()));
  assert(menuLabels.some((l) => l.includes("Explore Services")), "main menu missing 'Explore Services' option");
  assert(menuLabels.some((l) => l.includes("FAQ")), "main menu missing 'FAQ' option");
  assert(menuLabels.some((l) => l.includes("Talk to a Consultant")), "main menu missing 'Talk to a Consultant' option");

  // 3. FAQ: questions must exist with non-empty text, and the overflow:hidden
  //    regression must not be reintroduced on .vc-faq-item (it caused FAQ
  //    text to render blank despite correct DOM/computed styles — see repo history)
  await clickButtonByText(page, "FAQ");
  await page.waitForFunction(
    () => document.querySelectorAll(".vc-faq-q").length === 3,
    { timeout: 5000 }
  );
  const faqQuestions = await page.$$eval(".vc-faq-q", (els) => els.map((e) => e.textContent.trim()));
  assert(faqQuestions.length === 3, "expected 3 FAQ questions, got " + faqQuestions.length);
  faqQuestions.forEach((q, i) => assert(q.length > 0, "FAQ question " + i + " has empty text"));

  const faqItemOverflow = await page.$eval(".vc-faq-item", (el) => getComputedStyle(el).overflow);
  assert(faqItemOverflow !== "hidden", "REGRESSION: .vc-faq-item has overflow:hidden again — this previously caused FAQ text to render blank");

  // Expand the first answer and confirm it becomes visible
  const firstAnswerHeightBefore = await page.$eval(".vc-faq-a", (el) => el.getBoundingClientRect().height);
  await page.click(".vc-faq-q");
  await page.waitForFunction(
    (before) => document.querySelector(".vc-faq-a").getBoundingClientRect().height > before,
    { timeout: 3000 },
    firstAnswerHeightBefore
  );
  const faqAnswerText = await page.$eval(".vc-faq-a", (el) => el.textContent.trim());
  assert(faqAnswerText.length > 0, "FAQ answer has empty text after expanding");

  // 4. Back to menu from FAQ, then into the contact form
  await clickButtonByText(page, "Back to Menu");
  await page.waitForFunction(
    () => document.querySelectorAll(".vc-option-btn").length === 3,
    { timeout: 5000 }
  );

  await clickButtonByText(page, "Talk to a Consultant");
  await page.waitForSelector(".vc-form", { timeout: 5000 });
  const formFields = await page.$$eval(".vc-form input, .vc-form textarea", (els) => els.length);
  assert(formFields === 3, "expected 3 form fields (name/email/message), got " + formFields);

  // REGRESSION GUARD: contact form must offer a way back to the menu
  // (previously missing entirely — closing/reopening the chat left users stuck on the form)
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll(".vc-option-btn")).some((e) => e.textContent.includes("Back to Menu")),
    { timeout: 3000 }
  );

  // 5. Close the widget
  await page.click("#vc-bubble");
  await page.waitForFunction(
    () => !document.getElementById("vc-window").classList.contains("vc-visible"),
    { timeout: 5000 }
  );

  assert(consoleErrors.length === 0, "console errors detected: " + JSON.stringify(consoleErrors));

  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  let failures = 0;

  for (const target of TARGETS) {
    process.stdout.write("→ " + target.name + " ... ");
    try {
      await runTarget(browser, target);
      console.log("OK");
    } catch (err) {
      failures++;
      console.log("FAILED");
      console.error("  " + err.message);
    }
  }

  await browser.close();

  if (failures > 0) {
    console.error("\n" + failures + " of " + TARGETS.length + " target(s) failed.");
    process.exit(1);
  }
  console.log("\nAll " + TARGETS.length + " widget copies passed the smoke test.");
})();
