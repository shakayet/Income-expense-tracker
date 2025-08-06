import { launchBrowser } from '../puppeteerHelper';
import { PriceResult } from '../compare.service';

export const scrapeAliExpress = async (
  query: string,
  maxPrice: number
): Promise<PriceResult[] | null> => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    const searchURL = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(query)}`;
    await page.goto(searchURL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.waitForSelector('.manhattan--container--1lP57Ag', { timeout: 40000 });

    const results: PriceResult[] = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.manhattan--container--1lP57Ag'));
      return items.map((item) => {
        const priceText = item.querySelector('.manhattan--price-sale--1CCSZfK')?.textContent;
        const link = item.querySelector('a')?.getAttribute('href');

        const price = priceText
          ? parseFloat(priceText.replace(/[^\d.]/g, ''))
          : null;

        if (!price || !link) return null;

        return {
          price,
          link: link.startsWith('http') ? link : 'https:' + link,
          source: 'AliExpress',
        };
      }).filter(Boolean) as PriceResult[];
    });

    const filtered = results.filter((r) => r.price <= maxPrice);
    return filtered.length > 0 ? filtered : null;
  } catch (err) {
    console.error('AliExpress scraper error:', err);
    return null;
  } finally {
    await browser.close();
  }
};
