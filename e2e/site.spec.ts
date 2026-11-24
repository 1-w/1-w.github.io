import { expect, type Page, test } from '@playwright/test';
import { PNG } from 'pngjs';

type Rgb = readonly [number, number, number];

const BACKGROUND: Rgb = [0x05, 0x07, 0x0d];
const READY_TIMEOUT = 20_000;
// INTRO_SECONDS in src/brain-cloud.ts. Node cannot import that module (shader ?raw imports).
const INTRO_SECONDS = 12;
// MAX_FRAME_GAP in src/clock.ts, in ms: the largest step one frame adds to the site clock.
const STEP_MS = 100;
// Frame step of Playwright's fake requestAnimationFrame.
const FRAME_MS = 16;
// Edge (px) of the square blocks in which flicker sums the light.
const BLOCK = 32;

/** Share of pixels where any channel differs from `bg` by more than 24. */
function litFraction(png: Buffer, bg: Rgb): number {
  const image = PNG.sync.read(png);
  let lit = 0;
  for (let i = 0; i < image.data.length; i += 4) {
    if ([0, 1, 2].some((c) => Math.abs(image.data[i + c] - bg[c]) > 24)) {
      lit++;
    }
  }
  return lit / (image.width * image.height);
}

/** Light above `bg` (sum over the channels) per BLOCK x BLOCK block, row by row. */
function blockLight(png: Buffer, bg: Rgb): Float64Array {
  const image = PNG.sync.read(png);
  const columns = Math.ceil(image.width / BLOCK);
  const light = new Float64Array(columns * Math.ceil(image.height / BLOCK));
  for (let i = 0; i < image.data.length; i += 4) {
    const pixel = i / 4;
    const block = Math.floor(pixel / image.width / BLOCK) * columns + Math.floor((pixel % image.width) / BLOCK);
    light[block] += [0, 1, 2].reduce((sum, c) => sum + Math.max(0, image.data[i + c] - bg[c]), 0);
  }
  return light;
}

/**
 * Flicker of three consecutive frames: sum over the blocks of |b - (a + c) / 2| of the block
 * light, divided by the light of `b`. Smooth motion changes the light of a block about linearly
 * from frame to frame; a sprite whose light depends on where it falls between pixel centres does not.
 */
function flicker(frames: readonly Buffer[], bg: Rgb): number {
  const [a, b, c] = frames.map((png) => blockLight(png, bg));
  let change = 0;
  let light = 0;
  for (let i = 0; i < b.length; i++) {
    change += Math.abs(b[i] - (a[i] + c[i]) / 2);
    light += b[i];
  }
  return change / light;
}

async function waitForReady(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-state', 'ready', { timeout: READY_TIMEOUT });
}

/**
 * Opens the page on a paused fake clock, then draws frames until the site clock reads `seconds`,
 * so the scene does not depend on the frame rate. Each fastForward(STEP_MS) draws one frame,
 * which adds STEP_MS to the site clock; the first frame adds nothing.
 */
async function openAt(page: Page, seconds: number): Promise<void> {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.goto('/');
  await waitForReady(page);
  for (let i = 0; i <= Math.round((seconds * 1000) / STEP_MS); i++) {
    await page.clock.fastForward(STEP_MS);
  }
}

/** Screenshot without the name and the button, so only the canvas can count as lit. */
function canvasShot(page: Page): Promise<Buffer> {
  // The style applies only while the screenshot is taken; the button stays clickable.
  return page.screenshot({ style: 'h1, #pause { visibility: hidden; }' });
}

/** Two canvas shots, `ms` apart. */
async function shotPair(page: Page, ms: number): Promise<[Buffer, Buffer]> {
  const first = await canvasShot(page);
  await page.waitForTimeout(ms);
  return [first, await canvasShot(page)];
}

/** Collects console errors and page errors from now on. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('renders the brain', async ({ page }) => {
  await openAt(page, INTRO_SECONDS + 1);
  expect(litFraction(await canvasShot(page), BACKGROUND)).toBeGreaterThan(0.01);
});

test('no console errors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await waitForReady(page);
  expect(errors).toEqual([]);
});

test('shows the name', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Lennart Walger');
});

test('pause freezes the frame', async ({ page }) => {
  await page.goto('/');
  await waitForReady(page);
  const button = page.locator('#pause');
  await button.click();
  await page.waitForTimeout(300);
  const [a, b] = await shotPair(page, 500);
  expect(a.equals(b)).toBe(true);
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  // A toggle button keeps its label; aria-pressed carries the state (WAI-ARIA APG).
  await expect(button).toHaveAttribute('aria-label', 'Pause animation');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await page.waitForTimeout(500);
  expect((await canvasShot(page)).equals(b)).toBe(false);
});

test('resize while paused redraws', async ({ page }) => {
  await openAt(page, INTRO_SECONDS + 1);
  await page.locator('#pause').click();
  await page.setViewportSize({ width: 800, height: 600 });
  expect(litFraction(await canvasShot(page), BACKGROUND)).toBeGreaterThan(0.01);
});

test('reduced motion is static', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await waitForReady(page);
  const [a, b] = await shotPair(page, 500);
  expect(a.equals(b)).toBe(true);
  expect(litFraction(a, BACKGROUND)).toBeGreaterThan(0.01);
  await expect(page.locator('#pause')).toBeHidden();
});

test('reduced motion switched on at runtime stops motion', async ({ page }) => {
  await page.goto('/');
  await waitForReady(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(300);
  const [a, b] = await shotPair(page, 500);
  expect(a.equals(b)).toBe(true);
});

test('missing brain.bin shows the fallback', async ({ page }) => {
  await page.route('**/brain.bin', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-state', 'fallback');
  await expect(page.locator('h1')).toBeVisible();
});

// launchOptions cannot change inside a describe group, so this test launches its own browser.
test('no WebGL shows the fallback', async ({ playwright, baseURL }) => {
  const browser = await playwright.chromium.launch({ args: ['--disable-webgl'] });
  try {
    const page = await browser.newPage({ baseURL });
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-state', 'fallback');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#pause')).toBeHidden();
    expect(errors).toHaveLength(1);
  } finally {
    await browser.close();
  }
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });

  test('phone viewport', async ({ page }) => {
    await page.goto('/');
    await waitForReady(page);
    expect(await page.locator('#brain').evaluate((canvas: HTMLCanvasElement) => canvas.width)).toBe(780);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const box = await page.locator('h1').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  });
});

// Small sprites flicker as they move across pixel centres; most at pixel ratio 1 (the default here).
test('moving points do not flicker', async ({ page }) => {
  await openAt(page, 30);
  // Each runFor(FRAME_MS) draws exactly one frame.
  const frames: Buffer[] = [];
  for (let i = 0; i < 3; i++) {
    await page.clock.runFor(FRAME_MS);
    frames.push(await canvasShot(page));
  }
  expect(litFraction(frames[1], BACKGROUND)).toBeGreaterThan(0.01);
  expect(frames[0].equals(frames[2])).toBe(false);
  // Headless Chromium (SwiftShader) at 30 s: 0.0197 with 1 px sprites, 0.0087 with 2 CSS px.
  expect(flicker(frames, BACKGROUND)).toBeLessThan(0.013);
});
