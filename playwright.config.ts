import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', timeout: 90_000, expect: { timeout: 30_000 }, workers: 1,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROME_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROME_PATH } : {} },
  projects: [{ name: 'desktop', use: { viewport: { width: 1440, height: 900 } } }, { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }],
});
