import axios from 'axios';
import * as cheerio from 'cheerio';
import { Product } from '../types'; // Ensure Product type is imported

const ZENROWS_API_KEY = '3d62e10536d5a0e4c3d84b9491dabc74e728c993';

export const scrapeAliExpress = async (
  productName: string,
  maxPrice: number
): Promise<Product[]> => {
  // Construct search URL with price sorting and filters
  const searchUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(
    productName
  )}&minPrice=0&maxPrice=${maxPrice}&sortBy=price_asc`;

  try {
    const { data } = await axios.get('https://api.zenrows.com/v1/', {
      params: {
        url: searchUrl,
        apikey: ZENROWS_API_KEY,
        premium_proxy: true,
        js_render: true,
        wait: 3000, // Increased wait for AliExpress rendering
        wait_for: '.list--gallery--C2f2tWQ', // Main product container
      },
      headers: {
        'Accept-Language': 'en-US,en;q=0.9', // Ensure English content
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);
    const results: Product[] = [];

    // Main product container selector
    $('.list--gallery--C2f2tWQ .card--out--DmRNyWk').each((_, el) => {
      // Extract title
      const title = $(el).find('.multi--titleText--nXeOvyr').text().trim();

      // Extract price - handles both integer and decimal prices
      const priceWhole = $(el)
        .find('.multi--price-sale--U-S0jtj')
        .text()
        .replace(/[^\d.,]/g, '') // Remove non-numeric except decimals
        .replace(/,/g, '.'); // Convert commas to dots
      const price = parseFloat(priceWhole);

      // Extract link
      const relativePath =
        $(el).find('a.manhattan--container--1lP57Ag').attr('href') || '';
      const link = `https://www.aliexpress.com${relativePath.split('?')[0]}`; // Clean URL

      // Validate and add to results
      if (title && link && !isNaN(price)) {
        results.push({
          title,
          price: +price.toFixed(2),
          link,
          source: 'AliExpress',
        });
      }
    });

    // Return top 3 valid results
    return results.filter(product => product.price <= maxPrice).slice(0, 3);
  } catch (error) {
    // Optionally log error: AliExpress ZenRows error
    return [];
  }
};
