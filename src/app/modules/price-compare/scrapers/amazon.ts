import { launchBrowser } from '../puppeteerHelper';
import { PriceResult } from '../compare.service';

export const scrapeAmazon = async (query: string, maxPrice: number): Promise<PriceResult[] | null> => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.setJavaScriptEnabled(true);

    await page.goto(`https://www.amazon.it/s?k=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    const results = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-asin][data-component-type="s-search-result"]'));
      return items.map(item => {
        const priceWhole = item.querySelector('.a-price .a-price-whole')?.textContent?.replace(/[^\d]/g, '');
        const priceFraction = item.querySelector('.a-price .a-price-fraction')?.textContent?.replace(/[^\d]/g, '');
        const link = item.querySelector('h2 a')?.getAttribute('href');

        const price = priceWhole && priceFraction ? parseFloat(`${priceWhole}.${priceFraction}`) : null;
        return price && link ? { price, link: 'https://www.amazon.it' + link, source: 'Amazon' } : null;
      }).filter(Boolean);
    });

    const filtered = results.filter((r: any) => r.price <= maxPrice).map((r: any) => ({
      ...r,
      price: parseFloat(r.price.toFixed(2))
    }));

    return filtered.length ? filtered.slice(0, 3) : null;
  } catch (error) {
    console.error('Amazon scraper error:', error);
    return null;
  } finally {
    await browser.close();
  }
};
