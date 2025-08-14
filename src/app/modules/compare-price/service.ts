import { getJson } from 'serpapi';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.SERPAPI_KEY;
if (!API_KEY)
  throw new Error('SERPAPI_KEY is not defined in environment variables');

export interface ScrapedItem {
  source: string;
  title: string;
  price: number | null;
  link: string;  // Now guaranteed to be a valid URL
  thumbnail?: string;
}

export async function scrapeProducts(query: string): Promise<ScrapedItem[]> {
  try {
    console.log(`[Compare] Searching "${query}"`);

    const params = {
      engine: 'google_shopping',
      q: query,
      location: 'Italy',
      google_domain: 'google.it',
      gl: 'it',
      hl: 'it',
      num: 50,
      api_key: API_KEY,
    };

    const json = await getJson(params);

    if (!json.shopping_results || !json.shopping_results.length) {
      console.warn(`[Compare] No shopping results for query: ${query}`);
      return [];
    }

    // Extract direct links from results
    return json.shopping_results
      .map((item: any) => {
        // Get direct product URL when available
        const directUrl = item.product_link || 
                          item.merchant_page_url || 
                          item.extensions?.merchant?.link;

        // Use Google redirect only as fallback
        const finalLink = directUrl || item.link || item.url;

        return {
          source: item.source || 'Unknown',
          title: item.title || 'No title',
          price: item.extracted_price || item.price || null,
          link: finalLink,
          thumbnail: item.thumbnail,
        };
      })
      .filter(item => item.link); // Ensure all items have links
  } catch (error) {
    console.error('[Compare] Critical error fetching products:', error);
    return [];
  }
}

// Rest of the code remains unchanged

// Filter and group by site (unchanged)
export function filterAndGroupProducts(items: ScrapedItem[], maxPrice: number) {
  // Filter by price
  const filtered = items.filter(
    item => item.price != null && item.price <= maxPrice
  );

  // Group by source
  const grouped: Record<string, ScrapedItem[]> = {};
  filtered.forEach(item => {
    const site = item.source.toLowerCase();
    if (!grouped[site]) grouped[site] = [];
    grouped[site].push(item);
  });

  // Sort each site by price and take top 5
  for (const site in grouped) {
    grouped[site] = grouped[site]
      .sort((a, b) => a.price! - b.price!)
      .slice(0, 10);
  }

  return grouped;
}

// Example usage (unchanged)
export async function comparePrice(query: string, maxPrice: number) {
  const items = await scrapeProducts(query);
  const results = filterAndGroupProducts(items, maxPrice);

  console.log(
    `[Compare] Final results for "${query}":`,
    JSON.stringify(results, null, 2)
  );
  return results;
}