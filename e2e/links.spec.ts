import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard/links')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForSelector('.page-title')
})

async function clickAddLink(page: import('@playwright/test').Page) {
  await page
    .getByRole('button', { name: /add link/i })
    .first()
    .click()
}

test.describe('Add link', () => {
  test('opens the add form when clicking Add Link', async ({ page }) => {
    await clickAddLink(page)
    await expect(page.locator('.add-form-card')).toBeVisible()
  })

  test('adds a new link and shows it in the list', async ({ page }) => {
    await clickAddLink(page)

    await page.locator('.add-form-card input[placeholder="My Instagram"]').fill('My Instagram')
    await page.locator('.add-form-card input[placeholder*="instagram.com"]').fill('https://instagram.com/user')

    await page
      .locator('.add-form-card')
      .getByRole('button', { name: /add link/i })
      .click()

    await expect(page.locator('.link-card')).toBeVisible()
    await expect(page.locator('.link-title')).toContainText('My Instagram')
  })

  test('shows validation error for empty title', async ({ page }) => {
    await clickAddLink(page)
    await page.locator('.add-form-card input[placeholder*="instagram.com"]').fill('https://instagram.com/user')
    await page
      .locator('.add-form-card')
      .getByRole('button', { name: /add link/i })
      .click()

    await expect(page.locator('.field-error').first()).toContainText(/required/i)
  })

  test('shows validation error for invalid URL', async ({ page }) => {
    await clickAddLink(page)
    await page.locator('.add-form-card input[placeholder="My Instagram"]').fill('Test Link')
    await page.locator('.add-form-card input[placeholder*="instagram.com"]').fill('https://[invalid')
    await page
      .locator('.add-form-card')
      .getByRole('button', { name: /add link/i })
      .click()

    await expect(page.locator('.field-error').last()).toContainText(/valid url/i)
  })

  test('closes the form on Cancel', async ({ page }) => {
    await clickAddLink(page)
    await expect(page.locator('.add-form-card')).toBeVisible()

    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.locator('.add-form-card')).not.toBeVisible()
  })

  test('shows platform badge after URL is typed', async ({ page }) => {
    await clickAddLink(page)
    await page.locator('.add-form-card input[placeholder*="instagram.com"]').fill('https://instagram.com/user')

    await expect(page.locator('.add-form-card .badge')).toBeVisible()
  })
})

test.describe('Edit link', () => {
  test.beforeEach(async ({ page }) => {
    await clickAddLink(page)
    await page.locator('.add-form-card input[placeholder="My Instagram"]').fill('Original Title')
    await page.locator('.add-form-card input[placeholder*="instagram.com"]').fill('https://instagram.com/user')
    await page
      .locator('.add-form-card')
      .getByRole('button', { name: /add link/i })
      .click()
    await expect(page.locator('.link-card')).toBeVisible()
  })

  test('opens edit mode when clicking the edit button', async ({ page }) => {
    await page.getByRole('button', { name: /edit link/i }).click()
    await expect(page.locator('.edit-body')).toBeVisible()
  })

  test('pre-fills the edit form with current values', async ({ page }) => {
    await page.getByRole('button', { name: /edit link/i }).click()

    const titleInput = page.locator('.edit-body input').first()
    await expect(titleInput).toHaveValue('Original Title')
  })

  test('saves the updated title immediately with Save', async ({ page }) => {
    await page.getByRole('button', { name: /edit link/i }).click()

    const titleInput = page.locator('.edit-body input').first()
    await titleInput.clear()
    await titleInput.fill('Updated Title')

    await page
      .locator('.edit-body')
      .getByRole('button', { name: /^save$/i })
      .click()

    await expect(page.locator('.link-title')).toContainText('Updated Title')
    await expect(page.locator('.edit-body')).not.toBeVisible()
  })

  test('saves as draft without changing the live title', async ({ page }) => {
    await page.getByRole('button', { name: /edit link/i }).click()

    const titleInput = page.locator('.edit-body input').first()
    await titleInput.clear()
    await titleInput.fill('Draft Title')

    await page
      .locator('.edit-body')
      .getByRole('button', { name: /save as draft/i })
      .click()

    await expect(page.locator('.link-title')).toContainText('Original Title')

    await expect(page.locator('.draft-section')).toBeVisible()
    await expect(page.locator('.draft-value').first()).toContainText('Draft Title')
  })

  test('publishes a draft and updates the live title', async ({ page }) => {
    await page
      .getByRole('button', { name: /edit link/i })
      .first()
      .click()
    const titleInput = page.locator('.edit-body input').first()
    await titleInput.clear()
    await titleInput.fill('Draft Title')
    await page
      .locator('.edit-body')
      .getByRole('button', { name: /save as draft/i })
      .click()

    await page.locator('.draft-btn--publish').click()

    await expect(page.locator('.link-title')).toContainText('Draft Title')
    await expect(page.locator('.draft-section')).not.toBeVisible()
  })

  test('discards a draft and restores only live data in view', async ({ page }) => {
    await page
      .getByRole('button', { name: /edit link/i })
      .first()
      .click()
    const titleInput = page.locator('.edit-body input').first()
    await titleInput.clear()
    await titleInput.fill('Draft Title')
    await page
      .locator('.edit-body')
      .getByRole('button', { name: /save as draft/i })
      .click()

    await page.locator('.draft-btn--discard').click()

    await expect(page.locator('.link-title')).toContainText('Original Title')
    await expect(page.locator('.draft-section')).not.toBeVisible()
  })

  test('closes edit mode on Cancel', async ({ page }) => {
    await page.getByRole('button', { name: /edit link/i }).click()
    await expect(page.locator('.edit-body')).toBeVisible()

    await page
      .locator('.edit-body')
      .getByRole('button', { name: /cancel/i })
      .click()
    await expect(page.locator('.edit-body')).not.toBeVisible()
  })
})

