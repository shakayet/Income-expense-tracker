/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import config from '../../../config';
import { Marketplacecredential } from '../marketplacecredential/marketplacecredential.model';

// const API_KEY = 'aad814019bmshd45653f0c24a087p11edf7jsn76826ab14238';

const getRepidApiKey = async () => {
  const data = await Marketplacecredential.findOne({
    marketplaceName: 'amazon',
    environment: 'production',
  })
    .sort({ _id: -1 }) // descending = latest first
    .lean();

  console.log({ data });
  return data?.api_key || '';
};

const countryToLocale: Record<string, string> = {
  US: 'en-US',
  GB: 'en-GB',
  DE: 'de-DE',
  FR: 'fr-FR',
  IN: 'en-IN',
  IT: 'it-IT',
  AU: 'en-AU',
};

export function formatPrice(value: number, currency: string, country?: string) {
  const locale = country
    ? countryToLocale[country.toUpperCase()] || 'en-US'
    : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

const countryToCurrency: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  IN: 'INR',
  AU: 'AUD',
};

const countryToEbayMarketplace: Record<string, string> = {
  // Use underscore variant which the Buy API expects in many cases
  US: 'EBAY_US',
  GB: 'EBAY_GB',
  DE: 'EBAY_DE',
  FR: 'EBAY_FR',
  IT: 'EBAY_IT',
  IN: 'EBAY_IN',
  AU: 'EBAY_AU',
};

type AmazonProduct = {
  title: string;
  price: number;
  image: string;
  rating: number;
  url: string;
  currency?: string;
  formattedPrice?: string;
};

export const getAmazonProduct = async (
  asin: string
): Promise<AmazonProduct> => {
  const API_KEY = await getRepidApiKey();
  const res = await axios.get(
    'https://real-time-amazon-data.p.rapidapi.com/product',
    {
      params: { asin, country: 'US' },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
      },
    }
  );

  const p = res.data.data;
  return {
    title: p.product_title,
    price: parseFloat(p.product_price.replace('$', '')), // Remove dollar sign
    image: p.product_photo,
    rating: parseFloat(p.product_star_rating),
    url: p.product_url,
  };
};

export const getCheapestAmazonProducts = async (
  query: string,
  top: number = 5,
  country: string = 'US'
): Promise<AmazonProduct[]> => {
  const API_KEY = await getRepidApiKey();
  const res = await axios.get(
    'https://real-time-amazon-data.p.rapidapi.com/search',
    {
      params: { query, limit: 20, country },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
      },
    }
  );
  const products = res.data.data.products
    .filter((p: any) => {
      // Check if product_price exists and is not null/undefined
      return (
        p.product_price && p.product_price !== '$' && p.product_price !== ''
      );
    })
    .sort((a: any, b: any) => {
      // Remove dollar signs and convert to numbers for sorting
      const priceA = parseFloat(a.product_price.replace('$', ''));
      const priceB = parseFloat(b.product_price.replace('$', ''));
      return priceA - priceB;
    })
    .slice(0, top);

  return products.map((p: any) => {
    const raw = p.product_price || '';
    const numeric =
      parseFloat(raw.replace(/[^0-9.,-]+/g, '').replace(',', '.')) || 0;
    const currency = countryToCurrency[country?.toUpperCase()] || 'USD';
    return {
      itemId: p.asin,
      title: p.product_title,
      price: numeric,
      currency,
      formattedPrice: formatPrice(numeric, currency, country),
      image: p.product_photo,
      rating: parseFloat(p.product_star_rating),
      url: p.product_url,
    };
  });
};

export const getSingleAmazonProduct = async (
  asin: string,
  country: string = 'US'
): Promise<AmazonProduct | null> => {
  const API_KEY = await getRepidApiKey();
  try {
    // Use search endpoint as fallback
    const res = await axios.get(
      'https://real-time-amazon-data.p.rapidapi.com/search',
      {
        params: { query: asin, limit: 1, country },
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
        },
      }
    );

    const product = res.data?.data?.products?.[0];
    if (!product) return null;

    const raw = product.product_price || '';
    const numeric =
      parseFloat(raw.replace(/[^0-9.,-]+/g, '').replace(',', '.')) || 0;
    const currency = countryToCurrency[country?.toUpperCase()] || 'USD';
    return {
      title: product.product_title,
      price: numeric,
      currency,
      formattedPrice: formatPrice(numeric, currency, country),
      image: product.product_photo || 'https://via.placeholder.com/150',
      rating: parseFloat(product.product_star_rating) || 0,
      url: product.product_url || '#',
    };
  } catch (err: any) {
    console.error(
      'Error fetching Amazon product:',
      err.response?.data || err.message
    );
    return null;
  }
};

