"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dev_controller_1 = require("./dev.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
// Admin-only test endpoint to send a push to an arbitrary token
router.post('/test-push', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), dev_controller_1.testPush);
exports.default = router;
