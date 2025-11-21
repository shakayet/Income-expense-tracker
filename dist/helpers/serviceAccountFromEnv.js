"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceAccountPathFromEnv = getServiceAccountPathFromEnv;
/* eslint-disable no-console */
/* eslint-disable no-undef */
// This script decodes the base64-encoded service account key from the environment and writes it to a temp file for use by the push notification logic.
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
function getServiceAccountPathFromEnv() {
    const base64 = process_1.default.env.FCM_SERVICE_ACCOUNT_BASE64;
    if (!base64)
        throw new Error('FCM_SERVICE_ACCOUNT_BASE64 is not set in environment variables');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    // Always resolve to the project root config folder
    const configDir = path_1.default.resolve(__dirname, '../../config');
    const tempPath = path_1.default.join(configDir, '.serviceAccountKey.temp.json');
    try {
        if (!fs_1.default.existsSync(configDir)) {
            fs_1.default.mkdirSync(configDir, { recursive: true });
        }
        fs_1.default.writeFileSync(tempPath, json, { encoding: 'utf8' });
    }
    catch (err) {
        throw new Error('Failed to write service account temp file: ' + err);
    }
    return tempPath;
}