// eBay OAuth endpoint
// use sandbox URL for sandbox environment if needed
const OAUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token';

type Creds = { clientId: string; clientSecret: string };
const ebayCredsCache: Record<string, Creds> = {};
const tokenCache: Record<string, { token: string; expiresAt: number }> = {};

async function loadEbayCredentialsFromDB(
  country?: string,
  environment = 'production'
): Promise<Creds> {
  const cacheKey = `${environment}:${country || 'all'}`;
  if (ebayCredsCache[cacheKey]) return ebayCredsCache[cacheKey];

  const query: any = { marketplaceName: 'ebay', environment };
  if (country) query.country = country;

  // try with country first
  let doc: any = await Marketplacecredential.findOne(query).lean();

  // fallback: if country-specific not found, try without country
  if (!doc && country) {
    doc = await Marketplacecredential.findOne({
      marketplaceName: 'ebay',
      environment,
    }).lean();
  }

  // fallback to config values if DB not populated
  const cfgClientId =
    (config as any)?.ebay?.client_id || (config as any)?.ebay?.clientId;
  const cfgClientSecret =
    (config as any)?.ebay?.client_secret || (config as any)?.ebay?.clientSecret;

  if (!doc || !doc.clientId || !doc.clientSecret) {
    if (cfgClientId && cfgClientSecret) {
      ebayCredsCache[cacheKey] = {
        clientId: cfgClientId,
        clientSecret: cfgClientSecret,
      };
      return ebayCredsCache[cacheKey];
    }
    throw new Error('eBay credentials not found in DB or config');
  }

  ebayCredsCache[cacheKey] = {
    clientId: doc.clientId,
    clientSecret: doc.clientSecret,
  };
  return ebayCredsCache[cacheKey];
}

async function getAppAccessToken(country?: string): Promise<string> {
  const { clientId, clientSecret } = await loadEbayCredentialsFromDB(country);
  const cacheKey = clientId; // token cache per app

  const now = Date.now();
  const existing = tokenCache[cacheKey];
  if (existing && existing.expiresAt - now > 60_000) {
    return existing.token;
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body =
    'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${creds}`,
  };

  const maxRetries = 2;
  let lastErr: any = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await axios.post(OAUTH_URL, body, { headers, timeout: 5000 });
      const token = res.data.access_token;
      const expiresIn = Number(res.data.expires_in) || 7200;
      tokenCache[cacheKey] = {
        token,
        expiresAt: Date.now() + expiresIn * 1000,
      };
      return token;
    } catch (err: any) {
      lastErr = err;
      const status = err.response?.status;
      const data = err.response?.data;
      console.error(`eBay token request failed (attempt ${attempt + 1})`, {
        status,
        data,
        message: err.message,
      });
      if (
        attempt < maxRetries &&
        (!status || (status >= 500 && status < 600))
      ) {
        const wait = 200 * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      break;
    }
  }

  throw new Error(
    `Failed to obtain eBay access token: ${
      lastErr?.response?.data?.error_description ||
      lastErr?.message ||
      'unknown'
    }`
  );
}

