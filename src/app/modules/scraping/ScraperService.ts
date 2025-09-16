/* eslint-disable no-console */
import { Product, ScrapeRequest, ScrapeResult } from './Product';
import { EbayScraper } from './scrapers/EbayScraper';
import { AmazonScraper } from './scrapers/AmazonScraper';
import { ZalandoScraper } from './scrapers/ZalandoScraper';
import { MediaworldScraper } from './scrapers/MediaworldScraper';
import { NotinoScraper } from './scrapers/NotinoScraper';
import { DouglasScraper } from './scrapers/DouglasScraper';
import { LeroyMerlinScraper } from './scrapers/LeroyMerlinScraper';
import { BackMarketScraper } from './scrapers/BackMarketScraper';
import { SwappieScraper } from './scrapers/SwappieScraper';
import { BaseScraper } from './scrapers/BaseScraper';

// import { ScraperService } from '../services/ScraperService';

export class ScraperService {
  private scrapers: Map<string, BaseScraper>;

  constructor() {
    this.scrapers = new Map();
    this.initializeScrapers();
  }

  private initializeScrapers(): void {
    this.scrapers.set('ebay', new EbayScraper());
    this.scrapers.set('amazon', new AmazonScraper());
    this.scrapers.set('zalando', new ZalandoScraper());
    this.scrapers.set('mediaworld', new MediaworldScraper());
    this.scrapers.set('notino', new NotinoScraper());
    this.scrapers.set('douglas', new DouglasScraper());
    this.scrapers.set('leroymerlin', new LeroyMerlinScraper());
    this.scrapers.set('backmarket', new BackMarketScraper());
    this.scrapers.set('swappie', new SwappieScraper());
  }

  public async scrapeAllSites(request: ScrapeRequest): Promise<ScrapeResult> {
    const { searchQuery, maxPrice } = request;
    const results: Product[] = [];
    const successfulSites: string[] = [];
    const failedSites: string[] = [];

    const scrapePromises = Array.from(this.scrapers.entries()).map(async ([siteName, scraper]) => {
      try {
        const products = await scraper.scrape(searchQuery, maxPrice);
        results.push(...products);
        successfulSites.push(siteName);
        
        console.log(`Successfully scraped ${products.length} products from ${siteName}`);
      } catch (error) {
        failedSites.push(siteName);
        console.error(`Failed to scrape ${siteName}:`, error);
      }
    });

    await Promise.allSettled(scrapePromises);

    return {
      products: results,
      totalCount: results.length,
      successfulSites,
      failedSites
    };
  }

  public getSupportedSites(): string[] {
    return Array.from(this.scrapers.keys());
  }
}

export class ProductSearchService {
  private scraperService: ScraperService;

  constructor() {
    this.scraperService = new ScraperService();
  }

  public async searchProducts(searchQuery: string, maxPrice: number): Promise<ScrapeResult> {
    const request: ScrapeRequest = {
      searchQuery,
      maxPrice
    };

    return await this.scraperService.scrapeAllSites(request);
  }
}