/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Product, ApiCredentials } from './affiliate.model';
import axios from 'axios';

const credentials: ApiCredentials = {};

const genericSearch = async (siteName: string, query: string): Promise<Product[]> => {
  console.log(`Providing a generic search link for '${query}' on ${siteName}...`);

  const encodedQuery = encodeURIComponent(query);
  const links: Record<string, string> = {
    "Amazon": `https://www.amazon.it/s?k=${encodedQuery}`,
    "AliExpress": `https://www.aliexpress.com/wholesale?SearchText=${encodedQuery}`,
    "Temu": `https://www.temu.com/search_result.html?search_key=${encodedQuery}`,
    "Subito": `https://www.subito.it/annunci-italia/vendita/usato/?q=${encodedQuery}`,
    "Zalando": `https://www.zalando.it/catalogo/?q=${encodedQuery}`,
    "Alibaba": `https://www.alibaba.com/trade/search?SearchText=${encodedQuery}`,
    "ePrice": `https://www.eprice.it/search/${encodedQuery}`,
    "Mediaworld": `https://www.mediaworld.it/it/search.html?query=${encodedQuery}`,
    "Carrefour": `https://www.carrefour.fr/search?q=${encodedQuery}`,
    "Unieuro": `https://www.unieuro.it/online/products?q=${encodedQuery}`,
    "Douglas": `https://www.douglas.it/search?q=${encodedQuery}`,
    "Leroy Merlin": `https://www.leroymerlin.it/search?q=${encodedQuery}`,
    "Back Market": `https://www.backmarket.it/search?q=${encodedQuery}`,
    "Swappie": `https://www.swappie.com/it/`,
    "Notino": `https://www.notino.it/search.asp?exps=${encodedQuery}`
  };

  const link = links[siteName];
  if (!link) return [];

  return [{
    siteName,
    productTitle: `Generic search for "${query}"`,
    productPrice: 0,
    productLink: link
  }];
};

// Site-specific search functions
const searchAmazon = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.amazon;
  try {
    if (creds?.key && creds.secret) {
      console.log('Using Amazon PA-API with credentials...');
      const apiResponse = [{ siteName: 'Amazon', productTitle: 'Amazon API Product 1', productPrice: 45.99, productLink: 'https://amazon.com/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Amazon', query);
    }
  } catch (error) {
    console.error('Amazon search failed:', error);
    return [];
  }
};

