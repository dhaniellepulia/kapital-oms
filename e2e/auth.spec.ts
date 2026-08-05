import { expect, test } from '@playwright/test'

test('login form validates empty submit', async ({ page }) => {
  await page.goto('/login')

  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByText('Email is required')).toBeVisible()
  await expect(page.getByText('Password is required')).toBeVisible()
})

test('login form rejects an invalid email', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Email').fill('not-an-email')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByText('Enter a valid email')).toBeVisible()
})

test('signup form rejects mismatched passwords', async ({ page }) => {
  await page.goto('/signup')

  await page.getByLabel('Full name').fill('Maria Santos')
  await page.getByLabel('Email').fill('maria@example.com')
  await page.getByLabel('Password', { exact: true }).fill('secret123')
  await page.getByLabel('Confirm password').fill('different')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByText('Passwords do not match')).toBeVisible()
})

test('signup form validates short password', async ({ page }) => {
  await page.goto('/signup')

  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByText('Enter your full name')).toBeVisible()
  await expect(page.getByText('Password must be at least 6 characters')).toBeVisible()
})
