// Filterable fields for Marketplacecredential
export const marketplacecredentialFilterables = ['clientId', 'clientSecret', 'refreshToken', 'awsAccessKeyId', 'awsSecretAccessKey', 'marketplaceId'];

// Searchable fields for Marketplacecredential
export const marketplacecredentialSearchableFields = ['clientId', 'clientSecret', 'refreshToken', 'awsAccessKeyId', 'awsSecretAccessKey', 'marketplaceId'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};