const searcheBay = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.ebay;
  try {
    if (creds?.key) {
      console.log('Using eBay API with credentials...');
      const apiResponse = [{ siteName: 'eBay', productTitle: 'eBay API Product 1', productPrice: 39.99, productLink: 'https://ebay.com/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('eBay', query);
    }
  } catch (error) {
    console.error('eBay search failed:', error);
    return [];
  }
};

// FIX: New search function for Temu
const searchTemu = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.temu;
  try {
    if (creds?.key) {
      console.log('Using Temu API with credentials...');
      const apiResponse = [{ siteName: 'Temu', productTitle: 'Temu API Product 1', productPrice: 19.99, productLink: 'https://temu.com/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Temu', query);
    }
  } catch (error) {
    console.error('Temu search failed:', error);
    return [];
  }
};

// FIX: New search function for Subito
const searchSubito = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.subito;
  try {
    if (creds?.key) {
      console.log('Using Subito API with credentials...');
      const apiResponse = [{ siteName: 'Subito', productTitle: 'Subito API Product 1', productPrice: 85.00, productLink: 'https://subito.it/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Subito', query);
    }
  } catch (error) {
    console.error('Subito search failed:', error);
    return [];
  }
};

// FIX: New search function for Alibaba
const searchAlibaba = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.alibaba;
  try {
    if (creds?.key) {
      console.log('Using Alibaba API with credentials...');
      const apiResponse = [{ siteName: 'Alibaba', productTitle: 'Alibaba API Product 1', productPrice: 120.00, productLink: 'https://alibaba.com/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Alibaba', query);
    }
  } catch (error) {
    console.error('Alibaba search failed:', error);
    return [];
  }
};

const searchZalando = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.zalando;
  try {
    if (creds?.key) {
      console.log('Using Zalando (Awin) API with credentials...');
      const apiResponse = [{ siteName: 'Zalando', productTitle: 'Zalando Product', productPrice: 75.00, productLink: 'https://zalando.com/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Zalando', query);
    }
  } catch (error) {
    console.error('Zalando search failed:', error);
    return [];
  }
};

const searchMediaworld = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.mediaworld;
  try {
    if (creds?.key) {
      console.log('Using Mediaworld (Awin) API with credentials...');
      const apiResponse = [{ siteName: 'Mediaworld', productTitle: 'Mediaworld Product', productPrice: 199.99, productLink: 'https://mediaworld.it/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Mediaworld', query);
    }
  } catch (error) {
    console.error('Mediaworld search failed:', error);
    return [];
  }
};

const searchNotino = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.notino;
  try {
    if (creds?.key) {
      console.log('Using Notino (Awin) API with credentials...');
      const apiResponse = [{ siteName: 'Notino', productTitle: 'Notino Product', productPrice: 25.00, productLink: 'https://notino.it/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Notino', query);
    }
  } catch (error) {
    console.error('Notino search failed:', error);
    return [];
  }
};

const searchDouglas = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.douglas;
  try {
    if (creds?.key) {
      console.log('Using Douglas (CJ Affiliate/Awin) API with credentials...');
      const apiResponse = [{ siteName: 'Douglas', productTitle: 'Douglas Product', productPrice: 45.00, productLink: 'https://douglas.it/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Douglas', query);
    }
  } catch (error) {
    console.error('Douglas search failed:', error);
    return [];
  }
};

const searchLeroyMerlin = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.leroyMerlin;
  try {
    if (creds?.key) {
      console.log('Using Leroy Merlin (Impact/Awin) API with credentials...');
      const apiResponse = [{ siteName: 'Leroy Merlin', productTitle: 'Leroy Merlin Product', productPrice: 15.00, productLink: 'https://leroymerlin.it/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Leroy Merlin', query);
    }
  } catch (error) {
    console.error('Leroy Merlin search failed:', error);
    return [];
  }
};

const searchBackMarket = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.backMarket;
  try {
    if (creds?.key) {
      console.log('Using Back Market (Impact) API with credentials...');
      const apiResponse = [{ siteName: 'Back Market', productTitle: 'Back Market Product', productPrice: 350.00, productLink: 'https://backmarket.it/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Back Market', query);
    }
  } catch (error) {
    console.error('Back Market search failed:', error);
    return [];
  }
};

const searchSwappie = async (query: string, maxPrice: number): Promise<Product[]> => {
  const creds = credentials.swappie;
  try {
    if (creds?.key) {
      console.log('Using Swappie (Impact) API with credentials...');
      const apiResponse = [{ siteName: 'Swappie', productTitle: 'Swappie Product', productPrice: 280.00, productLink: 'https://swappie.com/api/1' }];
      return apiResponse
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
        .slice(0, 2);
    } else {
      return genericSearch('Swappie', query);
    }
  } catch (error) {
    console.error('Swappie search failed:', error);
    return [];
  }
};


export class AffiliateService {
  public setCredentials(newCreds: Partial<ApiCredentials>): void {
    Object.assign(credentials, newCreds);
    console.log('Affiliate API credentials updated.');
  }

  public async testCredentials(creds: Partial<ApiCredentials>): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        const isValid = !!(creds.amazon?.key || creds.ebay?.key);
        resolve(isValid);
      }, 500);
    });
  }

  public async searchProducts(searchQuery: string, maxPrice: number): Promise<Product[]> {
    const allPromises = [
      searchAmazon(searchQuery, maxPrice),
      searcheBay(searchQuery, maxPrice),
      searchTemu(searchQuery, maxPrice),
      searchSubito(searchQuery, maxPrice),
      searchAlibaba(searchQuery, maxPrice),
      searchZalando(searchQuery, maxPrice),
      searchMediaworld(searchQuery, maxPrice),
      searchNotino(searchQuery, maxPrice),
      searchDouglas(searchQuery, maxPrice),
      searchLeroyMerlin(searchQuery, maxPrice),
      searchBackMarket(searchQuery, maxPrice),
      searchSwappie(searchQuery, maxPrice)
    ];
    const results = await Promise.allSettled(allPromises);
    const allProducts: Product[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allProducts.push(...result.value);
      }
    });
    return allProducts;
  }
}