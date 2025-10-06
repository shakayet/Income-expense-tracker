import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Create user
const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  payload.role = USER_ROLES.USER;
  if (!payload.userType) payload.userType = 'free';
  if (!payload.accountStatus) payload.accountStatus = 'active';

  const createUser = await User.create(payload);
  if (!createUser) throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');

  const otp = generateOTP();
  const values = { name: createUser.name, otp, email: createUser.email! };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findByIdAndUpdate(createUser._id, { authentication });

  return createUser;
};

// Get user profile
const getUserProfileFromDB = async (user: JwtPayload): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  return isExistUser;
};

// Update profile
const updateProfileToDB = async (user: JwtPayload, payload: Partial<IUser>) => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");

  if (payload.image && isExistUser.image) unlinkFile(isExistUser.image);

  if (!payload.userType) payload.userType = isExistUser.userType || 'free';
  if (!payload.accountStatus) payload.accountStatus = isExistUser.accountStatus || 'active';

  return User.findByIdAndUpdate(id, payload, { new: true });
};

// Get all users
export const getAllUsersFromDB = async (): Promise<(IUser & Document)[]> => {
  return User.find({}, '_id');
};

// Set PIN
const setPin = async (userId: string, pin: string) => {
  const user = await User.findById(userId).select('+pin');
  if (!user) throw new ApiError(400, 'User not found');
  if (user.pin) throw new ApiError(400, 'PIN already set. Use updatePin to change it.');

  const hashedPin = await bcrypt.hash(pin, 10);
  return User.findByIdAndUpdate(userId, { pin: hashedPin }, { new: true });
};

// Update PIN
const updatePin = async (userId: string, oldPin: string, newPin: string) => {
  const user = await User.findById(userId).select('+pin');
  if (!user || !user.pin) throw new ApiError(400, 'PIN not set yet');

  const isMatch = await bcrypt.compare(oldPin, user.pin);
  if (!isMatch) throw new ApiError(400, 'Incorrect current PIN');

  const hashedNewPin = await bcrypt.hash(newPin, 10);
  await User.findByIdAndUpdate(userId, { pin: hashedNewPin });
  return { message: 'PIN updated successfully' };
};

// Verify PIN
const verifyPin = async (userId: string, inputPin: string) => {
  const user = await User.findById(userId).select('+pin');
  if (!user || !user.pin) throw new ApiError(400, 'PIN not set yet');

  const isMatch = await bcrypt.compare(inputPin, user.pin);
  return { isValid: isMatch };
};

// Update user (admin)
const updateUserById = async (userId: string, payload: Partial<IUser>) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (!payload.userType) payload.userType = user.userType || 'free';
  if (!payload.accountStatus) payload.accountStatus = user.accountStatus || 'active';
  return User.findByIdAndUpdate(userId, payload, { new: true });
};

// Get user profile by ID (admin)
const getUserProfileById = async (userId: string) => {
  const user = await User.findById(userId).select('-password -pin');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

// Get user list (admin)
const getUserListForAdmin = async () => {
  const users = await User.find({}, { _id: 1, name: 1, email: 1, userType: 1 });
  return users.map(u => ({
    userId: u._id,
    name: u.name,
    email: u.email,
    userType: u.userType || 'free',
  }));
};

// ✅ NEW — Send OTP for sensitive actions
const sendOtpForSensitiveAction = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  const otp = generateOTP();
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };

  await User.findByIdAndUpdate(userId, { authentication });

  const emailData = { name: user.name, otp, email: user.email };
  const otpTemplate = emailTemplate.sendOtp(emailData);
  await emailHelper.sendEmail(otpTemplate);

  return { message: 'OTP sent successfully. Please check your email.' };
};

// ✅ NEW — Change Email
const changeEmail = async (userId: string, newEmail: string, otp: number) => {
  const user = await User.findById(userId).select('+authentication');
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  const auth = user.authentication;
  if (!auth?.oneTimeCode || !auth?.expireAt) throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP not generated');
  if (Date.now() > new Date(auth.expireAt).getTime()) throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP expired');
  if (auth.oneTimeCode !== otp) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP');

  const existingEmailUser = await User.findOne({ email: newEmail });
  if (existingEmailUser) throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already in use');

  await User.findByIdAndUpdate(userId, {
    email: newEmail,
    'authentication.oneTimeCode': null,
    'authentication.expireAt': null,
  });

  return { message: 'Email changed successfully' };
};

// ✅ NEW — Change Password
const changePassword = async (userId: string, newPassword: string, otp: number) => {
  const user = await User.findById(userId).select('+password +authentication');
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  const auth = user.authentication;
  if (!auth?.oneTimeCode || !auth?.expireAt) throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP not generated');
  if (Date.now() > new Date(auth.expireAt).getTime()) throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP expired');
  if (auth.oneTimeCode !== otp) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, {
    password: hashedPassword,
    'authentication.oneTimeCode': null,
    'authentication.expireAt': null,
  });

  return { message: 'Password changed successfully' };
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsersFromDB,
  setPin,
  updatePin,
  verifyPin,
  getUserListForAdmin,
  getUserProfileById,
  updateUserById,
  sendOtpForSensitiveAction, // ✅ new
  changeEmail,               // ✅ new
  changePassword,            // ✅ new
};
