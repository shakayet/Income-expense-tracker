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

type SiteCreds = {
  key?: string;
  secret?: string;
  token?: string; // for OAuth Bearer tokens
}

export type ApiCredentials = {
  ebay?: SiteCreds;
  amazon?: SiteCreds;
  temu?: SiteCreds; 
  subito?: SiteCreds;
  alibaba?: SiteCreds;
  zalando?: SiteCreds;
  mediaworld?: SiteCreds;
  notino?: SiteCreds;
  douglas?: SiteCreds;
  leroyMerlin?: SiteCreds;
  backMarket?: SiteCreds;
  swappie?: SiteCreds;
};