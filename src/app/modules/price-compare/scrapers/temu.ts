import { launchBrowser } from '../puppeteerHelper';
import { PriceResult } from '../compare.service';

export const scrapeTemu = async (query: string, maxPrice: number): Promise<PriceResult[] | null> => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto(`https://www.temu.com/search_result.html?search_key=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await page.waitForSelector('.product-card, [data-test="product-card"], .JExcCA', { timeout: 40000 });

    const results = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.product-card, [data-test="product-card"], .JExcCA'));
      return items.map(item => {
        const priceText = item.querySelector('.product-price, ._2v0H9')?.textContent;
        const link = item.querySelector('a')?.href;
        const price = priceText ? parseFloat(priceText.replace(/[^\d.]/g, '')) : null;
        return price && link ? { price, link, source: 'Temu' } : null;
      }).filter(Boolean);
    });

    const filtered = results.filter((r: any) => r.price <= maxPrice).map((r: any) => ({
      ...r,
      price: parseFloat(r.price.toFixed(2))
    }));

    return filtered.length ? filtered.slice(0, 3) : null;
  } catch (error) {
    console.error('Temu scraper error:', error);
    return null;
  } finally {
    await browser.close();
  }
};
