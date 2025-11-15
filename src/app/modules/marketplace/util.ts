import axios from 'axios';
import config from '../../../config';

const API_KEY = 'aad814019bmshd45653f0c24a087p11edf7jsn76826ab14238';

interface AmazonProduct {
  title: string;
  price: number;
  image: string;
  rating: number;
  url: string;
}

export const getAmazonProduct = async (
  asin: string
): Promise<AmazonProduct> => {
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
  top: number = 5
): Promise<AmazonProduct[]> => {
  const res = await axios.get(
    'https://real-time-amazon-data.p.rapidapi.com/search',
    {
      params: { query, limit: 20, country: 'US' },
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

  return products.map((p: any) => ({
    itemId: p.asin,
    title: p.product_title,
    price: parseFloat(p.product_price.replace('$', '')), // Remove dollar sign
    image: p.product_photo,
    rating: parseFloat(p.product_star_rating),
    url: p.product_url,
  }));
};

export const getSingleAmazonProduct = async (
  asin: string
): Promise<AmazonProduct | null> => {
  try {
    // Use search endpoint as fallback
    const res = await axios.get(
      'https://real-time-amazon-data.p.rapidapi.com/search',
      {
        params: { query: asin, limit: 1, country: 'US' },
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
        },
      }
    );

    const product = res.data?.data?.products?.[0];
    if (!product) return null;

    return {
      title: product.product_title,
      price: parseFloat(product.product_price.replace('$', '')) || 0,
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

// it's for ebay. perfect working

const OAUTH_URL = 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';

async function getAppAccessToken(): Promise<string> {
  const creds = Buffer.from(
    `${config.ebay.client_id}:${config.ebay.client_secret}`
  ).toString('base64');

  
  try {
    const res = await axios.post(
      OAUTH_URL,
      'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${creds}`,
        },
      }
    );

    return res.data.access_token;
  } catch (err: any) {
    console.error(
      'Error fetching eBay access token:',
      err.response?.data || err.message
    );
    throw new Error('Failed to get eBay access token');
  }
}

async function searchProducts(query: string, limit = 10) {
  const token = await getAppAccessToken();
  console.log({ token });
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=${limit}`;


  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log({res : res})
    return res.data;
  } catch (err: any) {

    console.error(
      'Error fetching eBay products:',
      err.response?.data || err.message
    );
    return { itemSummaries: [] };
  }
}

export async function getTopCheapestProductsFromEbay(query: string, top = 5) {

  const data = await searchProducts(query, 50); // your search API

  console.log({data : data.itemSummaries})

  const token = await getAppAccessToken();

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
      const fullItem = await getSingleProductFromEbay(item.itemId);
      return fullItem
        ? {
            itemId: item.itemId,
            title: fullItem.title,
            price: fullItem.price,
            image: fullItem.image,
            rating: fullItem.rating,
            url: fullItem.url,
          }
        : {
            itemId: item.itemId,
            title: item.title,
            price: parseFloat(item.price.value),
            image: 'https://via.placeholder.com/150',
            rating: 0,
            url: item.itemWebUrl || '#',
          };
    })
  );

  console.log({ products });

  return products;
}

export async function getSingleProductFromEbay(itemId: string) {
  const token = await getAppAccessToken();

  // Construct the API URL
  const url = `https://api.sandbox.ebay.com/buy/browse/v1/item/${encodeURIComponent(
    itemId
  )}`;

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const item = res.data;

    // Format result similar to getTopCheapestProducts
    return {
      title: item.title || 'No title',
      price: parseFloat(item.price?.value || 0),
      currency: item.price?.currency || 'USD',
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
