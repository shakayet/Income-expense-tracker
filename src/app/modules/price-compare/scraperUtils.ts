// src/utils/scraperUtils.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

type ScrapeOptions = {
  url: string;
  containerSelector: string;
  titleSelector: string;
  priceSelector: string;
  linkSelector: string;
  linkPrefix?: string;
  userAgent?: string;
  source: string;
};

export const scrapeStore = async (
  productName: string,
  maxPrice: number,
  options: ScrapeOptions
): Promise<
  { title: string; price: number; link: string; source: string }[]
> => {
  try {
    const searchUrl = options.url.replace(
      '{product}',
      encodeURIComponent(productName)
    );
    const userAgent =
      options.userAgent ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';

    const { data } = await axios.get(searchUrl, {
      headers: { 'User-Agent': userAgent },
    });

    const $ = cheerio.load(data);
    const results: {
      title: string;
      price: number;
      link: string;
      source: string;
    }[] = [];

    $(options.containerSelector).each((_, el) => {
      const title = $(el).find(options.titleSelector).text().trim();
      const priceText = $(el)
        .find(options.priceSelector)
        .text()
        .trim()
        .replace(',', '.')
        .replace(/[^\d.]/g, '');
      const price = parseFloat(priceText);

      let link = $(el).find(options.linkSelector).attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = options.linkPrefix ? `${options.linkPrefix}${link}` : link;
      }

      if (title && !isNaN(price)) {
        results.push({ title, price, link, source: options.source });
      }
    });

    return results
      .filter(p => p.price <= maxPrice)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
  } catch (error) {
    return [];
  }
};
