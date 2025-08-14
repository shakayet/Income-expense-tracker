// // src/scrapers/mediaworldScraper.ts
// import { scrapeStore } from '../utils/scraperUtils';

// export const scrapeMediaWorld = async (productName: string, maxPrice: number) => {
//   return scrapeStore(productName, maxPrice, {
//     source: 'MediaWorld',
//     url: 'https://www.mediamarkt.it/it/search.html?query={product}&sort=price_asc',
//     containerSelector: 'div[data-test="mms-search-srp-productlist-item"]',
//     titleSelector: 'h2',
//     priceSelector: 'div[data-test="product-price"]',
//     linkSelector: 'a',
//     linkPrefix: 'https://www.mediamarkt.it'
//   });
// };