import { launchBrowser } from '../puppeteerHelper';
import { PriceResult } from '../compare.service';

export const scrapeEbay = async (
  query: string,
  maxPrice: number
): Promise<PriceResult[] | null> => {
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Configure browser to mimic human behavior
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    // Navigate with optimized parameters
    await page.goto(
      `https://www.ebay.it/sch/i.html?_nkw=${encodeURIComponent(query)}&_ipg=120`,
      {
        waitUntil: 'networkidle2',
        timeout: 60000
      }
    );

    // Wait for core content
    await page.waitForSelector('.s-item', { timeout: 45000 });

    const results = await page.evaluate((maxPrice) => {
      return Array.from(document.querySelectorAll('.s-item'))
        .slice(1) // Skip first item (usually header)
        .map(item => {
          try {
            const priceEl = item.querySelector('.s-item__price');
            const linkEl = item.querySelector('.s-item__link');
            
            if (!priceEl?.textContent || !linkEl?.href) return null;

            // Extract and clean price
            let priceText = priceEl.textContent.trim();
            
            // Handle price ranges
            if (priceText.includes(' a ') || priceText.includes(' to ')) {
              priceText = priceText.split(/ a | to /i)[0].trim();
            }

            // Normalize currency format
            const cleanPrice = priceText
              .replace(/[^\d,.]/g, '') // Remove non-numeric chars
              .replace(/\./g, '')       // Remove thousands separators
              .replace(/,/g, '.');       // Convert decimal commas to dots

            const price = parseFloat(cleanPrice);
            if (isNaN(price)) return null;
            
            // Filter within evaluation to reduce memory
            if (price > maxPrice) return null;

            return {
              price,
              link: linkEl.href,
              source: 'eBay'
            };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
    }, maxPrice);

    return results.length > 0 ? results : null;
  } catch (error) {
    console.error('eBay scraper error:', error);
    return null;
  } finally {
    if (browser) await browser.close();
  }
};