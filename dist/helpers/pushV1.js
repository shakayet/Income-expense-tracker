"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable no-console */
// pushNotification.ts (or any filename you prefer)
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotificationRaw = exports.sendPushNotification = void 0;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config")); // Your custom config file/module
const serviceAccountFromEnv_1 = require("./serviceAccountFromEnv");
const user_model_1 = require("../app/modules/user/user.model");
// ✅ Helper to get OAuth2 access token from service account
function getAccessToken(serviceAccountPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const serviceAccount = JSON.parse(fs_1.default.readFileSync(serviceAccountPath, 'utf8'));
            const jwtClient = new googleapis_1.google.auth.JWT({
                email: serviceAccount.client_email,
                key: serviceAccount.private_key,
                scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
            });
            const tokens = yield jwtClient.authorize();
            return tokens.access_token;
        }
        catch (error) {
            console.error('❌ Failed to load service account or get token:', error);
            throw error;
        }
    });
}
// Push notification sender
const sendPushNotification = (_a) => __awaiter(void 0, [_a], void 0, function* ({ token, title, body, data, }) {
    try {
        // console.log('🚀 Sending push notification:', { token, title, body, data });
        const cfg = config_1.default;
        // console.log({cfg})
        const serviceAccountPath = process.env.FCM_SERVICE_ACCOUNT_BASE64
            ? (0, serviceAccountFromEnv_1.getServiceAccountPathFromEnv)()
            : cfg.fcm_service_account_path ||
                path_1.default.resolve(__dirname, '..', 'config', 'serviceAccountKey.json');
        const projectId = cfg.firebase_project_id;
        const accessToken = yield getAccessToken(serviceAccountPath);
        const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
        const payload = {
            message: {
                token,
                notification: {
                    title,
                    body: typeof body === 'string' ? body : JSON.stringify(body),
                },
                data,
                // Add platform-specific delivery hints to increase likelihood of OS-level popups
                android: {
                    priority: 'high',
                    notification: {
                        channel_id: 'default',
                        default_sound: true,
                    },
                },
                apns: {
                    headers: {
                        'apns-priority': '10',
                    },
                    payload: {
                        aps: {
                            sound: 'default',
                        },
                    },
                },
            },
        };
        // Attach data if provided (all values must be strings)
        // console.log({payload : payload.message.data})
        const response = yield fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });
        const responseText = yield response.text();
        let responseJson = null;
        try {
            responseJson = responseText ? JSON.parse(responseText) : null;
        }
        catch (e) {
            // non-json body
        }
        if (!response.ok) {
            // Log more details to help debugging (status + body)
            console.error('❌ FCM send failed:', response.status, responseText);
            // Handle UNREGISTERED / invalid tokens by invalidating locally
            if (responseJson &&
                responseJson.error &&
                Array.isArray(responseJson.error.details)) {
                const details = responseJson.error.details;
                const hasUnregistered = details.some((d) => d.errorCode === 'UNREGISTERED');
                if (hasUnregistered) {
                    try {
                        yield (0, user_model_1.invalidateToken)(token);
                        console.info(`🔔 Token ${token} invalidated due to UNREGISTERED error.`);
                    }
                    catch (ie) {
                        console.error('Failed to invalidate token:', ie);
                    }
                }
            }
            // Throw an error so callers can react if needed
            throw new Error(`FCM send failed with status ${response.status}`);
        }
        // Success - log response for diagnostics
        console.info('✅ Push notification sent successfully.', responseJson !== null && responseJson !== void 0 ? responseJson : responseText);
    }
    catch (error) {
        console.error('❌ Error sending push notification:', error);
    }
});
exports.sendPushNotification = sendPushNotification;
// Raw sender that returns the FCM HTTP response for debugging/test purposes
const sendPushNotificationRaw = (_a) => __awaiter(void 0, [_a], void 0, function* ({ token, title, body, data, }) {
    try {
        const cfg = config_1.default;
        const serviceAccountPath = process.env.FCM_SERVICE_ACCOUNT_BASE64
            ? (0, serviceAccountFromEnv_1.getServiceAccountPathFromEnv)()
            : cfg.fcm_service_account_path ||
                path_1.default.resolve(__dirname, '..', 'config', 'serviceAccountKey.json');
        const projectId = cfg.firebase_project_id;
        const accessToken = yield getAccessToken(serviceAccountPath);
        const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
        const payload = {
            message: {
                token,
                notification: {
                    title,
                    body: typeof body === 'string' ? body : JSON.stringify(body),
                },
                data,
                android: {
                    priority: 'high',
                    notification: {
                        channel_id: 'default',
                        default_sound: true,
                    },
                },
                apns: {
                    headers: {
                        'apns-priority': '10',
                    },
                    payload: {
                        aps: {
                            sound: 'default',
                        },
                    },
                },
            },
        };
        const response = yield fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });
        const responseText = yield response.text();
        let responseJson = null;
        try {
            responseJson = responseText ? JSON.parse(responseText) : null;
        }
        catch (e) {
            // ignore
        }
        if (!response.ok) {
            // attempt to invalidate invalid tokens
            if (responseJson &&
                responseJson.error &&
                Array.isArray(responseJson.error.details)) {
                const details = responseJson.error.details;
                const hasUnregistered = details.some((d) => d.errorCode === 'UNREGISTERED');
                if (hasUnregistered) {
                    try {
                        yield (0, user_model_1.invalidateToken)(token);
                    }
                    catch (ie) {
                        console.error('Failed to invalidate token:', ie);
                    }
                }
            }
        }
        return {
            ok: response.ok,
            status: response.status,
            body: responseJson !== null && responseJson !== void 0 ? responseJson : responseText,
        };
    }
    catch (error) {
        console.error('Error in sendPushNotificationRaw:', error);
        return { ok: false, status: 0, body: String(error) };
    }
});
exports.sendPushNotificationRaw = sendPushNotificationRaw;
