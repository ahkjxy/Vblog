import { test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, '../screenshot');

test('Walkthrough and Screenshot Tour', async ({ page }) => {
  // 1. Visit the app
  console.log('Navigating to app...');
  await page.goto('/');

  // 2. Handle Authentication
  // Check if we are on the login page by looking for the email input
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.count() > 0) {
    console.log('Login page detected. Performing unified login...');
    const timestamp = Date.now();
    const email = `test_tour_${timestamp}@example.com`;
    const password = 'TestTourPassword123!';

    await emailInput.fill(email);
    await page.locator('input[type="password"]').fill(password);
    
    // Click the unified login button. Text might be "进入系统" or "一键登录"
    // We try to find a button with probable text
    const loginBtn = page.locator('button', { hasText: /一键登录|进入系统|Login/i }).first();
    await loginBtn.click();
  } else {
    console.log('Already logged in?');
  }

  // 3. Wait for Dashboard
  console.log('Waiting for Dashboard...');
  
  // First, wait for any splash/loading screen to disappear
  // The splash might show "正在进入元气空间..." or "系统就绪，欢迎回来"
  const splashMessage = page.locator('text=/正在进入|系统就绪|正在初始化/');
  if (await splashMessage.isVisible().catch(() => false)) {
    console.log('Waiting for splash screen to disappear...');
    await splashMessage.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
      console.log('Splash screen timeout, continuing anyway...');
    });
  }
  
  // Wait a bit more for animations
  await page.waitForTimeout(2000);
  
  // Now wait for dashboard elements - try multiple possible indicators
  // Could be sidebar navigation, header, or main content
  const dashboardIndicators = [
    page.locator('text=家庭总览'),
    page.locator('text=赚取'),
    page.locator('text=兑换'),
    page.locator('[href*="/dashboard"]'),
    page.locator('nav'), // Sidebar or navigation
  ];
  
  let dashboardFound = false;
  for (const indicator of dashboardIndicators) {
    if (await indicator.isVisible().catch(() => false)) {
      console.log('Dashboard detected!');
      dashboardFound = true;
      break;
    }
  }
  
  if (!dashboardFound) {
    console.log('Dashboard indicators not found, waiting for URL change...');
    await page.waitForURL(/\/(dashboard|earn|redeem)/, { timeout: 10000 }).catch(() => {
      console.log('URL did not change to dashboard, continuing anyway...');
    });
  }
  
  // Wait for animations to settle
  await page.waitForTimeout(2000);

  // Helper to take screenshot - wait for everything to load first
  const takeShot = async (name: string) => {
    console.log(`Preparing screenshot: ${name}`);
    
    // Wait for network to be idle (all resources loaded)
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('Network idle timeout, continuing...');
    });
    
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    
    // Extra wait for animations and transitions
    await page.waitForTimeout(1500);
    
    console.log(`Taking screenshot: ${name}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, name), fullPage: true });
  };

  // --- Step 1: Dashboard ---
  await takeShot('01_dashboard.png');

  // --- Step 2: Earn (Tasks) ---
  console.log('Navigating to Earn...');
  const earnLink = page.locator('a[href*="/earn"], button:has-text("赚取")').first();
  if (await earnLink.count() > 0) {
      await earnLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1500); // Wait for transition
      await takeShot('02_earn.png');
  } else {
      console.warn('Earn link not found');
  }

  // --- Step 3: Redeem (Rewards) ---
  console.log('Navigating to Redeem...');
  // Try to find the nav item. Text might be "兑换"
  const redeemLink = page.locator('a[href*="/redeem"], button:has-text("兑换")').first();
  if (await redeemLink.count() > 0) {
      await redeemLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1500);
      await takeShot('03_redeem.png');
  } else {
      console.warn('Redeem link not found');
  }

  // --- Step 4: Achievement Center ---
  console.log('Navigating to Achievements...');
  const achLink = page.locator('a[href*="/achievements"], button:has-text("成就")').first();
  if (await achLink.count() > 0) {
      await achLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1500);
      await takeShot('04_achievements.png');
  }

  // --- Step 5: History ---
  console.log('Navigating to History...');
  const historyLink = page.locator('a[href*="/history"], button:has-text("历史")').first();
  if (await historyLink.count() > 0) {
      await historyLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1500);
      await takeShot('05_history.png');
  }

  // --- Step 6: Settings ---
  console.log('Navigating to Settings...');
  const settingsLink = page.locator('a[href*="/settings"], button:has-text("设置")').first();
  if (await settingsLink.count() > 0) {
      await settingsLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1500);
      await takeShot('06_settings.png');
  }
  
  console.log('Tour complete.');
});
