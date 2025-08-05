import { scrapeAliExpress } from './scrapers/aliexpress';
import { scrapeAmazon } from './scrapers/amazon';
import { scrapeTemu } from './scrapers/temu';
import { scrapeEbay } from './scrapers/ebay';
import { scrapeSubito } from './scrapers/subito';

type PriceResult = {
  price: number;
  link: string;
  source: string;
};

export const comparePrices = async (
  product: string,
  maxPrice: number
): Promise<
  | { found: true; price: number; link: string; source: string }
  | { found: false; message: string }
> => {
  const scrapers: Array<
    (product: string, maxPrice: number) => Promise<PriceResult | null>
  > = [scrapeAmazon, scrapeAliExpress, scrapeEbay, scrapeTemu, scrapeSubito];

  const results = await Promise.allSettled(
    scrapers.map((fn) => fn(product, maxPrice))
  );

  const validResults: PriceResult[] = results
    .filter(
      (r): r is PromiseFulfilledResult<PriceResult | null> =>
        r.status === 'fulfilled' && r.value !== null
    )
    .map((r) => r.value!); // TypeScript now knows r is fulfilled and value is not null

  if (validResults.length === 0) {
    return {
      found: false,
      message: 'No product found below the given price.',
    };
  }

  const best = validResults.sort((a, b) => a.price - b.price)[0];
  return {
    found: true,
    ...best,
  };
};

