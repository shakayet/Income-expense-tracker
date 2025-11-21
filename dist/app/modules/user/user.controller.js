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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const getFilePath_1 = require("../../../shared/getFilePath");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const user_service_1 = require("./user.service");
const user_model_1 = require("./user.model");
// Update user by objectId (for admin/super_admin)
const updateUserById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const result = yield user_service_1.UserService.updateUserById(userId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'User updated successfully',
        data: result,
    });
}));
// Get user profile by user ObjectId (for admin/super admin)
const getUserProfileById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const result = yield user_service_1.UserService.getUserProfileById(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'User profile fetched successfully',
        data: result,
    });
}));
// Get user list for admin/super admin (userId, name, email, userType)
const getUserListForAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.getUserListForAdmin();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'User list fetched successfully',
        data: result,
    });
}));
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = __rest(req.body, []);
    const result = yield user_service_1.UserService.createUserToDB(userData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'User created successfully',
        data: result,
    });
}));
const getUserProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const result = yield user_service_1.UserService.getUserProfileFromDB(user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Profile data retrieved successfully',
        data: result,
    });
}));
// Get all users
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.getAllUsersFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'All users retrieved successfully',
        data: result,
    });
}));
//update profile
const updateProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const image = (0, getFilePath_1.getSingleFilePath)(req.files, 'image');
    const data = Object.assign({ image }, req.body);
    const result = yield user_service_1.UserService.updateProfileToDB(user, data);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result,
    });
}));
const updateFcmToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { fcmToken } = req.body;
    if (!fcmToken) {
        return res.status(400).json({ message: 'FCM token required' });
    }
    try {
        const user = yield user_model_1.User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'FCM token updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
const setPin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { pin } = req.body;
    if (!pin || pin.length !== 4) {
        return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }
    const result = yield user_service_1.UserService.setPin(userId, pin);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: '',
        data: result,
    });
}));
const updatePin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { oldPin, newPin } = req.body;
    if (!oldPin || !newPin || newPin.length !== 4) {
        return res.status(400).json({ message: 'Invalid PIN format' });
    }
    const result = yield user_service_1.UserService.updatePin(userId, oldPin, newPin);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
    });
}));
const verifyPin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { pin } = req.body;
    if (!pin || pin.length !== 4) {
        return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }
    const result = yield user_service_1.UserService.verifyPin(userId, pin);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.isValid ? 'PIN verified successfully' : 'Invalid PIN',
        data: { isValid: result.isValid },
    });
}));
// ✅ NEW — Send OTP for sensitive actions (email/password change)
const sendOtpForSensitiveAction = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const result = yield user_service_1.UserService.sendOtpForSensitiveAction(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
    });
}));
// ✅ NEW — Change Email
const changeEmail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { newEmail, otp } = req.body;
    if (!newEmail || !otp) {
        return res.status(400).json({ message: 'New email and OTP are required' });
    }
    const result = yield user_service_1.UserService.changeEmail(userId, newEmail, otp);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
    });
}));
// ✅ NEW — Change Password
const changePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { newPassword, otp } = req.body;
    if (!newPassword || !otp) {
        return res.status(400).json({ message: 'New password and OTP are required' });
    }
    const result = yield user_service_1.UserService.changePassword(userId, newPassword, otp);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
    });
}));
exports.UserController = {
    createUser,
    getUserProfile,
    updateProfile,
    getAllUsers,
    updateFcmToken,
    setPin,
    updatePin,
    verifyPin,
    getUserListForAdmin,
    getUserProfileById,
    updateUserById,
    sendOtpForSensitiveAction, // ✅ new
    changeEmail, // ✅ new
    changePassword, // ✅ new
};
