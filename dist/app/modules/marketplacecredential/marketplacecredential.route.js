"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplacecredentialRoutes = void 0;
const express_1 = __importDefault(require("express"));
const marketplacecredential_controller_1 = require("./marketplacecredential.controller");
const marketplacecredential_validation_1 = require("./marketplacecredential.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
router.get('/:id', 
// auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
marketplacecredential_controller_1.MarketplacecredentialController.getSingleMarketplacecredential);
router.post('/', 
// auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
(0, validateRequest_1.default)(marketplacecredential_validation_1.MarketplacecredentialValidations.create), marketplacecredential_controller_1.MarketplacecredentialController.createMarketplacecredential);
router.patch('/:id', 
// auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
(0, validateRequest_1.default)(marketplacecredential_validation_1.MarketplacecredentialValidations.update), marketplacecredential_controller_1.MarketplacecredentialController.updateMarketplacecredential);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), marketplacecredential_controller_1.MarketplacecredentialController.deleteMarketplacecredential);
exports.MarketplacecredentialRoutes = router;
