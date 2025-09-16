/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { Product } from '../Product';

const DEFAULT_REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive'
};

const REQUEST_TIMEOUT = 30000;
const MAX_PRODUCTS_PER_SITE = 2;

export abstract class BaseScraper {
  protected axiosInstance: AxiosInstance;
  protected siteName: string;
  protected baseUrl: string;

  constructor(siteName: string, baseUrl: string) {
    this.siteName = siteName;
    this.baseUrl = baseUrl;
    
    this.axiosInstance = axios.create({
      timeout: REQUEST_TIMEOUT,
      headers: DEFAULT_REQUEST_HEADERS,
      validateStatus: (status) => status < 500
    });
  }

  protected async fetchHTML(url: string): Promise<string> {
    try {
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch HTML from ${url}:`, error);
      throw new Error(`Failed to fetch HTML from ${this.siteName}`);
    }
  }

  protected parsePrice(priceText: string): number {
    const numericPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(numericPrice) || 0;
  }

  protected abstract buildSearchUrl(searchQuery: string): string;
  protected abstract extractProductsFromHTML(html: string, maxPrice: number): Product[];

  public async scrape(searchQuery: string, maxPrice: number): Promise<Product[]> {
    const searchUrl = this.buildSearchUrl(searchQuery);
    console.log(`Scraping ${this.siteName} with URL: ${searchUrl}`);
    
    try {
      const html = await this.fetchHTML(searchUrl);
      const products = this.extractProductsFromHTML(html, maxPrice);
      
      // Filter by price and limit results
      const filteredProducts = products
        .filter(product => product.price <= maxPrice)
        .slice(0, MAX_PRODUCTS_PER_SITE);
      
      console.log(`Found ${filteredProducts.length} products from ${this.siteName}`);
      return filteredProducts;
    } catch (error) {
      console.error(`Scraping failed for ${this.siteName}:`, error);
      return [];
    }
  }
}