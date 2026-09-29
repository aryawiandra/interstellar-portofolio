import { expect, test, type Page } from '@playwright/test'

const CHAPTERS = [
  ['gargantua', 'GARGANTUA'],
  ['origin', 'ORIGIN'],
  ['transit', 'TRANSIT'],
  ['mission-adaro', 'MISSION 01'],
  ['mission-pertamina', 'MISSION 02'],
  ['mission-mckinsey', 'MISSION 03'],
  ['mission-eth', 'MISSION 04'],
  ['fleet', 'FLEET'],
  ['systems', 'SYSTEMS'],
  ['signals', 'SIGNALS'],
  ['horizon', 'EVENT HORIZON'],
] as const

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  return errors
}

async function waitForLaunch(page: Page) {
  await page.goto('/')
  await expect(page.locator('.loader')).toHaveCount(0, { timeout: 45_000 })
}

async function jumpTo(page: Page, id: string, fraction = 0.3) {
  await page.evaluate(
    ([id, fraction]) => {
      const el = document.getElementById(id as string)!
      ;(window as unknown as { __jump: (y: number) => void }).__jump(el.offsetTop + el.offsetHeight * (fraction as number))
    },
    [id, fraction] as const,
  )
}

const indicator = (page: Page) => page.locator('.indicator__label')

test('launches: loader clears, hero renders over a WebGL canvas, no errors', async ({ page }) => {
  const errors = collectErrors(page)
  await waitForLaunch(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Engineering clarity from complex systems.')
  await expect(page.locator('.stage canvas')).toHaveCount(1)
  await expect(indicator(page)).toHaveText('GARGANTUA')
  expect(errors).toEqual([])
})

test('every chapter is reachable and labelled as the journey scrolls', async ({ page }, testInfo) => {
  const errors = collectErrors(page)
  await waitForLaunch(page)
  for (const [id, label] of CHAPTERS) {
    await jumpTo(page, id)
    await expect(indicator(page)).toHaveText(label)
    await expect(page.locator(`#${id}`)).toHaveAttribute('data-visible', 'true')
    await page.waitForTimeout(1200)
    await page.screenshot({ path: testInfo.outputPath(`chapter-${id}.jpg`), type: 'jpeg', quality: 70 })
  }
  expect(errors).toEqual([])
})

test('menu jumps straight to a chapter', async ({ page }) => {
  await waitForLaunch(page)
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('dialog').getByRole('link', { name: /FLEET/ }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(indicator(page)).toHaveText('FLEET')
  await expect(page.getByRole('heading', { name: 'Leading the crew.' })).toBeInViewport()
})

test('contact button lands on the event horizon with the approved links', async ({ page }) => {
  await waitForLaunch(page)
  await page.getByRole('button', { name: 'Contact' }).click()
  await expect(indicator(page)).toHaveText('EVENT HORIZON')
  const links = page.getByRole('navigation', { name: 'Contact' }).getByRole('link')
  await expect(links).toHaveCount(3)
  await expect(links.nth(0)).toHaveAttribute('href', 'mailto:aryautomo21@gmail.com')
  await expect(links.nth(1)).toHaveAttribute('href', 'https://www.linkedin.com/in/aryawiandra')
  await expect(links.nth(2)).toHaveAttribute('href', 'https://github.com/aryawiandra')
  await expect(page.getByText(/\+62|877/)).toHaveCount(0)
})

test('reduced motion shows telemetry instantly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await waitForLaunch(page)
  await expect(page.locator('#gargantua .telemetry__lines')).toContainText('GARGANTUA')
})

test('falls back to the static scene when WebGL2 is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type === 'webgl2') return null
      return (original as (...args: unknown[]) => unknown).call(this, type, ...rest)
    } as typeof original
  })
  await waitForLaunch(page)
  await expect(page.locator('.fallback')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('phone layout never scrolls sideways', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await waitForLaunch(page)
  for (const id of ['gargantua', 'mission-pertamina', 'fleet', 'systems', 'horizon']) {
    await jumpTo(page, id, 0.05)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, `horizontal overflow on ${id}`).toBeLessThanOrEqual(0)
  }
})
