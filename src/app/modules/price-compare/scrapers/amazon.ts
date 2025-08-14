import axios from 'axios';
import { Product } from '../types';

export const scrapeAmazon = async (
  productName: string,
  maxPrice: number
): Promise<Product[]> => {
  try {
    const response = await axios.get('https://api.brightdata.com/dca/dataset', {
      params: {
        collector: 'amazon_search',
        product: productName,
        maxPrice,
        country: 'it',
        sort: 'price_asc'
      },
      headers: {
        Authorization: `Bearer ${process.env.BRIGHTDATA_API_KEY}`
      }
    });

    return response.data.products
      .slice(0, 3)
      .map(p => ({
        title: p.title,
        price: p.price,
        link: p.url,
        source: 'Amazon'
      }));
  } catch (error) {
    console.error('❌ Amazon scraping error:', error.message);
    return [];
  }
};