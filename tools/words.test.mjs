// Fails if the site's copy uses a word we've agreed not to use (README →
// Writing, and the app repo's docs/10 → Words). Run with `npm test`.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../src/", import.meta.url).pathname;

// [pattern, what to write instead]
const BANNED = [
  [/\bin the loop\b/i, "can see, are told"],
  [/\bup and running\b/i, "ready to use"],
  [/\bsign(?:ed|s)?[- ]off\b/i, "approve, approval"],
  [/\bpaper chase\b|\bchasing paper\b/i, "collecting forms by hand"],
  [/\bin plain sight\b/i, "easy to see"],
  [/\bsettle[ds]?\b|\bsettlement\b/i, "paid into, paid, cleared"],
  [/\breconcil\w*/i, "check"],
  [/\bseamless\w*|\bstreamlin\w*|\bleverag\w*|\brobust\b/i, "say what happens"],
  [/\bonboarding\b/i, "setting up"],
  [/\breach out\b/i, "contact us"],
  [/\bledgers?\b/i, "record books"],
  [/\bpayroll\b/i, "salary deduction"],
  [/\bactually\b|\bsimply\b|\bfinally\b/i, "(leave it out)"],
  [/\bpayouts?\b|\bpaid out\b|\bpay(?:ing)? (?:it |them )?out\b/i, "payment to member, paid to the member"],
  [/\bdisburs\w*/i, "paid to the member"],
  [/\btenors?\b/i, "loan period"],
  [/\bprincipal\b/i, "amount borrowed"],
  [/\barrears\b/i, "unpaid repayments"],
  [/\b(?:loan|savings) products?\b/i, "loan type, savings type"],
  [/\bapproval stages?\b/i, "approval steps"],
  [/\baudit (?:log|trail)\b/i, "change history"],
  [/\brole permissions\b/i, "what each role can do"],
  [/\bdata imports?\b|\bimport(?:s|ed|ing)?\b/i, "upload from Excel"],
  [/\bexport(?:s|ed|ing)?\b/i, "download"],
  [/\brevers(?:e|ed|al|als|ing)\b/i, "cancel, cancelled"],
  [/\beligib\w*/i, "can apply, can’t apply yet"],
  [/\bworkbook\b|\btemplates?\b/i, "Excel file, blank Excel file, ready-made"],
  [/\bfine-grained\b|\bconsolidated\b/i, "say it plainly"],
  [/\bhelp centre\b/i, "Help Center (its name)"],
];

// Code, not copy: comments and a few attributes.
function copyOf(text) {
  return text
    .replace(/\{#[\s\S]*?#\}/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^export default\b/gm, "")
    .replace(/\b(?:class|id|href|src|data-[\w-]+|aria-controls|aria-labelledby|for)="[^"]*"/g, "")
    .replace(/\{\{[^}]*\}\}|\{%[^%]*%\}/g, "")
    .replace(/^(\s*)(?:visual|icon): .*$/gm, "");
}

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "assets" || name === "static") continue;
      yield* files(path);
    } else if (/\.(njk|md)$/.test(name) || (dir.endsWith("_data") && name.endsWith(".js"))) {
      yield path;
    }
  }
}

const problems = [];
for (const path of files(ROOT)) {
  copyOf(readFileSync(path, "utf8")).split("\n").forEach((line, i) => {
    for (const [rx, instead] of BANNED) {
      const m = line.match(rx);
      if (m) problems.push(`src/${relative(ROOT, path)}:${i + 1}: “${m[0]}” → ${instead}`);
    }
  });
}

if (problems.length) {
  console.error(`✗ ${problems.length} word${problems.length === 1 ? "" : "s"} to change:\n` + problems.join("\n"));
  process.exit(1);
}
console.log("✓ words: none of the avoided words are used");
