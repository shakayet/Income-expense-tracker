/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { BaseScraper } from './BaseScraper';
import { Product } from '../Product';
import * as cheerio from 'cheerio';

export class DouglasScraper extends BaseScraper {
  constructor() {
    super('douglas', 'https://www.douglas.com');
  }

  protected buildSearchUrl(searchQuery: string): string {
    return `${this.baseUrl}/search?query=${encodeURIComponent(searchQuery)}`;
  }

  protected extractProductsFromHTML(html: string, maxPrice: number): Product[] {
    const $ = cheerio.load(html);
    const products: Product[] = [];

    $('.product-item').each((index, element) => {
      const title = $(element).find('.product-name').text().trim();
      const priceText = $(element).find('.price').text().trim();
      const url = $(element).find('a').attr('href') || '';
      const imageUrl = $(element).find('img').attr('src') || '';

      const price = this.parsePrice(priceText);
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

      if (title && price > 0 && fullUrl) {
        products.push({
          id: `douglas-${index}-${Date.now()}`,
          title,
          price,
          currency: 'EUR',
          url: fullUrl,
          imageUrl,
          site: 'douglas',
          createdAt: new Date()
        });
      }
    });

    return products;
  }
}