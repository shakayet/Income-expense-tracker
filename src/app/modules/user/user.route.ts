import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router.patch(
  '/set-pin',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
  UserController.setPin
);
router
  .route('/profile')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, ),
    UserController.getUserProfile
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return UserController.updateProfile(req, res, next);
    }
  );

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );

router
  .route('/fcm-token')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
    UserController.updateFcmToken
  );

router.patch(
  '/update-pin',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
  UserController.updatePin
);
router.post(
  '/verify-pin',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
  UserController.verifyPin
);
router.get(
  '/admin/user-list',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  UserController.getUserListForAdmin
);
router.get(
  '/admin/user/:userId',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  UserController.getUserProfileById
);
router.patch(
  '/admin/user/:userId',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  UserController.updateUserById
);

// otp for sensitive actions
router
  .route('/send-otp')
  .post(auth(USER_ROLES.USER), UserController.sendOtpForSensitiveAction);
router
  .route('/change-email')
  .patch(auth(USER_ROLES.USER), UserController.changeEmail);
router
  .route('/change-password')
  .patch(auth(USER_ROLES.USER), UserController.changePassword);
export const UserRoutes = router;
