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
import bcrypt from 'bcrypt';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  payload.role = USER_ROLES.USER;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image && isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

export const getAllUsersFromDB = async (): Promise<(IUser & Document)[]> => {
  return User.find({}, '_id');
};

const setPin = async (userId: string, pin: string) => {
  const user = await User.findById(userId).select('+pin');
  if (!user) throw new ApiError(400, 'User not found');

  if (user.pin) {
    throw new ApiError(400, 'PIN already set. Use updatePin to change it.');
  }

  const hashedPin = await bcrypt.hash(pin, 10);
  user.pin = hashedPin;

  const result = await User.findByIdAndUpdate(
    userId,
    { pin: hashedPin },
    { new: true }
  );

  // await user.save();
  return result;
};

const updatePin = async (userId: string, oldPin: string, newPin: string) => {
  const user = await User.findById(userId).select('+pin');
  if (!user || !user.pin) throw new ApiError(400, 'PIN not set yet');

  const isMatch = await bcrypt.compare(oldPin, user.pin);
  if (!isMatch) throw new ApiError(400, 'Incorrect current PIN');

  const hashedNewPin = await bcrypt.hash(newPin, 10);
  user.pin = hashedNewPin;
  // await user.save();
  await User.findByIdAndUpdate(
    userId,
    { pin: hashedNewPin },
    { new: true }
  );
  return { message: 'PIN updated successfully' };
};

const verifyPin = async (userId: string, inputPin: string) => {
  const user = await User.findById(userId).select('+pin');
  if (!user || !user.pin) throw new ApiError(400, 'PIN not set yet');

  const isMatch = await bcrypt.compare(inputPin, user.pin);
  return { isValid: isMatch };
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsersFromDB,
  setPin,
  updatePin,
  verifyPin,
};
