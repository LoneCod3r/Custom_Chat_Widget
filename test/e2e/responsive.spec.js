const { test, expect } = require("@playwright/test");
const { TARGETS, openChat } = require("./helpers");

test.describe("responsive layout", () => {
  test("desktop viewport: window is a fixed-width panel that stays within the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(TARGETS.source);
    await openChat(page);
    const box = await page.locator("#vc-window").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1280);
    expect(box.y + box.height).toBeLessThanOrEqual(900);
  });

  test("narrow mobile viewport (320px): window goes full-bleed and never overflows horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(TARGETS.source);
    await openChat(page);
    const box = await page.locator("#vc-window").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("bubble stays within viewport bounds at a very short viewport height (300px)", async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 300 });
    await page.goto(TARGETS.source);
    const box = await page.locator("#vc-bubble").boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(300);
  });

  test("scrolling within the message body works and does not scroll the host page", async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto(TARGETS.source);
    await openChat(page);
    // Open FAQ so there's enough content to make .vc-body scrollable, then
    // confirm the host page's own scroll position is unaffected.
    await page.locator(".vc-option-btn", { hasText: "FAQ" }).click();
    await page.waitForFunction(() => document.querySelectorAll(".vc-faq-q").length === 3);
    const hostScrollBefore = await page.evaluate(() => window.scrollY);
    await page.locator("#vc-body").evaluate((el) => { el.scrollTop = el.scrollHeight; });
    const hostScrollAfter = await page.evaluate(() => window.scrollY);
    expect(hostScrollAfter).toBe(hostScrollBefore);
  });
});
