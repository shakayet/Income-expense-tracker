import { launchBrowser } from '../puppeteerHelper';

export const scrapeAmazon = async (query: string, maxPrice: number) => {
  // Import launchBrowser if not already
  // import { launchBrowser } from '../puppeteerHelper';
  const browser = await launchBrowser();
  const page = await browser.newPage();

  await page.goto(`https://www.amazon.it/s?k=${encodeURIComponent(query)}`, {
    waitUntil: 'domcontentloaded',
  });

  await page.waitForSelector(
    '[data-asin][data-component-type="s-search-result"]'
  );

  const results = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll(
        '[data-asin][data-component-type="s-search-result"]'
      )
    );
    return items.map(item => {
      const priceWhole = item
        .querySelector('.a-price .a-price-whole')
        ?.textContent?.replace(/[^\d]/g, '');
      const priceFraction = item
        .querySelector('.a-price .a-price-fraction')
        ?.textContent?.replace(/[^\d]/g, '');
      const price =
        priceWhole && priceFraction
          ? parseFloat(`${priceWhole}.${priceFraction}`)
          : null;

      const link = item.querySelector('h2 a')?.getAttribute('href');
      return price && link
        ? { price, link: 'https://www.amazon.it' + link }
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
  return { source: 'Amazon', ...cheapest };
};
