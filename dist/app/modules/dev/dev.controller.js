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
exports.testPush = void 0;
const pushV1_1 = require("../../../helpers/pushV1");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const testPush = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, title, body, data } = req.body;
    if (!token || !title || !body) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'token, title and body are required',
        });
    }
    const result = yield (0, pushV1_1.sendPushNotificationRaw)({ token, title, body, data });
    return (0, sendResponse_1.default)(res, {
        statusCode: result.ok ? http_status_1.default.OK : http_status_1.default.INTERNAL_SERVER_ERROR,
        success: result.ok,
        message: result.ok ? 'Push sent' : 'Push failed',
        data: result.body,
    });
});
exports.testPush = testPush;
