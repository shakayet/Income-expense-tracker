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
exports.UserService = exports.getAllUsersFromDB = void 0;
const http_status_codes_1 = require("http-status-codes");
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const user_model_1 = require("./user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Create user
const createUserToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    payload.role = user_1.USER_ROLES.USER;
    if (!payload.userType)
        payload.userType = 'free';
    if (!payload.accountStatus)
        payload.accountStatus = 'active';
    const createUser = yield user_model_1.User.create(payload);
    if (!createUser)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    const otp = (0, generateOTP_1.default)();
    const values = { name: createUser.name, otp, email: createUser.email };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    yield user_model_1.User.findByIdAndUpdate(createUser._id, { authentication });
    return createUser;
});
// Get user profile
const getUserProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    return isExistUser;
});
// Update profile
const updateProfileToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    if (payload.image && isExistUser.image)
        (0, unlinkFile_1.default)(isExistUser.image);
    if (!payload.userType)
        payload.userType = isExistUser.userType || 'free';
    if (!payload.accountStatus)
        payload.accountStatus = isExistUser.accountStatus || 'active';
    return user_model_1.User.findByIdAndUpdate(id, payload, { new: true });
});
// Get all users
const getAllUsersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.User.find({}, '_id');
});
exports.getAllUsersFromDB = getAllUsersFromDB;
// Set PIN
const setPin = (userId, pin) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('+pin');
    if (!user)
        throw new ApiError_1.default(400, 'User not found');
    if (user.pin)
        throw new ApiError_1.default(400, 'PIN already set. Use updatePin to change it.');
    const hashedPin = yield bcryptjs_1.default.hash(pin, 10);
    return user_model_1.User.findByIdAndUpdate(userId, { pin: hashedPin }, { new: true });
});
// Update PIN
const updatePin = (userId, oldPin, newPin) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('+pin');
    if (!user || !user.pin)
        throw new ApiError_1.default(400, 'PIN not set yet');
    const isMatch = yield bcryptjs_1.default.compare(oldPin, user.pin);
    if (!isMatch)
        throw new ApiError_1.default(400, 'Incorrect current PIN');
    const hashedNewPin = yield bcryptjs_1.default.hash(newPin, 10);
    yield user_model_1.User.findByIdAndUpdate(userId, { pin: hashedNewPin });
    return { message: 'PIN updated successfully' };
});
// Verify PIN
const verifyPin = (userId, inputPin) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('+pin');
    if (!user || !user.pin)
        throw new ApiError_1.default(400, 'PIN not set yet');
    const isMatch = yield bcryptjs_1.default.compare(inputPin, user.pin);
    return { isValid: isMatch };
});
// Update user (admin)
const updateUserById = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new ApiError_1.default(404, 'User not found');
    if (!payload.userType)
        payload.userType = user.userType || 'free';
    if (!payload.accountStatus)
        payload.accountStatus = user.accountStatus || 'active';
    return user_model_1.User.findByIdAndUpdate(userId, payload, { new: true });
});
// Get user profile by ID (admin)
const getUserProfileById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('-password -pin');
    if (!user)
        throw new ApiError_1.default(404, 'User not found');
    return user;
});
// Get user list (admin)
const getUserListForAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({}, { _id: 1, name: 1, email: 1, userType: 1 });
    return users.map(u => ({
        userId: u._id,
        name: u.name,
        email: u.email,
        userType: u.userType || 'free',
    }));
});
// ✅ NEW — Send OTP for sensitive actions
const sendOtpForSensitiveAction = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    const otp = (0, generateOTP_1.default)();
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    yield user_model_1.User.findByIdAndUpdate(userId, { authentication });
    const emailData = { name: user.name, otp, email: user.email };
    const otpTemplate = emailTemplate_1.emailTemplate.sendOtp(emailData);
    yield emailHelper_1.emailHelper.sendEmail(otpTemplate);
    return { message: 'OTP sent successfully. Please check your email.' };
});
// ✅ NEW — Change Email
const changeEmail = (userId, newEmail, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('+authentication');
    if (!user)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    const auth = user.authentication;
    if (!(auth === null || auth === void 0 ? void 0 : auth.oneTimeCode) || !(auth === null || auth === void 0 ? void 0 : auth.expireAt))
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'OTP not generated');
    if (Date.now() > new Date(auth.expireAt).getTime())
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'OTP expired');
    if (auth.oneTimeCode !== otp)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid OTP');
    const existingEmailUser = yield user_model_1.User.findOne({ email: newEmail });
    if (existingEmailUser)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already in use');
    yield user_model_1.User.findByIdAndUpdate(userId, {
        email: newEmail,
        'authentication.oneTimeCode': null,
        'authentication.expireAt': null,
    });
    return { message: 'Email changed successfully' };
});
// ✅ NEW — Change Password
const changePassword = (userId, newPassword, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('+password +authentication');
    if (!user)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    const auth = user.authentication;
    if (!(auth === null || auth === void 0 ? void 0 : auth.oneTimeCode) || !(auth === null || auth === void 0 ? void 0 : auth.expireAt))
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'OTP not generated');
    if (Date.now() > new Date(auth.expireAt).getTime())
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'OTP expired');
    if (auth.oneTimeCode !== otp)
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid OTP');
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    yield user_model_1.User.findByIdAndUpdate(userId, {
        password: hashedPassword,
        'authentication.oneTimeCode': null,
        'authentication.expireAt': null,
    });
    return { message: 'Password changed successfully' };
});
exports.UserService = {
    createUserToDB,
    getUserProfileFromDB,
    updateProfileToDB,
    getAllUsersFromDB: exports.getAllUsersFromDB,
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
