"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    ip_address: process.env.IP_ADDRESS,
    database_url: process.env.DATABASE_URL,
    node_env: process.env.NODE_ENV,
    fcm_server_key: process.env.FCM_SERVER_KEY,
    // fcm_service_account_path removed, now using FCM_SERVICE_ACCOUNT_BASE64 only
    firebase_project_id: process.env.FIREBASE_PROJECT_ID,
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS
        ? Number(process.env.BCRYPT_SALT_ROUNDS)
        : undefined,
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        jwt_expire_in: process.env.JWT_EXPIRE_IN,
    },
    stripe: {
        stripeSecretKey: process.env.STRIPE_API_SECRET,
        webhookSecret: process.env.WEBHOOK_SECRET,
        paymentSuccess: process.env.SUCCESS_URL,
    },
    email: {
        from: process.env.EMAIL_FROM,
        user: process.env.EMAIL_USER,
        port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
        host: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PASS,
    },
    super_admin: {
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
    },
    admob_publisher_id: process.env.ADMOB_Publisher_ID,
    ebay: {
        client_id: process.env.EBAY_CLIENT,
        client_secret: process.env.EBAY_SECRET,
    },
    amazon: {
        client_id: process.env.AMAZON_client,
        client_secret: process.env.AMAZON_secret,
        aws_access_key: process.env.AWS_ACCESS_KEY_ID,
        aws_secret_key: process.env.AWS_SECRET_ACCESS_KEY,
    },
    fcm_service_account_base64: process.env.FCM_SERVICE_ACCOUNT_BASE64,
};
