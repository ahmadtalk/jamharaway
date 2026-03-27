/**
 * Jamhara Puppeteer Screenshot Service
 * ─────────────────────────────────────
 * POST /screenshot  { url, width, height, scale? }  → PNG buffer
 * GET  /health      → { ok: true }
 *
 * Auth: X-Secret header must match PUPPET_SECRET env var
 */

const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

const PORT   = process.env.PORT ?? 3001;
const SECRET = process.env.PUPPET_SECRET ?? "";

// ── Auth middleware ────────────────────────────────────────────────────────────
function auth(req, res, next) {
  if (!SECRET) return next(); // dev: open
  const provided = req.headers["x-secret"] ?? "";
  if (provided !== SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true }));

// ── Screenshot endpoint ────────────────────────────────────────────────────────
app.post("/screenshot", auth, async (req, res) => {
  const { url, width = 1080, height = 1080, scale = 2 } = req.body;

  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    });

    const page = await browser.newPage();

    // ضبط حجم الـ viewport بدقة مضاعفة
    await page.setViewport({ width, height, deviceScaleFactor: scale });

    // تحميل الصفحة — networkidle0 يضمن اكتمال كل الموارد
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30_000,
    });

    // انتظار React hydration + تحميل الخطوط
    await page.waitForTimeout(800);

    // Screenshot للـ viewport كاملاً
    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width, height },
    });

    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(screenshot);

  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error("[screenshot] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Puppeteer service running on port ${PORT}`);
  console.log(`   Auth: ${SECRET ? "enabled" : "disabled (dev mode)"}`);
});
