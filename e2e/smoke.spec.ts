import { expect, test } from '@playwright/test'

test('loads the login page', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
})

test('redirects unauthenticated root to login', async ({ page }) => {
  await page.goto('/')

  await page.waitForURL('/login')
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
})
