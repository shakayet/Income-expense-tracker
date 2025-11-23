"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router.patch('/set-pin', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.setPin);
router
    .route('/profile')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.SUPER_ADMIN), user_controller_1.UserController.getUserProfile)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = user_validation_1.UserValidation.updateUserZodSchema.parse(JSON.parse(req.body.data));
    }
    return user_controller_1.UserController.updateProfile(req, res, next);
});
router
    .route('/')
    .post((0, validateRequest_1.default)(user_validation_1.UserValidation.createUserZodSchema), user_controller_1.UserController.createUser);
router
    .route('/fcm-token')
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.updateFcmToken);
router.patch('/update-pin', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.updatePin);
router.post('/verify-pin', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.verifyPin);
router.get('/admin/user-list', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getUserListForAdmin);
router.get('/admin/user/:userId', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getUserProfileById);
router.patch('/admin/user/:userId', (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.updateUserById);
// otp for sensitive actions
router
    .route('/send-otp')
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), user_controller_1.UserController.sendOtpForSensitiveAction);
router
    .route('/change-email')
    .patch((0, auth_1.default)(user_1.USER_ROLES.USER), user_controller_1.UserController.changeEmail);
router
    .route('/change-password')
    .patch((0, auth_1.default)(user_1.USER_ROLES.USER), user_controller_1.UserController.changePassword);
exports.UserRoutes = router;
