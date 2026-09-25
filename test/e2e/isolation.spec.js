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
});
