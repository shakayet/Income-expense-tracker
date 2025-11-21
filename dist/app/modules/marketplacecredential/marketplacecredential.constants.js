"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.marketplacecredentialSearchableFields = exports.marketplacecredentialFilterables = void 0;
// Filterable fields for Marketplacecredential
exports.marketplacecredentialFilterables = ['clientId', 'clientSecret', 'refreshToken', 'awsAccessKeyId', 'awsSecretAccessKey', 'marketplaceId'];
// Searchable fields for Marketplacecredential
exports.marketplacecredentialSearchableFields = ['clientId', 'clientSecret', 'refreshToken', 'awsAccessKeyId', 'awsSecretAccessKey', 'marketplaceId'];
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
