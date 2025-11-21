"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.marketplaceSearchableFields = exports.marketplaceFilterables = void 0;
// Filterable fields for Marketplace
exports.marketplaceFilterables = ['name', 'image', 'marketplace', 'productUrl'];
// Searchable fields for Marketplace
exports.marketplaceSearchableFields = ['name', 'image', 'marketplace', 'productUrl'];
// Helper function for set comparison
const isSetEqual = (setA, setB) => {
    if (setA.size !== setB.size)
        return false;
    for (const item of setA) {
        if (!setB.has(item))
            return false;
    }
    return true;
};
exports.isSetEqual = isSetEqual;
