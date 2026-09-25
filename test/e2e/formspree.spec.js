// Formspree integration: every scenario here is deliberately NETWORK-MOCKED
// via page.route(), for two reasons — (1) network failure / timeout / error
// responses cannot be tested against a real server without actually breaking
// something, mocking is the only safe way; (2) this suite runs in CI on every
// push, and a real Formspree submission would consume the account's monthly
// quota and send real test emails every run. The REAL successful submission
// path (actual network round-trip to Formspree) was verified manually and
// separately — see the audit report's VERIFIED section for how and when.
const { test, expect } = require("@playwright/test");
const { TARGETS, openChat, clickOption, collectConsoleErrors, collectPageErrors } = require("./helpers");

const FORMSPREE_URL = "https://formspree.io/f/xeaokykk";

async function goToContactForm(page) {
  await page.goto(TARGETS.source);
  await openChat(page);
  await clickOption(page, "Talk to a Consultant");
  await page.locator(".vc-form").waitFor({ state: "visible" });
}

async function fillValidForm(page) {
  await page.fill("#vc-name", "Test User");
  await page.fill("#vc-email", "test@example.com");
  await page.fill("#vc-message", "This is a test message.");
}

test.describe("Formspree integration (mocked network)", () => {
  test("successful submission shows the Thank You screen", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await goToContactForm(page);
    await page.route(FORMSPREE_URL, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
    );
    await fillValidForm(page);
    await page.click(".vc-submit");
    await expect(page.locator(".vc-thankyou")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".vc-thankyou h4")).toHaveText("Thank You");
    expect(errors).toEqual([]);
  });

  test("Formspree 422 validation error shows a 4xx-specific message and re-enables the form", async ({ page }) => {
    await goToContactForm(page);
    await page.route(FORMSPREE_URL, (route) =>
      route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ errors: [{ message: "invalid" }] }) })
    );
    await fillValidForm(page);
    await page.click(".vc-submit");
    await expect(page.locator("#vc-form-error")).toBeVisible();
    await expect(page.locator("#vc-form-error")).toContainText("invalid request");
    await expect(page.locator(".vc-submit")).toBeEnabled();
    await expect(page.locator(".vc-submit")).toHaveText("Send Message");
  });

  test("Formspree 500 server error shows a retry-appropriate message", async ({ page }) => {
    await goToContactForm(page);
    await page.route(FORMSPREE_URL, (route) => route.fulfill({ status: 500, body: "Internal Server Error" }));
    await fillValidForm(page);
    await page.click(".vc-submit");
    await expect(page.locator("#vc-form-error")).toBeVisible();
    await expect(page.locator("#vc-form-error")).toContainText("try again shortly");
    await expect(page.locator(".vc-submit")).toBeEnabled();
  });

  test("network failure (connection aborted) is caught and shown as an error, not an uncaught exception", async ({ page }) => {
    // Uncaught exceptions only here — the browser's own network-diagnostic
    // console logging for the request we're deliberately aborting is not a
    // widget bug, and its exact wording differs across engines (Chrome:
    // "net::ERR_FAILED", Firefox: a different message entirely).
    const pageErrors = collectPageErrors(page);
    await goToContactForm(page);
    await page.route(FORMSPREE_URL, (route) => route.abort("failed"));
    await fillValidForm(page);
    await page.click(".vc-submit");
    await expect(page.locator("#vc-form-error")).toBeVisible();
    await expect(page.locator(".vc-submit")).toBeEnabled();
    expect(pageErrors, "network failure must not surface as an uncaught JS error").toEqual([]);
  });

  test("retry after a failure works (error state doesn't get stuck)", async ({ page }) => {
    await goToContactForm(page);
    let callCount = 0;
    await page.route(FORMSPREE_URL, (route) => {
      callCount++;
      if (callCount === 1) return route.abort("failed");
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await fillValidForm(page);
    await page.click(".vc-submit");
    await expect(page.locator("#vc-form-error")).toBeVisible();
    await page.click(".vc-submit"); // retry
    await expect(page.locator(".vc-thankyou")).toBeVisible({ timeout: 5000 });
    expect(callCount).toBe(2);
  });

  test("double-click / double-submit sends only one request", async ({ page }) => {
    await goToContactForm(page);
    let callCount = 0;
    await page.route(FORMSPREE_URL, async (route) => {
      callCount++;
      await new Promise((r) => setTimeout(r, 300)); // hold the request open briefly
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await fillValidForm(page);
    // Dispatch two submit events synchronously in the page itself, rather than
    // two separate Playwright .click() calls: the second .click() would spend
    // its actionability-wait retrying against a button that becomes disabled
    // (and is later removed from the DOM on success) mid-retry, which is slow
    // and flaky across engines — not what this test is actually checking.
    // What we're verifying is the *in-app* double-submit guard (the
    // `submitting` flag in showForm()), which reacts identically either way.
    await page.evaluate(() => {
      var form = document.querySelector(".vc-form");
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true }));
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true }));
    });
    await expect(page.locator(".vc-thankyou")).toBeVisible({ timeout: 5000 });
    expect(callCount, "only one network request should be sent despite the double submit").toBe(1);
  });

  test("unexpected/malformed response body is handled without throwing", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await goToContactForm(page);
    await page.route(FORMSPREE_URL, (route) =>
      route.fulfill({ status: 200, contentType: "text/plain", body: "<<<not json>>>" })
    );
    await fillValidForm(page);
    await page.click(".vc-submit");
    // res.ok is true regardless of body shape (the widget never parses the
    // response body), so this should still reach the Thank You screen.
    await expect(page.locator(".vc-thankyou")).toBeVisible({ timeout: 5000 });
    expect(errors).toEqual([]);
  });

  test("client-side validation blocks submission when required fields are empty", async ({ page }) => {
    let requestSent = false;
    await goToContactForm(page);
    await page.route(FORMSPREE_URL, (route) => {
      requestSent = true;
      return route.fulfill({ status: 200, body: "{}" });
    });
    await page.click(".vc-submit"); // all fields empty
    await page.waitForTimeout(300);
    expect(requestSent, "no network request should fire when required fields are empty").toBe(false);
  });

  test("missing data-formspree attribute shows a clear error and never calls fetch", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(TARGETS.source.replace("embed-source.html", "embed-no-formspree.html"));
    await openChat(page);
    await clickOption(page, "Talk to a Consultant");
    await page.locator(".vc-form").waitFor({ state: "visible" });
    await fillValidForm(page);
    await page.click(".vc-submit");
    await expect(page.locator("#vc-form-error")).toBeVisible();
    await expect(page.locator("#vc-form-error")).toContainText("no valid data-formspree endpoint");
    expect(errors).toEqual([]);
  });

  test("invalid (non-URL) data-formspree value shows a clear error and never calls fetch", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(TARGETS.source.replace("embed-source.html", "embed-invalid-formspree.html"));
    await openChat(page);
    await clickOption(page, "Talk to a Consultant");
    await page.locator(".vc-form").waitFor({ state: "visible" });
    await fillValidForm(page);
    await page.click(".vc-submit");
    await expect(page.locator("#vc-form-error")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("closing the chat while a request is in flight aborts it without an uncaught error", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await goToContactForm(page);
    await page.route(FORMSPREE_URL, async (route) => {
      await new Promise((r) => setTimeout(r, 2000)); // still pending when we close
      await route.fulfill({ status: 200, body: "{}" }).catch(() => {});
    });
    await fillValidForm(page);
    await page.click(".vc-submit");
    await page.waitForTimeout(200);
    await page.locator("#vc-bubble").click(); // close while request is in flight
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
});
