import { scrapeAliExpress } from './scrapers/aliexpress';
import { scrapeAmazon } from './scrapers/amazon';
import { scrapeTemu } from './scrapers/temu';
import { scrapeEbay } from './scrapers/ebay';
import { scrapeSubito } from './scrapers/subito';
import { scrapeAlibaba } from './scrapers/alibaba';
import { scrapeZalando } from './scrapers/zalando';
import { scrapeEtsy } from './scrapers/zalando';
import { scrapeUnieuro } from './scrapers/unieuro';
import { scrapeDecathlon } from './scrapers/decathlon';
import {scrapeLeroyMerlin } from './scrapers/leroyMerlin';
import { scrapeMediaWorld } from './scrapers/mediaWorld';

type PriceResult = {
  price: number;
  link: string;
  source: string;
  title: string;
};

type GroupedResult = {
  source: string;
  results: PriceResult[];
};

// Helper function to safely run scrapers with timeout
const runScraperSafely = async <T>(
  fn: () => Promise<T | null>,
  name: string,
  timeout: number
): Promise<T | null> => {
  try {
    return await Promise.race([
      fn(),
      new Promise<null>(resolve =>
        setTimeout(() => {
          console.warn(`⚠️ ${name} timed out after ${timeout}ms`);
          resolve(null);
        }, timeout)
      ),
    ]);
  } catch (error) {
    console.error(
      `❌ ${name} failed:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
};

export const comparePrices = async (
  product: string,
  maxPrice: number
): Promise<
  { found: true; data: GroupedResult[] } | { found: false; message: string }
> => {
  const SCRAPER_TIMEOUT = 120000;
  const scrapers = [
    // { name: 'Amazon', fn: () => scrapeAmazon(product, maxPrice) },
    // { name: 'AliExpress', fn: () => scrapeAliExpress(product, maxPrice) },
    // { name: 'eBay', fn: () => scrapeEbay(product, maxPrice) },
    // { name: 'Temu', fn: () => scrapeTemu(product, maxPrice) },
    // { name: 'Subito', fn: () => scrapeSubito(product, maxPrice) },
    // { name: 'Alibaba', fn: () => scrapeAlibaba(product, maxPrice) },
    // { name: 'Zalando', fn: () => scrapeZalando(product, maxPrice) },
    // { name: 'Etsy', fn: () => scrapeEtsy(product, maxPrice) },
    // { name: 'Unieuro', fn: () => scrapeUnieuro(product, maxPrice) },
    // { name: 'Decathlon', fn: () => scrapeDecathlon(product, maxPrice) },
    // { name: 'LeroyMerlin', fn: () => scrapeLeroyMerlin(product, maxPrice) },
    // { name: 'MediaWorld', fn: () => scrapeMediaWorld(product, maxPrice) },
  ];

  console.log(`Starting price comparison for: ${product} (max €${maxPrice})`);

  // Run scrapers sequentially
  const results = [];
  for (const scraper of scrapers) {
    console.log(`🚀 Starting ${scraper.name} scraper...`);
    const result = await runScraperSafely(
      scraper.fn,
      scraper.name,
      SCRAPER_TIMEOUT
    );
    results.push(result);
  }

  const grouped: GroupedResult[] = [];
  let totalResults = 0;

  // Process results
  for (const [index, result] of results.entries()) {
    const scraperName = scrapers[index].name;

    if (result === null) {
      console.warn(`➖ ${scraperName} returned no results`);
      continue;
    }

    // Normalize results to array format
    let items: PriceResult[] = Array.isArray(result)
      ? result
      : result
      ? [result]
      : [];

    items = items
      .filter(item => item.price <= maxPrice)
      .map(item => ({ ...item, price: parseFloat(item.price.toFixed(2)) }));

    if (items.length === 0) {
      console.warn(`➖ ${scraperName} had no valid results under €${maxPrice}`);
      continue;
    }

    console.log(`✅ ${scraperName} returned ${items.length} valid items`);

    // Group by source and take top 3 cheapest
    const sources = [...new Set(items.map(item => item.source))];
    for (const source of sources) {
      const sourceItems = items.filter(item => item.source === source);
      const top3 = sourceItems.sort((a, b) => a.price - b.price).slice(0, 3);

      if (top3.length > 0) {
        grouped.push({ source, results: top3 });
        totalResults += top3.length;
        console.log(`⭐ ${source}: ${top3.length} items added`);
      }
    }
  }

  if (grouped.length === 0) {
    console.log('❌ No valid results found from any scraper');
    return {
      found: false,
      message: 'No products found below the given price.',
    };
  }

  // Sort groups by lowest price in group
  grouped.sort(
    (a, b) =>
      Math.min(...a.results.map(r => r.price)) -
      Math.min(...b.results.map(r => r.price))
  );

  console.log(
    `🎉 Found ${totalResults} items across ${grouped.length} sources`
  );
  return {
    found: true,
    data: grouped,
  };
};
