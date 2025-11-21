"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("./category.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const category_validation_1 = require("./category.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router.use((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN));
router
    .route('/')
    .post((0, validateRequest_1.default)(category_validation_1.createCategoryZodSchema), category_controller_1.createCategory)
    .get(category_controller_1.getAllCategories);
router
    .route('/:id')
    .patch((0, validateRequest_1.default)(category_validation_1.createCategoryZodSchema), category_controller_1.updateCategory)
    .delete(category_controller_1.deleteCategory);
exports.CategoryRoutes = router;
