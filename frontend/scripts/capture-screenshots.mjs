import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../../docs/screenshots');

async function dismissOnboarding(page) {
  const skipBtn = page.locator('#onboardingSkipBtn');
  if (await skipBtn.count()) {
    if (await skipBtn.first().isVisible().catch(() => false)) {
      await skipBtn.first().click();
    }
  }
}

async function capture(page, name) {
  await dismissOnboarding(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, name), fullPage: true });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  isMobile: false,
  hasTouch: false,
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });

const guestBtn = page.locator('#authGuestBtn');
if (await guestBtn.isVisible().catch(() => false)) {
  await guestBtn.click();
  await page.waitForTimeout(600);
}

await capture(page, 'home.png');

await page.locator('.nav-link[data-view="discover"]').click();
await capture(page, 'discover.png');

await page.locator('.nav-link[data-view="rooms"]').click();
await capture(page, 'rooms.png');

const joinBtn = page.locator('.room-join').first();
if (await joinBtn.count()) {
  await joinBtn.click();
  await page.waitForTimeout(400);
  await capture(page, 'chat-room.png');
}

await page.locator('.nav-link[data-view="profile"]').click();
await capture(page, 'profile.png');

await page.locator('.nav-link[data-view="settings"]').click();
await capture(page, 'settings.png');

await browser.close();
console.log('Saved screenshots to', outputDir);
