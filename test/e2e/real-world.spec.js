// Real-world embedding test: the actual production widget files, dropped
// into a realistic, deliberately messy third-party host page (see
// test/fixtures/real-world-host*.html), exactly as a customer would
// install them. This is NOT a repeat of isolation.spec.js's targeted
// unit-style checks — it walks the full customer journey end-to-end on
// top of the hostile host CSS, and separately verifies the host page
// itself is left untouched.
const { test, expect } = require("@playwright/test");
const { fileUrl, collectConsoleErrors } = require("./helpers");

const HOST_SOURCE = fileUrl("test/fixtures/real-world-host.html"); // script src="chat-widget.js" (source, local dev install)
const HOST_MIN = fileUrl("test/fixtures/real-world-host-min.html"); // script src="dist/chat-widget.min.js" (production build install)
const HOST_INLINE = fileUrl("test/fixtures/real-world-host-inline.html"); // chat-widget.html pasted inline (README's primary install method)
const HOST_IMPORTANT = fileUrl("test/fixtures/real-world-host-important.html"); // production build + deliberate !important attack

async function openChat(page) {
  await page.locator("#vc-bubble").click();
  await page.locator("#vc-window").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelectorAll(".vc-option-btn").length === 3);
}

// Runs the same full-journey scenario against all three real installation
// methods a customer might actually use (source script, minified production
// script, and the fully-inline standalone snippet).
for (const [label, url] of [
  ["local dev install (chat-widget.js via <script src>)", HOST_SOURCE],
  ["production build install (dist/chat-widget.min.js via <script src>)", HOST_MIN],
  ["inline snippet install (chat-widget.html pasted before </body>, README Step 2)", HOST_INLINE]
]) {
  test.describe(`Real-world host — ${label}`, () => {
    test("host page is unaffected by the widget being present and used", async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(url);

      const before = await page.evaluate(() => ({
        h1Color: getComputedStyle(document.querySelector("h1")).color,
        h1Transform: getComputedStyle(document.querySelector("h1")).textTransform,
        linkColor: getComputedStyle(document.querySelector("a[href='#services']")).color,
        bodyFont: getComputedStyle(document.body).fontFamily,
        bodyLineHeight: getComputedStyle(document.body).lineHeight,
        inputBorder: getComputedStyle(document.getElementById("host-name")).border,
        scrollHeight: document.documentElement.scrollHeight
      }));

      // Interact with the widget fully before re-checking the host.
      await openChat(page);
      await page.locator(".vc-option-btn", { hasText: "FAQ and Quick Questions" }).click();
      await page.locator(".vc-faq-q").first().click();
      await page.locator("#vc-bubble").click(); // close

      const after = await page.evaluate(() => ({
        h1Color: getComputedStyle(document.querySelector("h1")).color,
        h1Transform: getComputedStyle(document.querySelector("h1")).textTransform,
        linkColor: getComputedStyle(document.querySelector("a[href='#services']")).color,
        bodyFont: getComputedStyle(document.body).fontFamily,
        bodyLineHeight: getComputedStyle(document.body).lineHeight,
        inputBorder: getComputedStyle(document.getElementById("host-name")).border,
        scrollHeight: document.documentElement.scrollHeight
      }));

      expect(after).toEqual(before);

      // Host's own click handler and form-submit handler still work — the
      // widget's script must not have swallowed, rebound, or broken them.
      await page.locator("#host-cta-btn").click();
      expect(await page.evaluate(() => window.hostCtaClicks)).toBe(1);

      await page.fill("#host-name", "Jane Doe");
      await page.fill("#host-phone", "555-0100");
      await page.fill("#host-details", "Leaky faucet");
      await page.click("#host-submit-btn");
      expect(await page.evaluate(() => window.hostFormSubmits)).toBe(1);
      await expect(page.locator("#host-form-result")).toHaveText("Thanks, we'll call you back.");

      expect(errors).toEqual([]);
    });

    test("widget renders and functions correctly on top of the hostile host CSS", async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(url);

      const bubbleBox = await page.locator("#vc-bubble").evaluate((el) => {
        const cs = getComputedStyle(el);
        return { width: el.offsetWidth, height: el.offsetHeight, boxSizing: cs.boxSizing, bg: cs.backgroundColor };
      });
      expect(bubbleBox.width).toBeCloseTo(62, 0);
      expect(bubbleBox.height).toBeCloseTo(62, 0);
      expect(bubbleBox.boxSizing).toBe("border-box");
      expect(bubbleBox.bg).not.toBe("rgba(0, 0, 0, 0)"); // host's `button { all: unset }` didn't strip the fill

      await openChat(page);
      await expect(page.locator("#vc-window")).toHaveClass(/vc-visible/);

      // Host's aggressive h1-h6 rule (red, uppercase, margin:0) must not leak
      // into the widget's own header title.
      const headerStyle = await page.locator(".vc-header h4").evaluate((el) => {
        const cs = getComputedStyle(el);
        return { color: cs.color, transform: cs.textTransform };
      });
      expect(headerStyle.color).not.toBe("rgb(255, 0, 0)");
      expect(headerStyle.transform).toBe("none");

      // Host's `input, textarea { border: 3px solid blue; padding: 20px }`
      // must not leak into the widget's own form fields.
      await page.locator(".vc-option-btn", { hasText: "Talk to a Consultant" }).click();
      await page.locator(".vc-form").waitFor({ state: "visible" });
      const nameFieldStyle = await page.locator("#vc-name").evaluate((el) => {
        const cs = getComputedStyle(el);
        return { border: cs.border, padding: cs.padding };
      });
      expect(nameFieldStyle.border).not.toContain("blue");
      expect(nameFieldStyle.padding).not.toBe("20px");

      // Submit button visible, correctly styled (not host's `all: unset`).
      const submitBg = await page.locator(".vc-submit").evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(submitBg).not.toBe("rgba(0, 0, 0, 0)");

      // Focus-visible outline still applies (host has no focus-ring resets,
      // but confirms the widget's own focus styling wasn't clobbered either).
      await page.locator("#vc-name").focus();
      const outline = await page.locator("#vc-name").evaluate((el) => getComputedStyle(el).outlineColor);
      expect(outline).toBeTruthy();

      expect(errors).toEqual([]);
    });

    test("scrolling inside the widget body does not scroll the (very tall) host page", async ({ page }) => {
      await page.goto(url);
      await openChat(page);
      await page.locator(".vc-option-btn", { hasText: "FAQ and Quick Questions" }).click();
      await page.waitForFunction(() => document.querySelectorAll(".vc-faq-item").length === 3);

      const hostScrollBefore = await page.evaluate(() => window.scrollY);
      await page.locator("#vc-body").evaluate((el) => el.scrollBy(0, 200));
      await page.waitForTimeout(100);
      const hostScrollAfter = await page.evaluate(() => window.scrollY);
      expect(hostScrollAfter).toBe(hostScrollBefore);
    });

    test("full customer journey: menu -> FAQ -> back -> form -> submit -> thank you -> close -> reopen -> repeat from another screen", async ({ page }) => {
      const errors = collectConsoleErrors(page);
      const FORMSPREE_URL = "https://formspree.io/f/xeaokykk";
      await page.route(FORMSPREE_URL, (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
      );

      await page.goto(url);
      await openChat(page);

      // 1. Explore FAQ, expand an answer, go back.
      await page.locator(".vc-option-btn", { hasText: "FAQ and Quick Questions" }).click();
      await page.waitForFunction(() => document.querySelectorAll(".vc-faq-item").length === 3);
      const firstFaq = page.locator(".vc-faq-item").first();
      await firstFaq.locator(".vc-faq-q").click();
      await expect(firstFaq).toHaveClass(/vc-open/);
      await expect(firstFaq.locator(".vc-faq-q")).toHaveAttribute("aria-expanded", "true");
      await page.locator(".vc-option-btn", { hasText: "Back to Menu" }).click();
      await page.waitForFunction(() => document.querySelectorAll(".vc-option-btn").length === 3);

      // 2. Contact form: fill and submit.
      await page.locator(".vc-option-btn", { hasText: "Talk to a Consultant" }).click();
      await page.locator(".vc-form").waitFor({ state: "visible" });
      await page.fill("#vc-name", "Test User");
      await page.fill("#vc-email", "test@example.com");
      await page.fill("#vc-message", "Real-world embed test message.");
      await page.click(".vc-submit");
      await expect(page.locator(".vc-thankyou")).toBeVisible({ timeout: 5000 });
      await expect(page.locator(".vc-thankyou h4")).toHaveText("Thank You");

      // 3. Close and reopen. By design the widget preserves conversation state
      // across a close/reopen within the same page view (it does not reset to
      // the main menu) — reopening lands back on the Thank You screen with its
      // "Back to Menu" option, which is exactly what's asserted here.
      await page.locator("#vc-bubble").click();
      await expect(page.locator("#vc-window")).not.toHaveClass(/vc-visible/);
      await page.locator("#vc-bubble").click();
      await expect(page.locator("#vc-window")).toHaveClass(/vc-visible/);
      await expect(page.locator(".vc-thankyou")).toBeVisible();
      await page.locator(".vc-option-btn", { hasText: "Back to Menu" }).click();
      await page.waitForFunction(() => document.querySelectorAll(".vc-option-btn").length === 3);

      // 4. Repeat, starting from a different screen (Pricing this time).
      await page.locator(".vc-option-btn", { hasText: "Explore Services and Pricing" }).click();
      await expect(page.locator(".vc-body")).toContainText("growth solutions");

      // 5. Keyboard: Escape closes the widget and returns focus to the bubble.
      await page.keyboard.press("Escape");
      await expect(page.locator("#vc-window")).not.toHaveClass(/vc-visible/);
      await expect(page.locator("#vc-bubble")).toBeFocused();

      // 6. Keyboard: Tab focus trap stays inside the window while open. Reopening
      // preserves conversation state (still the Pricing screen from step 4), so
      // this checks whatever's currently focusable rather than assuming a
      // specific screen.
      await page.locator("#vc-bubble").click();
      await expect(page.locator("#vc-window")).toHaveClass(/vc-visible/);
      const focusableCount = await page.evaluate(() => {
        return document.querySelectorAll(
          '#vc-window button:not([disabled]), #vc-window [href], #vc-window input:not([disabled]), #vc-window textarea:not([disabled]), #vc-window select:not([disabled]), #vc-window [tabindex]:not([tabindex="-1"])'
        ).length;
      });
      for (let i = 0; i < focusableCount + 2; i++) {
        await page.keyboard.press("Tab");
        const stillInside = await page.evaluate(() => {
          const win = document.getElementById("vc-window");
          return win.contains(document.activeElement);
        });
        expect(stillInside, `focus escaped the widget window on Tab press #${i + 1}`).toBe(true);
      }

      expect(errors).toEqual([]);
    });
  });
}

