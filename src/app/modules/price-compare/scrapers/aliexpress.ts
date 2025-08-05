import { launchBrowser } from '../puppeteerHelper';

export const scrapeAliExpress = async (query: string, maxPrice: number) => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    // Configure page to prevent detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
    );
    await page.setViewport({ width: 1366, height: 768 });

    // Build search URL
    const searchURL = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(
      query
    )}`;

    // Navigate with comprehensive wait conditions
    await page.goto(searchURL, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Wait for either search results or no-results message
    await Promise.race([
      page.waitForSelector('.search-card-item', { timeout: 10000 }),
      page.waitForSelector('.no-result', { timeout: 10000 }),
    ]);

    // Check for no results
    const noResults = await page.$('.no-result');
    if (noResults) {
      // No results found
      return null;
    }

    // Extract product data
    const results: Array<{ price: number; link: string } | null> =
      await page.evaluate(() => {
        const items = Array.from(
          document.querySelectorAll('.search-card-item')
        );
        return items.map(item => {
          try {
            // Modern price selector
            const priceEl =
              item.querySelector('.snow-price_SnowPrice__mainM__jlh6el') ||
              item.querySelector('.multi--price-sale--U-S0jtj') ||
              item.querySelector('.search-price');

            // Product link selector
            const linkEl = item.querySelector(
              '.search-card-item'
            ) as HTMLAnchorElement;

            if (!priceEl || !linkEl) return null;

            // Handle price ranges (e.g., "US $1.99 - $2.99")
            let priceText = priceEl.textContent?.trim() || '';
            priceText = priceText.split('-')[0].trim();

            // Extract numeric price
            const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

            // Handle relative URLs
            const href = linkEl.href || '';
            const link = href.startsWith('//') ? `https:${href}` : href;

            return { price, link };
          } catch {
            return null;
          }
        });
      });

    // Filter out nulls and by max price
    const filtered: Array<{ price: number; link: string }> = results.filter(
      (r): r is { price: number; link: string } =>
        r !== null && typeof r.price === 'number' && r.price <= maxPrice
    );
    if (filtered.length === 0) {
      // No items under maxPrice found
      return null;
    }

    // Find cheapest option
    const cheapest = filtered.reduce((prev, current) => {
      if (!prev) return current;
      if (!current) return prev;
      return prev.price < current.price ? prev : current;
    }, filtered[0]);

    if (!cheapest) return null;
    return {
      source: 'AliExpress',
      price: cheapest.price,
      link: cheapest.link,
    };
  } catch (error) {
    // Optionally log error using a logger here
    return null;
  } finally {
    await browser.close();
  }
};
