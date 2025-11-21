"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSearchTypeZod = exports.MarketplaceValidations = void 0;
const zod_1 = require("zod");
exports.MarketplaceValidations = {
    create: zod_1.z.object({
        name: zod_1.z.string(),
        price: zod_1.z.number(),
        image: zod_1.z.string(),
        marketplace: zod_1.z.string(),
        productUrl: zod_1.z.string(),
    }),
    update: zod_1.z.object({
        name: zod_1.z.string().optional(),
        price: zod_1.z.number().optional(),
        image: zod_1.z.string().optional(),
        marketplace: zod_1.z.string().optional(),
        productUrl: zod_1.z.string().optional(),
    }),
};
exports.createSearchTypeZod = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(['GENERIC', 'API']),
    }),
});
