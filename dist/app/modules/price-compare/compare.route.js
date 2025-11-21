"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compare_controller_1 = require("./compare.controller");
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.use((0, auth_1.default)(user_1.USER_ROLES.USER));
router.route('/')
    .post(compare_controller_1.comparePriceController); // searching for best prices
router.route('/cost-compare')
    .post(compare_controller_1.addCostCompare)
    .get(compare_controller_1.getCostCompareHistory);
exports.default = router;
