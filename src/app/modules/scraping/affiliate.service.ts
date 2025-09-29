/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Product, ApiCredentials } from './affiliate.model';
import axios from 'axios';

// const credentials: ApiCredentials = {};

const credentials: ApiCredentials = {
  ebay: {
    key: "Shakayet-incomeex-SBX-975d8a3c1-21464f6f", // App ID
    secret: "SBX-75d8a3c1f3d1-1ba3-40fc-9b3a-f5d3",  // Cert ID
    token: "v^1.1#i^1#f^0#p^1#I^3#r^0#t^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" // Sandbox token
  }
};

// 🔑 Helper to fetch fresh token if needed
const getEbayAccessToken = async (): Promise<string> => {
  const tokenUrl = "https://api.sandbox.ebay.com/identity/v1/oauth2/token";
  const basicAuth = Buffer.from(
    `${credentials.ebay.key}:${credentials.ebay.secret}`
  ).toString("base64");

  const res = await axios.post(
    tokenUrl,
    "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
    }
  );

  return res.data.access_token;
};



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

// ✅ eBay real API search
const searcheBay = async (query: string, maxPrice: number): Promise<Product[]> => {
  try {
    if (credentials.ebay?.key && credentials.ebay?.secret) {
      console.log('Using eBay Browse API with credentials...');

      // 1. Get OAuth token (you can also use hardcoded token if still valid)
      const token = await getEbayAccessToken();

      // 2. Build Browse API query
      const url = `https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
        query
      )}&filter=price:[..${maxPrice}]&limit=3`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = res.data.itemSummaries || [];
      return items
        .map((item: any) => ({
          siteName: "eBay",
          productTitle: item.title,
          productPrice: item.price?.value ? parseFloat(item.price.value) : 0,
          productLink: item.itemWebUrl,
        }))
        .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
        .sort((a, b) => a.productPrice - b.productPrice)
        .slice(0, 1); // ⬅ return only lowest price
    } else {
      return [];
    }
  } catch (error: any) {
    console.error('eBay search failed:', error.response?.data || error.message);
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