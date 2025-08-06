import { launchBrowser } from '../puppeteerHelper';
import { PriceResult } from '../compare.service';

export const scrapeSubito = async (query: string, maxPrice: number): Promise<PriceResult[] | null> => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    await page.goto(`https://www.subito.it/annunci-italia/vendita/usato/?q=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 40000,
    });

    await page.waitForSelector('[data-test="listing-item"]', { timeout: 40000 });

    const results = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-test="listing-item"]'));
      return items.map(item => {
        const priceEl = item.querySelector('[data-test="price"]')?.textContent;
        const link = item.querySelector('a')?.getAttribute('href');
        const price = priceEl ? parseFloat(priceEl.replace(/[^\d.]/g, '')) : null;

        if (price === null || !link) return null;
        return {
          price,
          link: link.startsWith('http') ? link : 'https://www.subito.it' + link,
          source: 'Subito',
        };
      }).filter(Boolean);
    });

    const filtered = results.filter((r: any) => r.price <= maxPrice).map((r: any) => ({
      ...r,
      price: parseFloat(r.price.toFixed(2))
    }));

    return filtered.length ? filtered.slice(0, 3) : null;
  } catch (error) {
    console.error('Subito scraper error:', error);
    return null;
  } finally {
    await browser.close();
  }
};
