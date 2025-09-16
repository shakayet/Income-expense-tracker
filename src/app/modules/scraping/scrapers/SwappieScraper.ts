/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { BaseScraper } from './BaseScraper';
import { Product } from '../Product';
import * as cheerio from 'cheerio';

export class SwappieScraper extends BaseScraper {
  constructor() {
    super('swappie', 'https://www.swappie.com');
  }

  protected buildSearchUrl(searchQuery: string): string {
    return `${this.baseUrl}/search?q=${encodeURIComponent(searchQuery)}`;
  }

  protected extractProductsFromHTML(html: string, maxPrice: number): Product[] {
    const $ = cheerio.load(html);
    const products: Product[] = [];

    $('.product').each((index, element) => {
      const title = $(element).find('.product-name').text().trim();
      const priceText = $(element).find('.price').text().trim();
      const url = $(element).find('a').attr('href') || '';
      const imageUrl = $(element).find('img').attr('src') || '';

      const price = this.parsePrice(priceText);
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

      if (title && price > 0 && fullUrl) {
        products.push({
          id: `swappie-${index}-${Date.now()}`,
          title,
          price,
          currency: 'EUR',
          url: fullUrl,
          imageUrl,
          site: 'swappie',
          createdAt: new Date()
        });
      }
    });

    return products;
  }
}