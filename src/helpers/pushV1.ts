/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable no-console */
// pushNotification.ts (or any filename you prefer)

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import config from '../config'; // Your custom config file/module
import { getServiceAccountPathFromEnv } from './serviceAccountFromEnv';
// import { invalidateToken } from '../app/modules/user/user.model';

// ✅ Helper to get OAuth2 access token from service account
async function getAccessToken(serviceAccountPath: string) {
  try {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8')
    );

    const jwtClient = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const tokens = await jwtClient.authorize();
    return tokens.access_token;
  } catch (error) {
    console.error('❌ Failed to load service account or get token:', error);
    throw error;
  }
}

export type PushNotificationPayload = {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>; // FCM data must be string key-value pairs
};

// Push notification sender
export const sendPushNotification = async ({
  token,
  title,
  body,
  data,
}: PushNotificationPayload): Promise<void> => {
  try {
    // console.log('🚀 Sending push notification:', { token, title, body, data });

    const cfg = config as {
      fcm_service_account_path?: string;
      firebase_project_id?: string;
    };

    // console.log({cfg})

    const serviceAccountPath = process.env.FCM_SERVICE_ACCOUNT_BASE64
      ? getServiceAccountPathFromEnv()
      : cfg.fcm_service_account_path ||
        path.resolve(__dirname, '..', 'config', 'serviceAccountKey.json');

    const projectId = cfg.firebase_project_id;
    const accessToken = await getAccessToken(serviceAccountPath);

    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const payload = {
      message: {
        token,
        notification: {
          title,
          body: typeof body === 'string' ? body : JSON.stringify(body),
        },
        data,
      },
    };

    // Attach data if provided (all values must be strings)

    // console.log({payload : payload.message.data})

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      // console.error('❌ FCM send failed:', response.status, errorBody);

      if (response.status === 404) {
        const errorJson = JSON.parse(errorBody);
        console.log('❌ FCM send failed with 404:', errorJson);
        // if (
        //   errorJson.error &&
        //   errorJson.error.details &&
        //   errorJson.error.details.some(
        //     (d: any) => d.errorCode === 'UNREGISTERED'
        //   )
        // ) {
        //   // Call your function to invalidate the token here
        //   await invalidateToken(token);
        //   console.log(
        //     `🔔 Token ${token} invalidated due to UNREGISTERED error.`
        //   );
        // }
      }
    } else {
      console.log('✅ Push notification sent successfully.');
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
};
