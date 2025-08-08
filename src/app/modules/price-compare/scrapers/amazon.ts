import axios from 'axios';
import * as cheerio from 'cheerio';
import { Product } from '../types';

const ZENROWS_API_KEY = '3d62e10536d5a0e4c3d84b9491dabc74e728c993';

export const scrapeAmazon = async (
  productName: string,
  maxPrice: number
): Promise<Product[]> => {
  const searchUrl = `https://www.amazon.it/s?k=${encodeURIComponent(productName)}&s=price-asc-rank`;

  try {
    const { data } = await axios.get('https://api.zenrows.com/v1/', {
      params: {
        url: searchUrl,
        apikey: ZENROWS_API_KEY,
        premium_proxy: true,
        js_render: true,
        // Added parameters to ensure proper rendering
        wait: 2000,
        wait_for: 'div.s-result-item'
      }
    });

    const $ = cheerio.load(data);
    const results: Product[] = [];

    $('div.s-result-item').each((_, el) => {
      const title = $(el).find('h2 span').text().trim();
      
      // Extract price components
      const priceWhole = $(el).find('.a-price-whole').first().text().replace(/[^\d]/g, '');
      const priceFraction = $(el).find('.a-price-fraction').first().text().replace(/[^\d]/g, '');
      const price = parseFloat(`${priceWhole}.${priceFraction}`);
      
      // FIXED LINK EXTRACTION:
      // 1. Get the anchor element more reliably
      const linkElement = $(el).find('a.a-link-normal.s-no-outline');
      // 2. Fallback to alternative selector if needed
      const href = linkElement.attr('href') || $(el).find('h2 a').attr('href');
      // 3. Construct full URL only if href exists
      const link = href ? `https://www.amazon.it${href}` : null;

      // Only add product if all required fields are valid
      if (title && link && !isNaN(price) && price <= maxPrice) {
        results.push({ 
          title, 
          price: +price.toFixed(2), 
          link, 
          source: 'Amazon' 
        });
      }
    });

    return results.slice(0, 3);
  } catch (error) {
    console.error('❌ Amazon ZenRows error:', error.message);
    return [];
  }
};