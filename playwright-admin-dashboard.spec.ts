import { test, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'test@beilo.store';
const ADMIN_PASSWORD = 'test123456';
const BASE_URL = 'http://localhost:3000';

async function login(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('#admin-email', ADMIN_EMAIL);
  await page.fill('#admin-password', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/dashboard`);
  await page.waitForSelector('.admin-dashboard', { timeout: 10000 });
}

async function testViewport(page: Page, width: number, height: number, label: string) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(500); // allow reflow
  
  // Take screenshot
  await page.screenshot({ 
    path: `admin-dashboard-${label}.png`, 
    fullPage: true 
  });
  
  // Check for horizontal overflow
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  
  console.log(`[${label}] viewport: ${viewportWidth}px, body: ${bodyWidth}px, overflow: ${bodyWidth > viewportWidth ? 'YES' : 'no'}`);
  
  // Check key elements visibility
  const kpiCards = await page.locator('.admin-kpi-card').count();
  const dashboardMid = await page.locator('.admin-dashboard-mid').count();
  const dashboardBottom = await page.locator('.admin-dashboard-bottom').count();
  const topCard = await page.locator('.admin-top-card').count();
  
  console.log(`[${label}] KPI cards: ${kpiCards}, mid: ${dashboardMid}, bottom: ${dashboardBottom}, top: ${topCard}`);
  
  // Check for overlapping elements
  const overlaps = await page.evaluate(() => {
    const elements = document.querySelectorAll('.admin-dashboard > *, .admin-dashboard-mid > *, .admin-dashboard-bottom > *, .admin-card');
    const results = [];
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      for (let j = i + 1; j < elements.length; j++) {
        const other = elements[j];
        const otherRect = other.getBoundingClientRect();
        if (otherRect.width === 0 || otherRect.height === 0) continue;
        const overlap = !(rect.right <= otherRect.left || 
                         rect.left >= otherRect.right || 
                         rect.bottom <= otherRect.top || 
                         rect.top >= otherRect.bottom);
        if (overlap) {
          results.push({
            a: el.className,
            b: other.className,
            aRect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
            bRect: { left: otherRect.left, right: otherRect.right, top: otherRect.top, bottom: otherRect.bottom }
          });
        }
      }
    }
    return results;
  });
  
  if (overlaps.length > 0) {
    console.log(`[${label}] OVERLAPS detected:`, overlaps);
  } else {
    console.log(`[${label}] No overlaps detected`);
  }
  
  // Check admin-dashboard-mid grid
  const midStyles = await page.evaluate(() => {
    const mid = document.querySelector('.admin-dashboard-mid');
    if (!mid) return null;
    const style = window.getComputedStyle(mid);
    return {
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
      gap: style.gap,
    };
  });
  console.log(`[${label}] admin-dashboard-mid:`, midStyles);
  
  // Check KPI grid
  const kpiStyles = await page.evaluate(() => {
    const grid = document.querySelector('.admin-kpi-grid');
    if (!grid) return null;
    const style = window.getComputedStyle(grid);
    return {
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
      gap: style.gap,
    };
  });
  console.log(`[${label}] admin-kpi-grid:`, kpiStyles);
  
  return { bodyWidth, viewportWidth, overlaps, midStyles, kpiStyles };
}

test.describe('Admin Dashboard Responsive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Desktop (1280px)', async ({ page }) => {
    await testViewport(page, 1280, 800, 'desktop');
  });

  test('Tablet (768px)', async ({ page }) => {
    await testViewport(page, 768, 1024, 'tablet');
  });

  test('Mobile (375px)', async ({ page }) => {
    await testViewport(page, 375, 667, 'mobile');
  });

  test('Small Mobile (320px)', async ({ page }) => {
    await testViewport(page, 320, 568, 'mobile-small');
  });
});