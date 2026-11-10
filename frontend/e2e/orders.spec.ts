import { expect, test, type APIRequestContext } from '@playwright/test'

// Chaque test crée son propre drop via l'API : il ne dépend ni des données de démo,
// ni des autres tests (qui peuvent tourner en parallèle).
async function createDrop(request: APIRequestContext, stock: number): Promise<number> {
  const response = await request.post('/api/drops', {
    data: {
      product: `Drop E2E ${Date.now()}`,
      price_cents: 15000,
      stock,
      opens_at: new Date(Date.now() - 60_000).toISOString(), // ouvert depuis 1 minute
    },
  })
  expect(response.status()).toBe(201)
  const drop = await response.json()
  return drop.id
}

test('commander décrémente le stock', async ({ page, request }) => {
  const id = await createDrop(request, 3)
  await page.goto(`/drops/${id}`)
  await expect(page.getByTestId('remaining')).toHaveText('3 / 3 paires restantes')

  await page.getByRole('button', { name: 'Commander' }).click()

  await expect(page.getByRole('status')).toContainText('confirmée')
  await expect(page.getByTestId('remaining')).toHaveText('2 / 3 paires restantes')
})

test('un drop épuisé désactive le bouton', async ({ page, request }) => {
  const id = await createDrop(request, 1)
  // On achète la seule paire directement via l'API
  const order = await request.post(`/api/drops/${id}/orders`)
  expect(order.status()).toBe(201)

  await page.goto(`/drops/${id}`)

  await expect(page.getByRole('button', { name: 'Épuisé' })).toBeDisabled()
  await expect(page.getByTestId('remaining')).toHaveText('0 / 1 paires restantes')
})