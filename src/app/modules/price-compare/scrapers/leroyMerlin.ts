// // src/scrapers/leroymerlinScraper.ts
// import { scrapeStore } from '../utils/scraperUtils';

// export const scrapeLeroyMerlin = async (productName: string, maxPrice: number) => {
//   return scrapeStore(productName, maxPrice, {
//     source: 'Leroy Merlin',
//     url: 'https://www.leroymerlin.it/prodotti/cerca?search={product}&sort=price-asc',
//     containerSelector: '.product-card',
//     titleSelector: '.product-name',
//     priceSelector: '.product-price',
//     linkSelector: '.product-link',
//     linkPrefix: 'https://www.leroymerlin.it'
//   });
// };