test.describe('Delete link', () => {
  test.beforeEach(async ({ page }) => {
    await clickAddLink(page)
    await page.locator('.add-form-card input[placeholder="My Instagram"]').fill('To Delete')
    await page.locator('.add-form-card input[placeholder*="instagram.com"]').fill('https://example.com')
    await page
      .locator('.add-form-card')
      .getByRole('button', { name: /add link/i })
      .click()
    await expect(page.locator('.link-card')).toBeVisible()
  })

  test('opens a confirmation dialog before deleting', async ({ page }) => {
    await page.getByRole('button', { name: /delete link/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog')).toContainText('To Delete')
  })

  test('deletes the link when confirmed', async ({ page }) => {
    await page.getByRole('button', { name: /delete link/i }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .click()

    await expect(page.locator('.link-card')).not.toBeVisible()
    await expect(page.locator('.empty-state')).toBeVisible()
  })

  test('cancels deletion and keeps the link', async ({ page }) => {
    await page.getByRole('button', { name: /delete link/i }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /cancel/i })
      .click()

    await expect(page.locator('.link-card')).toBeVisible()
  })

  test('shows undo toast after deletion', async ({ page }) => {
    await page.getByRole('button', { name: /delete link/i }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .click()

    await expect(page.locator('.undo-toast')).toBeVisible()
    await expect(page.locator('.undo-toast')).toContainText('To Delete')
  })

  test('restores the link when Undo is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /delete link/i }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .click()

    await page.locator('.toast-undo-btn').click()

    await expect(page.locator('.link-card')).toBeVisible()
    await expect(page.locator('.link-title')).toContainText('To Delete')
  })
})

test.describe('Toggle link active/inactive', () => {
  test.beforeEach(async ({ page }) => {
    await clickAddLink(page)
    await page.locator('.add-form-card input[placeholder="My Instagram"]').fill('Toggle Test')
    await page.locator('.add-form-card input[placeholder*="instagram.com"]').fill('https://example.com')
    await page
      .locator('.add-form-card')
      .getByRole('button', { name: /add link/i })
      .click()
    await expect(page.locator('.link-card')).toBeVisible()
  })

  test('toggling the switch changes the card opacity', async ({ page }) => {
    const card = page.locator('.link-card')
    await expect(card).not.toHaveClass(/link-card--inactive/)

    await page.locator('[data-slot="switch"]').click()
    await expect(card).toHaveClass(/link-card--inactive/)
  })
})

test.describe('Search links', () => {
  test.beforeEach(async ({ page }) => {
    const addLink = async (title: string, url: string) => {
      await clickAddLink(page)
      await page.locator('.add-form-card input[placeholder="My Instagram"]').fill(title)
      await page.locator('.add-form-card input[placeholder*="instagram.com"]').fill(url)
      await page
        .locator('.add-form-card')
        .getByRole('button', { name: /add link/i })
        .click()
      await expect(page.locator('.link-card').last()).toBeVisible()
    }
    await addLink('Instagram Profile', 'https://instagram.com/user')
    await addLink('YouTube Channel', 'https://youtube.com/@channel')
  })

  test('filters links by title keyword', async ({ page }) => {
    await page.locator('input[placeholder*="Search"]').fill('instagram')

    await expect(page.locator('.link-title', { hasText: 'Instagram Profile' })).toBeVisible()
    await expect(page.locator('.link-title', { hasText: 'YouTube Channel' })).not.toBeVisible()
  })

  test('shows empty state when no links match', async ({ page }) => {
    await page.locator('input[placeholder*="Search"]').fill('xyz-no-match')
    await expect(page.locator('.empty-state')).toBeVisible()
    await expect(page.locator('.empty-title')).toContainText(/no links match/i)
  })

  test('clears filter and shows all links when search is cleared', async ({ page }) => {
    await page.locator('input[placeholder*="Search"]').fill('instagram')
    await page.locator('input[placeholder*="Search"]').clear()

    await expect(page.locator('.link-card')).toHaveCount(2)
  })
})
