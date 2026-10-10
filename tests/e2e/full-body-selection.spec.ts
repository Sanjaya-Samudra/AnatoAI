import { expect, test } from '@playwright/test';

test('full-body drawing stays selected until the user analyzes or cancels it', async ({ page }) => {
  const requests: Record<string, unknown>[] = [];
  await page.route('**/api/chat', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ contentType: 'application/x-ndjson', body: '{"type":"delta","text":"Educational guidance for this area."}\n{"type":"done"}\n' });
  });
  await page.goto('/app');
  await expect(page.getByRole('button', { name: 'Draw pain area' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Draw pain area' }).click();
  const canvas = await page.locator('canvas').boundingBox();
  expect(canvas).not.toBeNull();
  const center = canvas!.x + canvas!.width / 2;
  const top = canvas!.y;
  await page.mouse.move(center - 15, top + 125);
  await page.mouse.down();
  await page.mouse.move(center + 20, top + 145, { steps: 8 });
  await page.mouse.move(center, top + 275, { steps: 14 });
  await page.mouse.up();
  await expect(page.getByRole('status').filter({ hasText: 'Head selected' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Analyze area' })).toBeEnabled();
  await page.screenshot({ path: 'output/full-body-selection-desktop.png' });
  await page.getByRole('button', { name: 'Cancel selection' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Drag over the body' })).toBeVisible();
  await page.getByRole('button', { name: 'Done drawing' }).click();
  await page.mouse.click(center, top + 155);
  await expect(page.getByRole('button', { name: 'Head Region' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Head' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Full Body' }).click();
  await expect(page.getByRole('button', { name: 'Draw pain area' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Draw pain area' }).click();
  await page.mouse.move(center - 15, top + 125);
  await page.mouse.down();
  await page.mouse.move(center + 20, top + 145, { steps: 8 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Analyze area' }).click();
  await expect(page.getByRole('heading', { name: 'Head' })).toBeVisible();
  await expect.poll(() => requests.length).toBe(1);
  expect(requests[0].selectedPart).toBe('Head');
  expect(requests[0].viewMode).toBe('full');
});

test('female full-body model supports a surface area selection', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: 'Female' }).click();
  await expect(page.getByRole('button', { name: 'Draw pain area' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Draw pain area' }).click();
  const canvas = await page.locator('canvas').boundingBox();
  expect(canvas).not.toBeNull();
  const center = canvas!.x + canvas!.width / 2;
  const top = canvas!.y;
  await page.mouse.move(center - 12, top + 125);
  await page.mouse.down();
  await page.mouse.move(center + 17, top + 145, { steps: 9 });
  await page.mouse.up();
  await expect(page.getByRole('status').filter({ hasText: 'Head selected' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Analyze area' })).toBeEnabled();
  await page.screenshot({ path: 'output/full-body-selection-female.png' });
});

test('a stroke stops at its starting region and resumes only when it returns', async ({ page }) => {
  await page.goto('/app');
  await expect(page.getByRole('button', { name: 'Draw pain area' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Draw pain area' }).click();
  const canvas = await page.locator('canvas').boundingBox();
  expect(canvas).not.toBeNull();
  const center = canvas!.x + canvas!.width / 2;
  const top = canvas!.y;
  await page.mouse.move(center, top + 155);
  await page.mouse.down();
  await page.mouse.move(center, top + 275);
  await expect(page.getByRole('status').filter({ hasText: 'Head selected' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Analyze area' })).toBeDisabled();
  await page.mouse.move(center, top + 145);
  await page.mouse.move(center, top + 105, { steps: 14 });
  await page.mouse.up();
  await expect(page.getByRole('button', { name: 'Analyze area' })).toBeEnabled();
  await page.screenshot({ path: 'output/full-body-region-boundary.png' });
});

test('the same area can be painted on both sides after rotating the model', async ({ page }) => {
  await page.goto('/app');
  await expect(page.getByRole('button', { name: 'Draw pain area' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Draw pain area' }).click();
  const canvas = await page.locator('canvas').boundingBox();
  expect(canvas).not.toBeNull();
  const center = canvas!.x + canvas!.width / 2;
  const top = canvas!.y;
  await page.mouse.move(center - 15, top + 125);
  await page.mouse.down();
  await page.mouse.move(center + 20, top + 145, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByRole('button', { name: 'Analyze area' })).toBeEnabled();
  await page.getByRole('button', { name: 'Done drawing' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'rotate, then draw again' })).toBeVisible();
  await page.mouse.move(center + 210, top + 330);
  await page.mouse.down();
  await page.mouse.move(center - 240, top + 330, { steps: 20 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Draw pain area' }).click();
  await page.mouse.move(center - 15, top + 125);
  await page.mouse.down();
  await page.mouse.move(center + 20, top + 145, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByRole('status').filter({ hasText: 'Head selected' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Analyze area' })).toBeEnabled();
  await page.screenshot({ path: 'output/full-body-front-back-selection.png' });
});

test('drawing identifies torso, arms, and legs from the surface where it starts', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop model coordinates are used for this region-boundary check.');
  await page.goto('/app');
  await expect(page.getByRole('button', { name: 'Draw pain area' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Draw pain area' }).click();
  const canvas = await page.locator('canvas').boundingBox();
  expect(canvas).not.toBeNull();
  const cx = canvas!.x + canvas!.width / 2;
  const y = canvas!.y;
  for (const [region, startX, startY, endX, endY] of [
    ['Torso', cx, y + 335, cx + 18, y + 355],
    ['Left Hand', cx + 174, y + 340, cx + 184, y + 355],
    ['Right Hand', cx - 174, y + 340, cx - 184, y + 355],
    ['Left Leg', cx + 62, y + 545, cx + 65, y + 580],
    ['Right Leg', cx - 62, y + 545, cx - 65, y + 580],
  ] as const) {
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 8 });
    await page.mouse.up();
    await expect(page.getByRole('status').filter({ hasText: `${region} selected` })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel selection' }).click();
  }
});
