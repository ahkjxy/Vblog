import { test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, '../screenshot');

test('Complete Feature Test with Screenshots', async ({ page }) => {
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

  // ===========================================
  // PART 1: Authentication Flow
  // ===========================================
  
  console.log('=== PART 1: Authentication ===');
  await page.goto('/');
  await page.waitForTimeout(1000);
  
  // Screenshot 1: Login page
  await takeShot('01_auth_login_page.png');
  
  // Perform unified login/registration
  const timestamp = Date.now();
  const email = `test_full_${timestamp}@example.com`;
  const password = 'TestPassword123!';
  
  console.log('Filling login form...');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  
  // Screenshot 2: Filled login form
  await takeShot('02_auth_filled_form.png');
  
  // Click login button
  const loginBtn = page.locator('button', { hasText: /一键登录|进入系统|Login/i }).first();
  await loginBtn.click();
  
  // Wait for dashboard to load
  console.log('Waiting for dashboard...');
  const splashMessage = page.locator('text=/正在进入|系统就绪|正在初始化/');
  if (await splashMessage.isVisible().catch(() => false)) {
    await splashMessage.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  }
  
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle').catch(() => {});
  
  // ===========================================
  // PART 2: Dashboard Overview
  // ===========================================
  
  console.log('=== PART 2: Dashboard ===');
  await takeShot('03_dashboard_initial.png');
  
  // ===========================================
  // PART 3: Settings - Add Members & Configure
  // ===========================================
  
  console.log('=== PART 3: Settings - Setup ===');
  
  // Navigate to Settings
  const settingsLink = page.locator('a[href*="/settings"], button:has-text("设置")').first();
  if (await settingsLink.count() > 0) {
    await settingsLink.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await takeShot('04_settings_page.png');
    
    // Add a new member
    console.log('Adding new member...');
    const addMemberBtn = page.locator('button:has-text("添加成员"), button:has-text("新增")').first();
    if (await addMemberBtn.isVisible().catch(() => false)) {
      await addMemberBtn.click();
      await page.waitForTimeout(1000);
      await takeShot('05_settings_add_member_modal.png');
      
      // Fill member details
      const nameInput = page.locator('input[placeholder*="名字"], input[placeholder*="姓名"]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('小明');
        await page.waitForTimeout(500);
        await takeShot('06_settings_member_filled.png');
        
        // Save member
        const saveBtn = page.locator('button:has-text("保存"), button:has-text("确认")').first();
        await saveBtn.click();
        await page.waitForTimeout(2000);
        await takeShot('07_settings_member_added.png');
      }
    }
    
    // Try to add points to a profile (admin adjustment)
    console.log('Adjusting member balance...');
    const adjustBtn = page.locator('button:has-text("调整"), button[title*="调整"]').first();
    if (await adjustBtn.isVisible().catch(() => false)) {
      await adjustBtn.click();
      await page.waitForTimeout(1000);
      await takeShot('08_settings_adjust_balance_modal.png');
      
      // Fill adjustment
      const pointsInput = page.locator('input[type="number"]').first();
      if (await pointsInput.isVisible().catch(() => false)) {
        await pointsInput.fill('100');
        const titleInput = page.locator('input[placeholder*="原因"], input[placeholder*="说明"]').first();
        if (await titleInput.isVisible().catch(() => false)) {
          await titleInput.fill('初始奖励');
        }
        await page.waitForTimeout(500);
        await takeShot('09_settings_adjustment_filled.png');
        
        const confirmBtn = page.locator('button:has-text("确认"), button:has-text("提交")').first();
        await confirmBtn.click();
        await page.waitForTimeout(2000);
        await takeShot('10_settings_balance_adjusted.png');
      }
    }
  }
  
  // ===========================================
  // PART 4: Earn Section - Tasks
  // ===========================================
  
  console.log('=== PART 4: Earn Section ===');
  const earnLink = page.locator('a[href*="/earn"], button:has-text("赚取")').first();
  if (await earnLink.count() > 0) {
    await earnLink.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await takeShot('11_earn_tasks_list.png');
    
    // Click on a task to earn points
    console.log('Completing a task...');
    const taskCard = page.locator('[class*="task"], [class*="card"]').first();
    if (await taskCard.isVisible().catch(() => false)) {
      await taskCard.click();
      await page.waitForTimeout(1000);
      await takeShot('12_earn_task_modal.png');
      
      // Confirm task completion
      const confirmTaskBtn = page.locator('button:has-text("确认"), button:has-text("完成")').first();
      if (await confirmTaskBtn.isVisible().catch(() => false)) {
        await confirmTaskBtn.click();
        await page.waitForTimeout(2000);
        await takeShot('13_earn_task_completed.png');
      }
    }
  }
  
  // ===========================================
  // PART 5: Redeem Section - Rewards
  // ===========================================
  
  console.log('=== PART 5: Redeem Section ===');
  const redeemLink = page.locator('a[href*="/redeem"], button:has-text("兑换")').first();
  if (await redeemLink.count() > 0) {
    await redeemLink.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await takeShot('14_redeem_rewards_list.png');
    
    // Try to redeem a reward
    console.log('Redeeming a reward...');
    const rewardCard = page.locator('[class*="reward"], [class*="card"]').first();
    if (await rewardCard.isVisible().catch(() => false)) {
      await rewardCard.click();
      await page.waitForTimeout(1000);
      await takeShot('15_redeem_reward_modal.png');
      
      // Confirm redemption
      const confirmRedeemBtn = page.locator('button:has-text("确认"), button:has-text("兑换")').first();
      if (await confirmRedeemBtn.isVisible().catch(() => false)) {
        await confirmRedeemBtn.click();
        await page.waitForTimeout(2000);
        await takeShot('16_redeem_reward_redeemed.png');
      }
    }
  }
  
  // ===========================================
  // PART 6: Achievement Center & Lottery
  // ===========================================
  
  console.log('=== PART 6: Achievement Center ===');
  const achLink = page.locator('a[href*="/achievements"], button:has-text("成就")').first();
  if (await achLink.count() > 0) {
    await achLink.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await takeShot('17_achievements_page.png');
    
    // Open lottery wheel
    console.log('Opening lottery...');
    const lotteryBtn = page.locator('button:has-text("抽奖"), button:has-text("积分抽奖")').first();
    if (await lotteryBtn.isVisible().catch(() => false)) {
      await lotteryBtn.click();
      await page.waitForTimeout(1500);
      await takeShot('18_lottery_modal_open.png');
      
      // Spin the wheel
      const spinBtn = page.locator('button:has-text("开始"), button:has-text("抽奖")').first();
      if (await spinBtn.isVisible().catch(() => false)) {
        await spinBtn.click();
        await page.waitForTimeout(5000); // Wait for spin animation
        await takeShot('19_lottery_result.png');
        
        // Close result
        const closeBtn = page.locator('button:has-text("收下"), button:has-text("确定")').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  }
  
  // ===========================================
  // PART 7: History Section
  // ===========================================
  
  console.log('=== PART 7: History ===');
  const historyLink = page.locator('a[href*="/history"], button:has-text("历史")').first();
  if (await historyLink.count() > 0) {
    await historyLink.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await takeShot('20_history_transactions.png');
    
    // Try to delete a transaction (if admin)
    console.log('Testing transaction deletion...');
    const deleteBtn = page.locator('button[title*="删除"], button:has-text("删除")').first();
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(1000);
      await takeShot('21_history_delete_confirm.png');
      
      // Cancel deletion
      const cancelBtn = page.locator('button:has-text("取消")').first();
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
      }
    }
  }
  
  // ===========================================
  // PART 8: Profile Switching
  // ===========================================
  
  console.log('=== PART 8: Profile Switching ===');
  const profileBtn = page.locator('[class*="profile"], [class*="avatar"]').first();
  if (await profileBtn.isVisible().catch(() => false)) {
    await profileBtn.click();
    await page.waitForTimeout(1000);
    await takeShot('22_profile_switcher_modal.png');
    
    // Close modal
    const closeModalBtn = page.locator('button[aria-label="Close"], button:has-text("关闭")').first();
    if (await closeModalBtn.isVisible().catch(() => false)) {
      await closeModalBtn.click();
      await page.waitForTimeout(500);
    }
  }
  
  // ===========================================
  // PART 9: Final Dashboard State
  // ===========================================
  
  console.log('=== PART 9: Final State ===');
  const dashboardLink = page.locator('a[href*="/dashboard"], button:has-text("总览")').first();
  if (await dashboardLink.count() > 0) {
    await dashboardLink.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await takeShot('23_dashboard_final.png');
  }
  
  console.log('=== Test Complete ===');
});
