import axios from 'axios';

export const sendPushNotification = async ({ token, title, body }) => {
  const serverKey = process.env.FCM_SERVER_KEY;
  const payload = {
    to: token,
    notification: { title, body },
  };

  await axios.post('https://fcm.googleapis.com/fcm/send', payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${serverKey}`,
    },
  });
};
