/* eslint-disable no-console */
import axios from 'axios';
import config from '../config';

export type PushNotificationPayload = {
  token: string;
  title: string;
  body: string;
}

export const sendPushNotification = async ({
  token,
  title,
  body,
}: PushNotificationPayload): Promise<void> => {

  const serverKey = config.fcm_server_key;
  
  if (!serverKey) {
    throw new Error('FCM_SERVER_KEY is not set in environment variables');
  }
  const payload = {
    to: token,
    notification: { title, body },
  };

  try {
    await axios.post('https://fcm.googleapis.com/fcm/send', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${serverKey}`,
      },
    });
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
};
