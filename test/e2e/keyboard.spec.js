// Keyboard/focus-management coverage. Run against the canonical source
// (test/fixtures/embed-source.html loads chat-widget.js) — the other
// four shipped files share the same interaction logic (chat-widget.html /
// .min.html / dist bundle are generated from this file by build.js;
// demo/index.html carries the same logic hand-ported).
const { test, expect } = require("@playwright/test");
const { TARGETS, collectConsoleErrors } = require("./helpers");

test.describe("keyboard and focus management", () => {
  test("focus moves into the window on open, and back to the bubble on close", async ({ page }) => {
    await page.goto(TARGETS.source);
    await page.locator("#vc-bubble").click();
    await expect(page.locator("#vc-window")).toBeFocused();

    await page.locator("#vc-close").click();
    await expect(page.locator("#vc-bubble")).toBeFocused();
  });

  test("Escape closes the chat window", async ({ page }) => {
    await page.goto(TARGETS.source);
    await page.locator("#vc-bubble").click();
    await expect(page.locator("#vc-window")).toHaveClass(/vc-visible/);

    await page.keyboard.press("Escape");
    await expect(page.locator("#vc-window")).not.toHaveClass(/vc-visible/);
    await expect(page.locator("#vc-bubble")).toBeFocused();
  });

  test("Tab cycles forward and wraps within the open window (focus trap)", async ({ page }) => {
    await page.goto(TARGETS.source);
    await page.locator("#vc-bubble").click();
    await page.waitForFunction(() => document.querySelectorAll(".vc-option-btn").length === 3);

    // From the window itself, Tab should move to the first focusable descendant,
    // and repeatedly tabbing must never escape the dialog while it's open.
    const focusableCountBefore = await page.evaluate(() => {
      return document.querySelectorAll(
        '#vc-window button:not([disabled]), #vc-window [href], #vc-window input:not([disabled]), #vc-window textarea:not([disabled])'
      ).length;
    });
    expect(focusableCountBefore).toBeGreaterThan(0);

    for (let i = 0; i < focusableCountBefore + 3; i++) {
      await page.keyboard.press("Tab");
      const stillInsideWindow = await page.evaluate(() => {
        const active = document.activeElement;
        const win = document.getElementById("vc-window");
        return win === active || win.contains(active);
      });
      expect(stillInsideWindow, `focus must stay within #vc-window after ${i + 1} Tab presses`).toBeTruthy();
    }
  });

  test("FAQ questions are real buttons, keyboard-activatable via Enter", async ({ page }) => {
    await page.goto(TARGETS.source);
    await page.locator("#vc-bubble").click();
    await page.locator(".vc-option-btn", { hasText: "FAQ" }).click();
    await page.waitForFunction(() => document.querySelectorAll(".vc-faq-q").length === 3);

    const firstQuestion = page.locator(".vc-faq-q").first();
    await expect(firstQuestion).toHaveJSProperty("tagName", "BUTTON");
    await firstQuestion.focus();
    await page.keyboard.press("Enter");
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  });

  test("visible focus outline appears on keyboard focus (focus-visible)", async ({ page }) => {
    await page.goto(TARGETS.source);
    await page.locator("#vc-bubble").focus();
    const outline = await page.locator("#vc-bubble").evaluate((el) => getComputedStyle(el).outlineStyle);
    // Different engines report focus-visible outlines differently pre-interaction;
    // the important, portable assertion is that an outline rule exists at all
    // (outline-style isn't "none" once :focus-visible styles are defined for it).
    expect(["solid", "auto"]).toContain(outline);
  });

  test("no console errors during a full keyboard-only session", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(TARGETS.source);
    await page.locator("#vc-bubble").click();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Escape");
    expect(errors).toEqual([]);
  });
});
