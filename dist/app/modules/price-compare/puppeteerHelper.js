"use strict";
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
exports.launchBrowser = exports.proxies = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
// Enable stealth mode to avoid bot detection
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
// Proxy list (filtered, Europe-focused)
exports.proxies = [
// { ip: '103.151.41.7', port: 80 },
// { ip: '116.203.27.109', port: 80 },       
// { ip: '14.207.24.176', port: 8080 },
// { ip: '181.74.81.195', port: 999 },
// { ip: '38.51.49.84', port: 999 },
// { ip: '34.126.187.77', port: 80 },
// { ip: '190.238.231.65', port: 1994 },
// { ip: '13.209.156.241', port: 80 },
// { ip: '181.212.41.171', port: 999 },
// { ip: '217.219.74.130', port: 8888 },
// { ip: '102.38.17.193', port: 8080 },
// { ip: '45.238.12.4', port: 3128 },
// { ip: '143.42.194.37', port: 3128 },       
// { ip: '34.29.41.58', port: 3128 },
// { ip: '194.31.53.250', port: 80 },
// { ip: '140.83.32.175', port: 80 },
// { ip: '188.34.164.99', port: 8080 },       
// { ip: '46.101.102.134', port: 3128 },      
// { ip: '154.79.254.236', port: 32650 },
// { ip: '102.216.69.176', port: 8080 },
];
const launchBrowser = () => __awaiter(void 0, void 0, void 0, function* () {
    const args = ['--no-sandbox', '--disable-setuid-sandbox'];
    if (exports.proxies.length > 0) {
        const randomProxy = exports.proxies[Math.floor(Math.random() * exports.proxies.length)];
        args.push(`--proxy-server=http://${randomProxy.ip}:${randomProxy.port}`);
    }
    return puppeteer_extra_1.default.launch({
        headless: true,
        args,
        defaultViewport: {
            width: 1366,
            height: 768,
        },
    });
});
exports.launchBrowser = launchBrowser;
