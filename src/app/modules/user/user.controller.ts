import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { User } from './user.model';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  const result = await UserService.createUserToDB(userData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User created successfully',
    data: result,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { id?: string } | undefined;
  if (!user || !user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

// Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsersFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All users retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { id?: string } | undefined;
  if (!user || !user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const image = getSingleFilePath(req.files as any, 'image');

  const data = {
    image,
    ...req.body,
  };
  const result = await UserService.updateProfileToDB(user, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const updateFcmToken = async (req: Request, res: Response) => {
  const userId = (req.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const { fcmToken } = req.body;

  if (!fcmToken) {
    return res.status(400).json({ message: 'FCM token required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'FCM token updated successfully' });
  } catch (error) {
    // Optionally log error
    res.status(500).json({ message: 'Internal server error' });
  }
};

const setPin = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const { pin } = req.body;

  if (!pin || pin.length !== 4) {
    return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
  }

  const result = await UserService.setPin(userId, pin);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: '',
    data: result,
  });
});

const updatePin = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const { oldPin, newPin } = req.body;

  if (!oldPin || !newPin || newPin.length !== 4) {
    return res.status(400).json({ message: 'Invalid PIN format' });
  }

  const result = await UserService.updatePin(userId, oldPin, newPin);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
  });
});

const verifyPin = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const { pin } = req.body;

  if (!pin || pin.length !== 4) {
    return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
  }

  const result = await UserService.verifyPin(userId, pin);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.isValid ? 'PIN verified successfully' : 'Invalid PIN',
    data: { isValid: result.isValid },
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  getAllUsers,
  updateFcmToken,
  setPin,
  updatePin,
  verifyPin,
};
