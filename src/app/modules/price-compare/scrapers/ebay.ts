import { launchBrowser } from '../puppeteerHelper';
import { PriceResult } from '../compare.service';


export const scrapeEbay = async (query: string, maxPrice: number): Promise<PriceResult[] | null> => {
  try {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    
    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(
      `https://www.ebay.it/sch/i.html?_nkw=${encodeURIComponent(query)}`,
      {
        waitUntil: 'domcontentloaded',
        timeout: 40000
      }
    );

    await page.waitForSelector('.s-item', { timeout: 40000 });

    const results = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.s-item'));
      return items.map(item => {
        const priceText = item.querySelector('.s-item__price')?.textContent;
        const link = item.querySelector('.s-item__link')?.getAttribute('href');
        const price = priceText
          ? parseFloat(priceText.replace(/[^\d.]/g, ''))
          : null;
        return price && link ? { price, link, source: 'eBay' } : null;
      }).filter(Boolean); // Filter out nulls
    });

    await browser.close();

    // Filter by maxPrice and return all matching items
    const filtered = results.filter(
      (r): r is PriceResult => r !== null && r.price <= maxPrice
    );
    
    return filtered.length > 0 ? filtered : null;
  } catch (error) {
    console.error('eBay scraper error:', error);
    return null;
  }
};