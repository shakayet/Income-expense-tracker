import { Request, Response } from 'express';
import { sendPushNotificationRaw } from '../../../helpers/pushV1';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

export const testPush = async (req: Request, res: Response) => {
  const { token, title, body, data } = req.body;

  if (!token || !title || !body) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'token, title and body are required',
    });
  }

  const result = await sendPushNotificationRaw({ token, title, body, data });

  return sendResponse(res, {
    statusCode: result.ok ? httpStatus.OK : httpStatus.INTERNAL_SERVER_ERROR,
    success: result.ok,
    message: result.ok ? 'Push sent' : 'Push failed',
    data: result.body,
  });
};
