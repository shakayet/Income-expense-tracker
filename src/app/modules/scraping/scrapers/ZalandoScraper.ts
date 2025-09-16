/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { BaseScraper } from './BaseScraper';
import { Product } from '../Product';
import * as cheerio from 'cheerio';

export class ZalandoScraper extends BaseScraper {
  constructor() {
    super('zalando', 'https://www.zalando.com');
  }

  protected buildSearchUrl(searchQuery: string): string {
    return `${this.baseUrl}/search?q=${encodeURIComponent(searchQuery)}`;
  }

  protected extractProductsFromHTML(html: string, maxPrice: number): Product[] {
    const $ = cheerio.load(html);
    const products: Product[] = [];

    $('[data-article]').each((index, element) => {
      const title = $(element).find('.articleName').text().trim();
      const priceText = $(element).find('.articlePrice').text().trim();
      const url = $(element).find('a').attr('href') || '';
      const imageUrl = $(element).find('img').attr('src') || '';

      const price = this.parsePrice(priceText);
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

      if (title && price > 0 && fullUrl) {
        products.push({
          id: `zalando-${index}-${Date.now()}`,
          title,
          price,
          currency: 'EUR',
          url: fullUrl,
          imageUrl,
          site: 'zalando',
          createdAt: new Date()
        });
      }
    });

    return products;
  }
}