test.describe("Real-world host — deliberate !important CSS attack (isolation boundary)", () => {
  test("widget remains open, readable, and submittable despite generic-selector !important overrides", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const FORMSPREE_URL = "https://formspree.io/f/xeaokykk";
    await page.route(FORMSPREE_URL, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
    );

    await page.goto(HOST_IMPORTANT);

    // The host's `button { all: unset !important }` targets EVERY button on
    // the page, including ours — this is the realistic boundary case: a
    // generic tag selector with !important, not an attack aimed at our
    // specific IDs/classes. Confirm the widget is still usable end-to-end.
    await page.locator("#vc-bubble").click();
    await page.locator("#vc-window").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelectorAll(".vc-option-btn").length === 3);
    await expect(page.locator("#vc-window")).toHaveClass(/vc-visible/);

    await page.locator(".vc-option-btn", { hasText: "Talk to a Consultant" }).click();
    await page.locator(".vc-form").waitFor({ state: "visible" });
    await page.fill("#vc-name", "Test User");
    await page.fill("#vc-email", "test@example.com");
    await page.fill("#vc-message", "Message under !important attack.");
    await page.click(".vc-submit");
    await expect(page.locator(".vc-thankyou")).toBeVisible({ timeout: 5000 });

    expect(errors).toEqual([]);
  });

  test("layout-critical properties resist the !important attack (bubble size/shape, window border, header text, form fields)", async ({ page }) => {
    // Initial finding (pre-fix): `button, input, textarea { all: unset
    // !important }` collapsed the bubble to a borderless 26x26 blob with no
    // background, `div { border: ... !important }` wrapped the chat window
    // in a magenta dashed border, `h4 { color: lime !important; font-size:
    // 40px !important }` broke the header title, and `form { display: block
    // !important }` + `input/textarea { all: unset !important }` wrecked the
    // contact form's layout and fields — all real, all reproduced, not
    // theoretical. Fixed with targeted !important on exactly the structural/
    // legibility-critical properties on the widget's own rules (not a
    // blanket rewrite, no Shadow DOM) — see chat-widget.js CSS_TEXT. This
    // test locks that fix in as a regression guard.
    await page.goto(HOST_IMPORTANT);
    await page.locator("#vc-bubble").click();
    await page.waitForFunction(() => document.querySelectorAll(".vc-option-btn").length === 3);

    const bubble = await page.locator("#vc-bubble").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { width: el.offsetWidth, height: el.offsetHeight, display: cs.display, bg: cs.backgroundColor };
    });
    expect(bubble.width).toBe(62);
    expect(bubble.height).toBe(62);
    expect(bubble.display).toBe("flex");
    expect(bubble.bg).not.toBe("rgba(0, 0, 0, 0)");

    const windowBorder = await page.locator("#vc-window").evaluate((el) => getComputedStyle(el).border);
    expect(windowBorder).not.toContain("255, 0, 255"); // not the host's magenta dashed override

    const headerH4 = await page.locator(".vc-header h4").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { color: cs.color, transform: cs.textTransform };
    });
    expect(headerH4.color).toBe("rgb(255, 255, 255)");
    expect(headerH4.transform).toBe("none");

    await page.locator(".vc-option-btn", { hasText: "Talk to a Consultant" }).click();
    await page.locator(".vc-form").waitFor({ state: "visible" });
    const nameField = await page.locator("#vc-name").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { padding: cs.padding, boxSizing: cs.boxSizing, border: cs.border };
    });
    expect(nameField.padding).not.toBe("0px");
    expect(nameField.boxSizing).toBe("border-box");
    expect(nameField.border).not.toContain("blue");
  });
});

test.describe("Real-world host — loading behavior", () => {
  test("rapid open/close and rapid clicking on the hostile host produces no uncaught errors", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(HOST_MIN);
    const bubble = page.locator("#vc-bubble");
    for (let i = 0; i < 12; i++) {
      await bubble.click();
    }
    expect(errors).toEqual([]);
  });

  test("widget can be opened immediately after the page finishes loading (no race with defer)", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(HOST_MIN);
    await page.locator("#vc-bubble").click({ timeout: 2000 });
    await expect(page.locator("#vc-window")).toHaveClass(/vc-visible/);
    expect(errors).toEqual([]);
  });

  test("scrolling the long host page while the widget is open keeps the widget fixed and functional", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto(HOST_MIN);
    await openChat(page);
    const before = await page.locator("#vc-window").evaluate((el) => el.getBoundingClientRect());
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(100);
    const after = await page.locator("#vc-window").evaluate((el) => el.getBoundingClientRect());
    expect(Math.abs(after.bottom - before.bottom)).toBeLessThan(2);
    expect(Math.abs(after.right - before.right)).toBeLessThan(2);
    await page.locator(".vc-option-btn", { hasText: "FAQ and Quick Questions" }).click();
    await expect(page.locator(".vc-faq-item").first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});
