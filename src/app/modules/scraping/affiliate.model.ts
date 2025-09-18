// src/models/affiliate.model.ts

/**
 * Defines the structure for a single product.
 */
export type Product = {
  siteName: string;
  productTitle: string;
  productPrice: number | null; // Updated to allow null price
  productLink: string;
};

/**
 * Defines the structure for API credentials across various affiliate sites.
 */
export type ApiCredentials = {
  ebay?: { key: string };
  amazon?: {
    key: string;
    secret: string;
    associateTag: string;
  };
  temu?: { key: string }; 
  subito?: { key: string }; 
  alibaba?: { key: string }; 
  zalando?: { key: string };
  mediaworld?: { key: string };
  notino?: { key: string };
  douglas?: { key: string };
  leroyMerlin?: { key: string };
  backMarket?: { key: string };
  swappie?: { key: string };
};