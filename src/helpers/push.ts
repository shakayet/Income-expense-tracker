import axios from 'axios';

interface PushNotificationPayload {
  token: string;
  title: string;
  body: string;
}

export const sendPushNotification = async ({
  token,
  title,
  body,
}: PushNotificationPayload): Promise<void> => {
  const serverKey = process.env.FCM_SERVER_KEY;
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
