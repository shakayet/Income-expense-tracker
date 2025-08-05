import { launchBrowser } from '../puppeteerHelper';

export const scrapeSubito = async (query: string, maxPrice: number) => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  await page.goto(
    `https://www.subito.it/annunci-italia/vendita/usato/?q=${encodeURIComponent(
      query
    )}`,
    {
      waitUntil: 'domcontentloaded',
    }
  );

  await page.waitForSelector('[data-test="listing-item"]');

  const results = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll('[data-test="listing-item"]')
    );
    return items.map(item => {
      const priceEl = item.querySelector('[data-test="price"]')?.textContent;
      const link = item.querySelector('a')?.getAttribute('href');
      const price = priceEl ? parseFloat(priceEl.replace(/[^\d.]/g, '')) : null;
      return price && link
        ? {
            price,
            link: link.startsWith('http')
              ? link
              : 'https://www.subito.it' + link,
          }
        : null;
    });
  });

  await browser.close();

  const filtered: Array<{ price: number; link: string }> = results.filter(
    (r): r is { price: number; link: string } =>
      r !== null && typeof r.price === 'number' && r.price <= maxPrice
  );
  if (filtered.length === 0) return null;

  const cheapest = filtered.reduce((prev, current) => {
    if (!prev) return current;
    if (!current) return prev;
    return prev.price < current.price ? prev : current;
  }, filtered[0]);
  if (!cheapest) return null;
  return { source: 'Subito', ...cheapest };
};
