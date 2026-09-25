const { test, expect } = require("@playwright/test");
const { fileUrl, collectConsoleErrors } = require("./helpers");

test.describe("robustness / edge cases", () => {
  test("data-csp-nonce is applied to the injected <style> tag (strict CSP support)", async ({ page }) => {
    // A host page with a strict `style-src 'nonce-...'` CSP (rather than
    // 'unsafe-inline') would otherwise silently block the injected stylesheet
    // and render the widget completely unstyled, with no console error to
    // explain why. data-csp-nonce lets that kind of host opt in.
    await page.goto(fileUrl("test/fixtures/embed-csp-nonce.html"));
    await page.waitForFunction(() => !!document.getElementById("vc-widget-styles"));
    const nonce = await page.locator("#vc-widget-styles").getAttribute("nonce");
    expect(nonce).toBe("test-nonce-abc123");
  });

  test("loading the script twice does not create duplicate widgets or throw", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(fileUrl("test/fixtures/embed-double-load.html"));

    // Only one bubble/window should exist, and the widget should still work.
    await expect(page.locator("#vc-bubble")).toHaveCount(1);
    await expect(page.locator("#vc-window")).toHaveCount(1);

    await page.locator("#vc-bubble").click();
    await page.waitForFunction(() => document.querySelectorAll(".vc-option-btn").length === 3);
    await expect(page.locator("#vc-window")).toHaveClass(/vc-visible/);

    expect(errors, "loading the script twice must not throw").toEqual([]);
  });

  test("rapid repeated bubble clicks do not desync open/close state", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(fileUrl("test/fixtures/embed-source.html"));
    const bubble = page.locator("#vc-bubble");
    for (let i = 0; i < 10; i++) {
      await bubble.click();
    }
    // 10 clicks = even number = ends closed
    await expect(page.locator("#vc-window")).not.toHaveClass(/vc-visible/);
    expect(errors).toEqual([]);
  });

  test("injectStyles only ever adds one <style id=vc-widget-styles> tag, even with two roots", async ({ page }) => {
    await page.goto(fileUrl("test/fixtures/embed-double-load.html"));
    const styleTagCount = await page.locator("#vc-widget-styles").count();
    expect(styleTagCount).toBe(1);
  });

  test("the widget script adds zero properties to the global window object", async ({ page }) => {
    // Baseline captured from the same file:// origin, same markup, just without
    // the <script> tag — avoids false positives from scheme/origin differences.
    await page.goto(fileUrl("test/fixtures/baseline-no-script.html"));
    const baselineGlobals = await page.evaluate(() => Object.keys(window));

    await page.goto(fileUrl("test/fixtures/embed-source.html"));
    await page.waitForFunction(() => !!document.getElementById("vc-bubble"));
    const afterScriptGlobals = await page.evaluate(() => Object.keys(window));

    const newGlobals = afterScriptGlobals.filter((k) => !baselineGlobals.includes(k));
    expect(newGlobals, "chat-widget.js is fully IIFE-wrapped and should never add window properties").toEqual([]);
  });
});
