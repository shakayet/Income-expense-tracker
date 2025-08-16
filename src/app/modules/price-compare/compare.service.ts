// src/modules/priceComparison/priceComparison.service.ts

// import { scrapeAmazon } from './scrapers/amazon';
import { scrapeEbay } from './scrapers/ebay';

export type PriceResult = {
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
          resolve(null);
        }, timeout)
      ),
    ]);
  } catch (error) {
    return null;
  }
};

// Generic link generators
const buildGenericLinks = (product: string) => {
  const encoded = encodeURIComponent(product);
  return [
    { source: "Amazon", link: `https://www.amazon.it/s?k=${encoded}` },
    { source: "AliExpress", link: `https://www.aliexpress.com/wholesale?SearchText=${encoded}` },
    { source: "Temu", link: `https://www.temu.com/search_result.html?search_key=${encoded}` },
    { source: "Subito", link: `https://www.subito.it/annunci-italia/vendita/usato/?q=${encoded}` },
    { source: "Zalando", link: `https://www.zalando.it/catalogo/?q=${encoded}` },
    { source: "Alibaba", link: `https://www.alibaba.com/trade/search?SearchText=${encoded}` },
    { source: "ePrice", link: `https://www.eprice.it/search/${encoded}` },
    { source: "Mediaworld", link: `https://www.mediaworld.it/search/${encoded}` },
    { source: "Carrefour", link: `https://www.carrefour.it/search?q=${encoded}` },
    { source: "Unieuro", link: `https://www.unieuro.it/online/search?text=${encoded}` },
  ];
};

export const comparePrices = async (
  product: string,
  maxPrice: number
): Promise<
  { found: true; data: GroupedResult[]; generic: { source: string; link: string }[] } |
  { found: false; message: string; generic: { source: string; link: string }[] }
> => {
  const SCRAPER_TIMEOUT = 120000;
  const scrapers = [
    { name: 'eBay', fn: () => scrapeEbay(product, maxPrice) },
  ];

  // Run scrapers sequentially
  const results = [];
  for (const scraper of scrapers) {
    const result = await runScraperSafely(
      scraper.fn,
      scraper.name,
      SCRAPER_TIMEOUT
    );
    results.push(result);
  }

  const grouped: GroupedResult[] = [];

  // Process results
  results.forEach(result => {
    if (result === null) return;

    let items: PriceResult[] = Array.isArray(result)
      ? result
      : result
      ? [result]
      : [];

    items = items
      .filter(item => item.price <= maxPrice)
      .map(item => ({ ...item, price: parseFloat(item.price.toFixed(2)) }));

    if (items.length === 0) return;

    // Group by source and take top 3 cheapest
    const sources = [...new Set(items.map(item => item.source))];
    for (const source of sources) {
      const sourceItems = items.filter(item => item.source === source);
      const top3 = sourceItems.sort((a, b) => a.price - b.price).slice(0, 3);

      if (top3.length > 0) {
        grouped.push({ source, results: top3 });
      }
    }
  });

  // Always prepare generic links
  const genericLinks = buildGenericLinks(product);

  if (grouped.length === 0) {
    return {
      found: false,
      message: 'No products found below the given price.',
      generic: genericLinks,
    };
  }

  // Sort groups by lowest price in group
  grouped.sort(
    (a, b) =>
      Math.min(...a.results.map(r => r.price)) -
      Math.min(...b.results.map(r => r.price))
  );

  return {
    found: true,
    data: grouped,
    generic: genericLinks,
  };
};