async function searchProducts(
  query: string,
  limit = 10,
  country: string = 'italy'
) {
  const token = await getAppAccessToken(country);
  // const token = await getAppAccessToken(country);
  console.log({ token });
  const marketplaceId = countryToEbayMarketplace[country?.toUpperCase()];
  // log marketplaceId for debugging
  console.log({ country, marketplaceId });
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
    query
  )}&limit=${limit}${
    marketplaceId ? `&marketplace_id=${encodeURIComponent(marketplaceId)}` : ''
  }`;

  try {
    const headers: any = { Authorization: `Bearer ${token}` };
    if (marketplaceId) headers['X-EBAY-C-MARKETPLACE-ID'] = marketplaceId;
    const acceptLang = country
      ? countryToLocale[country.toUpperCase()]
      : undefined;
    if (acceptLang) headers['Accept-Language'] = acceptLang;

    const res = await axios.get(url, { headers });
    // debug: log first item currency if available
    if (res?.data?.itemSummaries?.length) {
      console.log(
        'eBay search first item currency:',
        res.data.itemSummaries[0].price?.currency
      );
      const expected = countryToCurrency[country?.toUpperCase() || 'US'];
      if (
        res.data.itemSummaries[0].price?.currency &&
        expected &&
        res.data.itemSummaries[0].price.currency !== expected
      ) {
        console.warn(
          `Currency mismatch: expected ${expected} but got ${res.data.itemSummaries[0].price.currency}`
        );
      }
    }
    // console.log({ res: res });
    return res.data;
  } catch (err: any) {
    console.error(
      'Error fetching eBay products:',
      err.response?.data || err.message
    );
    return { itemSummaries: [] };
  }
}

export async function getTopCheapestProductsFromEbay(
  query: string,
  top = 5,
  country?: string
) {
  const data = await searchProducts(query, 50, country); // your search API

  // console.log({ data: data.itemSummaries[0].price });

  const token = await getAppAccessToken(country);

  if (!data.itemSummaries || data.itemSummaries.length === 0) return [];

  // Filter items with a valid price
  const itemsWithPrice = data.itemSummaries.filter(
    (item: any) => item.price?.value
  );
  if (itemsWithPrice.length === 0) return [];

  // Sort by price
  const sortedItems = itemsWithPrice.sort(
    (a: any, b: any) => parseFloat(a.price.value) - parseFloat(b.price.value)
  );

  // Take top N items
  const topItems = sortedItems.slice(0, top);

  // Fetch images for each item (fallback to placeholder if none)
  const products = await Promise.all(
    topItems.map(async (item: any) => {
      const fullItem = await getSingleProductFromEbay(item.itemId, country);
      if (fullItem) {
        const price = fullItem.price;
        const currency = item.price?.currency;
        return {
          itemId: item.itemId,
          title: fullItem.title,
          price,
          currency,
          formattedPrice: formatPrice(price, currency, country),
          image: fullItem.image,
          rating: fullItem.rating,
          url: fullItem.url,
        };
      }

      const fallbackPrice = parseFloat(item.price.value || '0');
      const fallbackCurrency = item.price?.currency || 'USD';
      return {
        itemId: item.itemId,
        title: item.title,
        price: fallbackPrice,
        currency: fallbackCurrency,
        formattedPrice: formatPrice(fallbackPrice, fallbackCurrency, country),
        image: 'https://via.placeholder.com/150',
        rating: 0,
        url: item.itemWebUrl || '#',
      };
    })
  );

  // console.log({ products });

  return products;
}

export async function getSingleProductFromEbay(
  itemId: string,
  country?: string
) {
  const token = await getAppAccessToken(country);

  // Construct the API URL
  const marketplaceId = countryToEbayMarketplace[country?.toUpperCase() || ''];
  const url = `https://api.ebay.com/buy/browse/v1/item/${encodeURIComponent(
    itemId
  )}${
    marketplaceId ? `?marketplace_id=${encodeURIComponent(marketplaceId)}` : ''
  }`;

  console.log({ url });

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const item = res.data;

    // Format result similar to getTopCheapestProducts
    const numericPrice = parseFloat(item.price?.value || 0);
    const currency = item.price?.currency || 'USD';
    return {
      title: item.title || 'No title',
      price: numericPrice,
      currency,
      formattedPrice: formatPrice(numericPrice, currency, country),
      image: item.image?.imageUrl || 'https://via.placeholder.com/150',
      rating: item.reviews?.averageRating ?? 0,
      seller: item.seller?.username || 'Unknown seller',
      condition: item.condition || 'Unknown',
      url: item.itemWebUrl || '#',
      description: item.shortDescription || 'No description available.',
    };
  } catch (err: any) {
    console.error(
      'Error fetching single eBay product:',
      err.response?.data || err.message
    );
    return null;
  }
}

export async function comparePricesAcrossCountries(
  query: string,
  countries: string[],
  top = 5
) {
  const promises = countries.map(async country => {
    try {
      const products = await getTopCheapestProductsFromEbay(
        query,
        top,
        country
      );
      return { country, products };
    } catch (err: any) {
      console.error(
        `comparePricesAcrossCountries error for ${country}:`,
        err?.message || err
      );
      return { country, products: [] };
    }
  });

  const results = await Promise.all(promises);
  const map: Record<string, any[]> = {};
  results.forEach(r => {
    map[r.country] = r.products || [];
  });
  return map;
}
