import exp from 'constants';

// @ts-check
const { test, expect} = require('@playwright/test');

// change this to the URL of your website, could be local or GitHub pages
const websiteURL = 'http://127.0.0.1:3000//';

// Go to the website home page before each test.
test.beforeEach(async ({ page }) => {
   await page.goto(websiteURL);
});

test('shows error when trying to submit a vehicle that already exists', async ({ page }) => {
  await page.goto('/add-vehicle.html');

  await page.fill('#rego', 'GHT56FN');
  await page.fill('#make', 'Ford');
  await page.fill('#model', 'Focus');
  await page.fill('#colour', 'Green');
  await page.fill('#owner', 'Jane Doe');
  await page.click('#check-owner');
  await page.locator('.select-owner-btn').first().click();
  await page.click('#submit');

  await expect(page.locator('#vehicle-message')).toContainText('already exists');
});
