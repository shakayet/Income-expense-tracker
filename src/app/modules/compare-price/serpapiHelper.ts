import { getJson } from 'serpapi';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.SERPAPI_KEY;

if (!API_KEY) {
  throw new Error('SERPAPI_KEY is not defined in environment variables');
}

export type ScrapedItem = {
  source: string;
  title: string;
  price: number | null;
  link: string;
  thumbnail?: string;
}

export async function scrapeSiteFromSerpApi(
  query: string,
  site: string
): Promise<ScrapedItem[]> {
  try {
    const params = {
      engine: 'google_shopping',
      q: query,
      location: 'Italy',
      api_key: API_KEY,
      google_domain: 'google.it',
      num: 50,
      gl: 'it',
      hl: 'it',
      tbs: 'p_ord:pd',
    };

    const json = await getJson(params);

    return json.shopping_results.map((item: any) => {
      let link = item.link || item.url;

      // Construct direct product links when possible
      if (!link && item.product_id) {
        if (site.toLowerCase().includes('amazon')) {
          link = `https://www.amazon.it/dp/${item.product_id}`;
        } else if (site.toLowerCase().includes('aliexpress')) {
          link = `https://www.aliexpress.it/item/${item.product_id}.html`;
        } else if (site.toLowerCase().includes('zalando')) {
          link = item.slug ? `https://www.zalando.it/${item.slug}` : null;
        }
      }

      // Fallback to Google search if no direct link
      if (!link && item.title) {
        link = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
          item.title
        )}`;
      }

      return {
        source: item.source || site,
        title: item.title,
        price: item.extracted_price || item.price || null,
        link: link || '',
        thumbnail: item.thumbnail,
      };
    });
  } catch (error) {
    // console.error(`[Scraper] ${site} critical error:`, error);
    return [];
  }
}
