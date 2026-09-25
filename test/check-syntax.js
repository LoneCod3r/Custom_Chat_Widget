/*
 * Fast syntax check — no browser needed. Validates the two standalone
 * JS files directly, and extracts + validates every inline <script>
 * block from the HTML files (parsing only, never executes them).
 */
const fs = require("fs");
const vm = require("vm");

const JS_FILES = ["chat-widget.js", "dist/chat-widget.min.js"];
const HTML_FILES = ["chat-widget.html", "chat-widget.min.html", "demo/index.html"];

let failures = 0;

for (const file of JS_FILES) {
  try {
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: file });
    console.log("OK   " + file);
  } catch (err) {
    failures++;
    console.error("FAIL " + file + ": " + err.message);
  }
}

for (const file of HTML_FILES) {
  const html = fs.readFileSync(file, "utf8");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (scripts.length === 0) {
    failures++;
    console.error("FAIL " + file + ": no <script> block found");
    continue;
  }
  scripts.forEach((match, i) => {
    try {
      new vm.Script(match[1], { filename: file + " (inline script " + (i + 1) + ")" });
      console.log("OK   " + file + " (inline script " + (i + 1) + "/" + scripts.length + ")");
    } catch (err) {
      failures++;
      console.error("FAIL " + file + " (inline script " + (i + 1) + "): " + err.message);
    }
  });
}

if (failures > 0) {
  console.error("\n" + failures + " syntax error(s) found.");
  process.exit(1);
}
console.log("\nAll files passed syntax check.");
