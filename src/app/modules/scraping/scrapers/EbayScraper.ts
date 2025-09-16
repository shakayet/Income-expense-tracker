/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { BaseScraper } from './BaseScraper';
import { Product } from '../Product';
import * as cheerio from 'cheerio';

export class EbayScraper extends BaseScraper {
  constructor() {
    super('ebay', 'https://www.ebay.com');
  }

  protected buildSearchUrl(searchQuery: string): string {
    return `${this.baseUrl}/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}`;
  }

  protected extractProductsFromHTML(html: string, maxPrice: number): Product[] {
    const $ = cheerio.load(html);
    const products: Product[] = [];

    $('.s-item').each((index, element) => {
      if (index === 0) return; // Skip first item (sometimes it's a header)

      const title = $(element).find('.s-item__title').text().trim();
      const priceText = $(element).find('.s-item__price').text().trim();
      const url = $(element).find('.s-item__link').attr('href') || '';
      const imageUrl = $(element).find('.s-item__image-img').attr('src') || '';

      const price = this.parsePrice(priceText);

      if (title && price > 0 && url) {
        products.push({
          id: `ebay-${index}-${Date.now()}`,
          title,
          price,
          currency: 'USD',
          url,
          imageUrl,
          site: 'ebay',
          createdAt: new Date()
        });
      }
    });

    return products;
  }
}