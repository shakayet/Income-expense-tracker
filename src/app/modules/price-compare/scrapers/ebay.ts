import { launchBrowser } from '../puppeteerHelper';

export const scrapeEbay = async (query: string, maxPrice: number) => {
  // Import launchBrowser if not already
  // import { launchBrowser } from '../puppeteerHelper';
  const browser = await launchBrowser();
  const page = await browser.newPage();

  await page.goto(
    `https://www.ebay.it/sch/i.html?_nkw=${encodeURIComponent(query)}`,
    {
      waitUntil: 'domcontentloaded',
    }
  );

  await page.waitForSelector('.s-item');

  const results: Array<{ price: number; link: string } | null> =
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.s-item'));
      return items.map(item => {
        const priceText = item.querySelector('.s-item__price')?.textContent;
        const link = item.querySelector('.s-item__link')?.getAttribute('href');
        const price = priceText
          ? parseFloat(priceText.replace(/[^\d.]/g, ''))
          : null;
        return price && link ? { price, link } : null;
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
  return { source: 'eBay', ...cheapest };
};
