// Filterable fields for Marketplace
export const marketplaceFilterables = ['name', 'image', 'marketplace', 'productUrl'];

// Searchable fields for Marketplace
export const marketplaceSearchableFields = ['name', 'image', 'marketplace', 'productUrl'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};