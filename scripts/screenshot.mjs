import { chromium } from "@playwright/test";

const url = process.env.SCREENSHOT_URL || "http://127.0.0.1:4173/";
const outPath = process.env.SCREENSHOT_PATH || "docs/ui.png";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });

  await page.goto(url, { waitUntil: "networkidle" });
  await sleep(600); // let fonts settle

  await page.screenshot({ path: outPath, fullPage: true });

  await browser.close();
  console.log(`✅ Screenshot saved: ${outPath}`);
})();
