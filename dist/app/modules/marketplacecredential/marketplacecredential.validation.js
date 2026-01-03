"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplacecredentialValidations = void 0;
const zod_1 = require("zod");
exports.MarketplacecredentialValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            marketplaceName: zod_1.z.string(),
            api_key: zod_1.z.string().optional(),
            clientId: zod_1.z.string().optional(),
            clientSecret: zod_1.z.string().optional(),
            refreshToken: zod_1.z.string().optional(),
            awsAccessKeyId: zod_1.z.string().optional(),
            awsSecretAccessKey: zod_1.z.string().optional(),
            marketplaceId: zod_1.z.string().optional(),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            clientId: zod_1.z.string().optional(),
            clientSecret: zod_1.z.string().optional(),
            refreshToken: zod_1.z.string().optional(),
            awsAccessKeyId: zod_1.z.string().optional(),
            awsSecretAccessKey: zod_1.z.string().optional(),
            marketplaceId: zod_1.z.string().optional(),
            environment: zod_1.z.string().optional(),
        }),
    }),
};
