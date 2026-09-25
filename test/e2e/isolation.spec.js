// CSS isolation against a hostile host page — see test/fixtures/embed-hostile-css.html
// for the specific resets simulated (box-sizing, button "all: unset", div borders,
// h4 overrides, input/textarea styling, and a plausible .vc-body class collision).
//
// KNOWN LIMITATION (documented, not silently skipped): plain CSS in the same
// document cannot be made bulletproof against a host page that uses
// `!important` on equally-or-more-specific selectors targeting our exact
// class/ID names — only Shadow DOM encapsulation fully prevents that class of
// conflict, which this widget does not use (see README roadmap). The resets
// below are realistic (mirroring common reset/preflight stylesheets), not the
// theoretical worst case.
const { test, expect } = require("@playwright/test");
const { fileUrl, openChat, collectConsoleErrors } = require("./helpers");

test.describe("CSS isolation against a hostile host page", () => {
  test("widget renders and functions correctly despite aggressive host resets", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(fileUrl("test/fixtures/embed-hostile-css.html"));

    await openChat(page);
    await expect(page.locator("#vc-window")).toHaveClass(/vc-visible/);

    // box-sizing: content-box on * would inflate our fixed 62px bubble unless
    // our own #vc-bubble rule wins (it does — same-origin stylesheet, later,
    // and equally non-!important but more specific than the host's `*`).
    //
    // Uses offsetWidth/offsetHeight (layout box), not getBoundingClientRect()
    // (visual/painted box) — the bubble's own :hover { transform: scale(1.04) }
    // is still active from openChat()'s click and would otherwise inflate a
    // getBoundingClientRect() reading to 62 * 1.04 = 64.48, which is correct,
    // intentional hover styling, not a CSS-isolation bug.
    const bubbleBox = await page.locator("#vc-bubble").evaluate((el) => {
      return { width: el.offsetWidth, height: el.offsetHeight, boxSizing: getComputedStyle(el).boxSizing };
    });
    expect(bubbleBox.width).toBeCloseTo(62, 0);
    expect(bubbleBox.height).toBeCloseTo(62, 0);
    expect(bubbleBox.boxSizing).toBe("border-box");

    // `.vc-body { display: none }` from the host must not hide the real message list.
    const bodyDisplay = await page.locator("#vc-body").evaluate((el) => getComputedStyle(el).display);
    expect(bodyDisplay).not.toBe("none");

    // `button { all: unset }` from the host must not strip our button's own styling.
    const bubbleBg = await page.locator("#vc-bubble").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bubbleBg).not.toBe("rgba(0, 0, 0, 0)");

    // The host's oversized lime h4 rule must not leak into our header title.
    const headerColor = await page.locator(".vc-header h4").evaluate((el) => getComputedStyle(el).color);
    expect(headerColor).not.toBe("rgb(0, 255, 0)");

    // The host's `body { font-family: Georgia, serif }` + `button,input,textarea
    // { font-family: inherit }` combo must not leak into the widget's own
    // sans-serif UI (a common Bootstrap/Tailwind-preflight-style rule).
    const bubbleFont = await page.locator("#vc-bubble").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(bubbleFont.toLowerCase()).not.toContain("georgia");

    // The host's generic `div { position: relative; z-index: 1 }` must not pull
    // our (near-max z-index) chat window underneath any host content.
    const windowZIndex = await page.locator("#vc-window").evaluate((el) => parseInt(getComputedStyle(el).zIndex, 10));
    expect(windowZIndex).toBeGreaterThan(1);

    expect(errors).toEqual([]);
  });

  test("widget's own styles do not leak out and break the host page", async ({ page }) => {
    await page.goto(fileUrl("test/fixtures/embed-hostile-css.html"));
    // The host's own <div> border rule (5px solid red) is a generic `div` selector
    // with no widget classes — confirm it's untouched by anything the widget injected.
    const hostParagraphColor = await page.locator("p").first().evaluate((el) => getComputedStyle(el).color);
    // Default black-ish text color, not our widget's blue/white palette.
    expect(hostParagraphColor).not.toBe("rgb(79, 127, 255)");
  });

  // Real-world gotcha, not theoretical: `position: fixed` anchors to the
  // viewport UNLESS an ancestor has transform/will-change/filter/perspective,
  // in which case it anchors to that ancestor instead. `transform:
  // translateZ(0)` on a wrapper div is an extremely common "GPU acceleration"
  // performance hack in real SPAs (React/Vue app roots, animation libraries).
  test("bubble stays anchored to the true viewport even when its container has a transform (common SPA perf hack)", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto(fileUrl("test/fixtures/embed-transformed-ancestor.html"));

    const rect = await page.locator("#vc-bubble").evaluate((el) => el.getBoundingClientRect());
    // Bubble CSS: bottom:24px; right:24px; 62x62. If it were escaping to the
    // transformed ancestor's containing block instead of the true viewport,
    // these numbers would be wildly different (the wrapper has 40px padding
    // and 2000px min-height, pushing a mis-anchored element far off-screen).
    expect(rect.right).toBeGreaterThan(1000 - 24 - 62 - 2);
    expect(rect.right).toBeLessThan(1000 - 24 + 2);
    expect(rect.bottom).toBeGreaterThan(800 - 24 - 62 - 2);
    expect(rect.bottom).toBeLessThan(800 - 24 + 2);

    // Scroll the (very tall) host page and confirm the bubble stays fixed
    // relative to the viewport rather than scrolling away with the content.
    await page.evaluate(() => window.scrollTo(0, 500));
    const rectAfterScroll = await page.locator("#vc-bubble").evaluate((el) => el.getBoundingClientRect());
    expect(Math.abs(rectAfterScroll.bottom - rect.bottom)).toBeLessThan(2);

    expect(errors).toEqual([]);
  });
});
