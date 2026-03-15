/**
 * update-refs.js
 * Fetches current Webhallen Config options, picks the best PC at each price
 * tier, writes refs.json, and rebuilds the public HTML.
 *
 * Run manually : node update-refs.js
 * Scheduled    : monthly via GitHub Actions or Windows Task Scheduler
 */

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const WEBHALLEN_URL = "https://www.webhallen.com/se/category/13852-Webhallen-Config";
const JINA_PREFIX   = "https://r.jina.ai/";
const POLLINATIONS  = "https://text.pollinations.ai/";
const REFS_FILE     = "./refs.json";
const LOG_FILE      = "./update-refs.log";

const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { writeFileSync(LOG_FILE, line + "\n", { flag: "a" }); } catch {}
};

async function fetchWebhallenConfigs() {
  log("Fetching Webhallen Config page...");
  const res = await fetch(`${JINA_PREFIX}${WEBHALLEN_URL}`, {
    headers: { Accept: "text/plain", "X-Return-Format": "text" },
  });
  if (!res.ok) throw new Error(`Jina fetch failed: ${res.status}`);
  const text = await res.text();
  log(`Fetched ${text.length} chars`);
  return text.slice(0, 6000);
}

async function pickBestOptions(pageText) {
  log("Asking AI to identify best options at each tier...");
  const prompt = `You are a PC hardware advisor. Below is current product data from Webhallen (Swedish retailer).
Pick the BEST currently-available gaming desktop at each price tier (SEK):
- Tier 1: 14,000–16,000 kr
- Tier 2: 18,000–22,000 kr
- Tier 3: 27,000–33,000 kr

Return ONLY valid JSON, no prose:
{"tier1":"cpu, gpu, ram, storage, ~price kr, year","tier2":"...","tier3":"..."}

PRODUCT DATA:
${pageText}`;

  const res = await fetch(POLLINATIONS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai-fast", messages: [{ role: "user", content: prompt }], seed: 1 }),
  });
  if (!res.ok) throw new Error(`AI call failed: ${res.status}`);
  const raw = await res.text();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON in AI response");
  return JSON.parse(raw.slice(start, end + 1));
}

(async () => {
  try {
    log("=== update-refs.js started ===");

    const pageText = await fetchWebhallenConfigs();
    const tiers    = await pickBestOptions(pageText);

    log(`Tiers found: ${JSON.stringify(tiers)}`);

    const refs = {
      updated: new Date().toISOString().slice(0, 10),
      tier1: tiers.tier1,
      tier2: tiers.tier2,
      tier3: tiers.tier3,
    };

    writeFileSync(REFS_FILE, JSON.stringify(refs, null, 2) + "\n", "utf8");
    log("refs.json updated");

    // --refs-only flag: CI uses this to skip building (it builds separately)
    // Without the flag, local/manual runs will also rebuild the public HTML
    const refsOnly = process.argv.includes("--refs-only");
    if (!refsOnly) {
      log("Rebuilding public HTML...");
      execSync("npm run build:public", { stdio: "inherit" });
      log("Build complete");
    } else {
      log("--refs-only: skipping build (CI will build separately)");
    }

    log("=== update-refs.js finished successfully ===");
  } catch (err) {
    log(`ERROR: ${err.message}`);
    process.exit(1);
  }
})();
