// Full user-flow regression test, run against all 5 shipped widget copies,
// across every configured browser engine (see playwright.config.js).
const { test, expect } = require("@playwright/test");
const { TARGETS, openChat, clickOption, collectConsoleErrors } = require("./helpers");

for (const [name, url] of Object.entries(TARGETS)) {
  test.describe(`full flow — ${name}`, () => {
    test(`open, menu, FAQ expand/collapse, back, contact form, close (${name})`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(url);

      // Open
      await openChat(page);
      await expect(page.locator("#vc-window")).toHaveClass(/vc-visible/);
      await expect(page.locator("#vc-bubble")).toHaveAttribute("aria-expanded", "true");

      const menuLabels = await page.locator(".vc-option-btn").allTextContents();
      expect(menuLabels.some((l) => l.includes("Explore Services"))).toBeTruthy();
      expect(menuLabels.some((l) => l.includes("FAQ"))).toBeTruthy();
      expect(menuLabels.some((l) => l.includes("Talk to a Consultant"))).toBeTruthy();

      // FAQ: exactly 3 questions, each with real text (regression: overflow:hidden bug)
      await clickOption(page, "FAQ");
      await page.waitForFunction(() => document.querySelectorAll(".vc-faq-q").length === 3);
      const questions = await page.locator(".vc-faq-q").allTextContents();
      expect(questions).toHaveLength(3);
      for (const q of questions) expect(q.trim().length).toBeGreaterThan(0);

      const faqItemOverflow = await page.locator(".vc-faq-item").first().evaluate((el) => getComputedStyle(el).overflow);
      expect(faqItemOverflow).not.toBe("hidden");

      // Expand first FAQ answer, confirm aria-expanded flips and content becomes visible
      const firstQuestion = page.locator(".vc-faq-q").first();
      await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
      const heightBefore = await page.locator(".vc-faq-a").first().evaluate((el) => el.getBoundingClientRect().height);
      await firstQuestion.click();
      await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
      await page.waitForFunction(
        (before) => document.querySelector(".vc-faq-a").getBoundingClientRect().height > before,
        heightBefore
      );
      const answerText = await page.locator(".vc-faq-a").first().textContent();
      expect(answerText.trim().length).toBeGreaterThan(0);

      // Back to menu from FAQ
      await clickOption(page, "Back to Menu");
      await page.waitForFunction(() => document.querySelectorAll(".vc-option-btn").length === 3);

      // Contact form: fields present, and — regression guard — a Back to Menu option
      // must always be offered (previously missing, leaving users stuck on this screen)
      await clickOption(page, "Talk to a Consultant");
      await page.locator(".vc-form").waitFor({ state: "visible" });
      await expect(page.locator(".vc-form input, .vc-form textarea")).toHaveCount(3);
      await expect(page.locator(".vc-option-btn", { hasText: "Back to Menu" })).toBeVisible();

      // Close
      await page.locator("#vc-bubble").click();
      await expect(page.locator("#vc-window")).not.toHaveClass(/vc-visible/);
      await expect(page.locator("#vc-bubble")).toHaveAttribute("aria-expanded", "false");

      expect(errors, "no console/page errors during the full flow").toEqual([]);
    });

    test(`reopening preserves state instead of restarting the welcome message (${name})`, async ({ page }) => {
      await page.goto(url);
      await openChat(page);
      const firstMessageCountOpen1 = await page.locator(".vc-msg").count();

      // close then reopen
      await page.locator("#vc-bubble").click();
      await page.locator("#vc-bubble").click();
      await page.waitForTimeout(100);

      const messageCountOpen2 = await page.locator(".vc-msg").count();
      // Welcome message must not be re-added a second time
      expect(messageCountOpen2).toBe(firstMessageCountOpen1);
    });
  });
}
