export type Product = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  currency: string;
  url: string;
  imageUrl?: string;
  site: string;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
}

export type ScrapeRequest = {
  searchQuery: string;
  maxPrice: number;
}

export type ScrapeResult = {
  products: Product[];
  totalCount: number;
  successfulSites: string[];
  failedSites: string[];
}