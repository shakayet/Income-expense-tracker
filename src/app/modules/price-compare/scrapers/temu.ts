import { launchBrowser } from '../puppeteerHelper';

export const scrapeTemu = async (query: string, maxPrice: number) => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  await page.goto(
    `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(
      query
    )}`,
    {
      waitUntil: 'domcontentloaded',
    }
  );

  await page.waitForSelector('.product-card');

  const results = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.product-card'));
    return items.map(item => {
      const priceText = item.querySelector('.product-price span')?.textContent;
      const link = item.querySelector('a')?.getAttribute('href');
      const price = priceText
        ? parseFloat(priceText.replace(/[^\d.]/g, ''))
        : null;
      return price && link
        ? {
            price,
            link: link.startsWith('http')
              ? link
              : 'https://www.temu.com' + link,
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
  return { source: 'Temu', ...cheapest };
};
