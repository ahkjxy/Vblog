# Test Automation

This directory contains automated tests for the Family Points Bank application.

## Structure

- `test/scripts/` - Playwright test scripts
- `test/screenshot/` - Screenshots captured during test runs

## Running Tests

Make sure the dev server is running first:

```bash
yarn dev
```

Then in another terminal, run the tests:

```bash
# Run all tests
yarn test

# Run tests with UI mode (interactive)
yarn test:ui

# Run specific test file
npx playwright test capture_tour.spec.ts
npx playwright test full_feature_test.spec.ts
```

## Test Suites

### 1. Quick Tour (`capture_tour.spec.ts`)
A fast walkthrough that captures screenshots of all main pages:
- Dashboard
- Earn (Tasks)
- Redeem (Rewards)
- Achievements
- History
- Settings

### 2. Full Feature Test (`full_feature_test.spec.ts`)
A comprehensive test that exercises all major features:

**Authentication:**
- Login page view
- Form filling
- Unified login/registration

**Settings & Setup:**
- Add new family members
- Adjust member balances
- Configure profiles

**Earn Section:**
- View tasks
- Complete tasks
- Earn points

**Redeem Section:**
- Browse rewards
- Redeem rewards
- Spend points

**Achievement Center:**
- View achievements
- Use lottery wheel
- Spin and win

**History:**
- View transaction history
- Test deletion (admin)

**Profile Management:**
- Switch between profiles
- View profile details

## Screenshots

All screenshots are saved to `test/screenshot/` with descriptive names following the pattern:
- `01_auth_login_page.png`
- `02_auth_filled_form.png`
- `03_dashboard_initial.png`
- ... and so on

The full feature test generates approximately 23 screenshots covering the entire application flow.

## Notes

- Tests create temporary accounts on-the-fly
- Screenshots are full-page captures
- Tests wait for network idle, fonts, and animations before capturing
- All interactions are logged to console for debugging

