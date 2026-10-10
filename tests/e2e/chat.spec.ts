import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const overview = '**About this selected location**\n\n' + 'This is educational test content about the selected pain point. '.repeat(14) + '\n\n| Possible cause | Typical context |\n| --- | --- |\n| Muscle strain | Following activity |\n| Joint irritation | Several possible triggers |\n\nWhen did this start?';
const stream = (text: string) => JSON.stringify({ type: 'delta', text }) + '\n' + JSON.stringify({ type: 'done' }) + '\n';

test('keyboard search, initial scroll, symptom details, export, and layout', async ({ page }) => {
  const requests: Record<string, unknown>[] = [];
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/chat', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ contentType: 'application/x-ndjson', body: stream(overview) });
  });
  await page.goto('/app');
  const search = page.getByRole('combobox', { name: 'Search pain points' });
  await page.getByRole('button', { name: 'Left Leg' }).click();
  await search.fill('knee'); await search.press('ArrowDown'); await search.press('Enter');
  await expect(page.getByRole('heading', { name: 'Knee (Patellar)' })).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    const canvas = await page.locator('canvas').boundingBox();
    expect(canvas?.x).toBe(0); expect(canvas?.width).toBe(page.viewportSize()?.width);
  }
  await expect(page.getByRole('note', { name: 'AI-generated medical information notice' })).toHaveCount(1);
  expect(requests[0].viewMode).toBe('left-leg'); expect(requests[0].messages).toEqual([]);
  expect(await page.locator('.custom-scrollbar').evaluate(el => el.scrollTop)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByLabel('Pain severity', { exact: true }).selectOption('5');
  await page.getByRole('button', { name: 'A few days', exact: true }).click();
  await page.getByRole('button', { name: 'Aching', exact: true }).click();
  await page.getByRole('button', { name: 'Use these details' }).click();
  await expect(page.getByLabel('Your symptom details')).toContainText('5/10 pain');
  await expect(page.getByRole('note', { name: 'AI-generated medical information notice' })).toHaveCount(2);
  expect(requests[1].symptoms).toEqual({ severity: 5, duration: 'A few days', quality: 'Aching' });
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download consultation summary' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/^AnatoAI-health-summary-\d{4}-\d{2}-\d{2}\.pdf$/);
  const pdf = await fs.readFile((await download.path())!);
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-'); expect(pdf.length).toBeGreaterThan(3000);
  await page.getByRole('button', { name: 'Close chat' }).click();
  await page.getByRole('button', { name: 'Right Leg' }).click();
  await search.fill('right knee'); await search.press('Enter');
  await expect(page.getByRole('note', { name: 'AI-generated medical information notice' })).toHaveCount(1);
  expect(requests.at(-1)?.viewMode).toBe('right-leg');
  expect(await page.locator('.custom-scrollbar').evaluate(el => el.scrollTop)).toBe(0);
  await expect(page.getByLabel('Your symptom details')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('pain point search follows the selected body region', async ({ page }) => {
  await page.goto('/app');
  const search = page.getByRole('combobox', { name: 'Search pain points' });
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    const fullBodyButton = page.getByRole('button', { name: 'Full Body' });
    await fullBodyButton.hover();
    const navigation = await fullBodyButton.locator('..').boundingBox();
    const searchBox = await search.boundingBox();
    expect(navigation!.y).toBeGreaterThan(searchBox!.y + searchBox!.height);
  }
  await search.click();
  await expect(page.getByRole('option')).toHaveCount(6);
  await expect(page.getByRole('option', { name: /Left Leg Main body region/ })).toBeVisible();
  await expect(page.getByRole('option', { name: /Knee/ })).toHaveCount(0);
  await search.fill('left leg'); await search.press('Enter');
  await expect(page.getByRole('button', { name: 'Left Leg' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Left Leg' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Left Leg' }).click();
  await search.fill('knee');
  await expect(page.getByRole('option', { name: /Knee \(Patellar\) Left leg/ })).toBeVisible();
  await expect(page.getByRole('option', { name: /Knee \(Patellar\) Right leg/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Right Leg' }).click();
  await search.fill('knee');
  await expect(page.getByRole('option', { name: /Knee \(Patellar\) Right leg/ })).toBeVisible();
  await expect(page.getByRole('option', { name: /Knee \(Patellar\) Left leg/ })).toHaveCount(0);
});

test('stop and retry recover a request without stale content', async ({ page }) => {
  let count = 0;
  await page.route('**/api/chat', async route => {
    const current = ++count;
    if (current === 1) await new Promise(resolve => setTimeout(resolve, 2500));
    await route.fulfill({ contentType: 'application/x-ndjson', body: stream(current === 1 ? 'Old request' : 'Fresh response') }).catch(() => {});
  });
  await page.goto('/app');
  await page.getByRole('button', { name: 'Open Chat Assistant' }).click();
  await expect.poll(() => count).toBe(1);
  await page.getByRole('button', { name: 'Stop response' }).click();
  await expect(page.getByRole('alert', { name: 'Chat response status' })).toContainText('Response stopped');
  await page.getByRole('button', { name: 'Retry response' }).click();
  await expect(page.getByText('Fresh response', { exact: true })).toBeVisible();
  await expect(page.getByText('Old request', { exact: true })).toHaveCount(0);
});

test('request errors are recoverable without displaying internal details', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({ status: 429, contentType: 'application/json', headers: { 'Retry-After': '10' }, body: JSON.stringify({ error: 'Please wait.' }) }));
  await page.goto('/app'); await page.getByRole('button', { name: 'Open Chat Assistant' }).click();
  await expect(page.getByRole('alert', { name: 'Chat response status' })).toContainText('10 seconds');
  await expect(page.getByRole('button', { name: 'Retry response' })).toBeEnabled();
});
