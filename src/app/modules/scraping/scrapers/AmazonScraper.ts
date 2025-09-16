/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { BaseScraper } from './BaseScraper';
import { Product } from '../Product';
import * as cheerio from 'cheerio';

export class AmazonScraper extends BaseScraper {
  constructor() {
    super('amazon', 'https://www.amazon.com');
  }

  protected buildSearchUrl(searchQuery: string): string {
    return `${this.baseUrl}/s?k=${encodeURIComponent(searchQuery)}`;
  }

  protected extractProductsFromHTML(html: string, maxPrice: number): Product[] {
    const $ = cheerio.load(html);
    const products: Product[] = [];

    $('.s-result-item').each((index, element) => {
      const title = $(element).find('h2 a span').text().trim();
      const priceWhole = $(element).find('.a-price-whole').text().trim();
      const priceFraction = $(element).find('.a-price-fraction').text().trim();
      const priceText = priceWhole + priceFraction;
      const url = $(element).find('h2 a').attr('href') || '';
      const imageUrl = $(element).find('.s-image').attr('src') || '';
      const rating = parseFloat($(element).find('.a-icon-alt').text().split(' ')[0]) || 0;
      const reviewCount = parseInt($(element).find('.a-size-base').text().replace(',', '')) || 0;

      const price = this.parsePrice(priceText);
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

      if (title && price > 0 && fullUrl) {
        products.push({
          id: `amazon-${index}-${Date.now()}`,
          title,
          price,
          currency: 'USD',
          url: fullUrl,
          imageUrl,
          site: 'amazon',
          rating,
          reviewCount,
          createdAt: new Date()
        });
      }
    });

    return products;
  }
}