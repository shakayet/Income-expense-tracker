/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable no-console */
// pushNotification.ts (or any filename you prefer)

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import config from '../config'; // Your custom config file/module
import { getServiceAccountPathFromEnv } from './serviceAccountFromEnv';
import { invalidateToken } from '../app/modules/user/user.model';

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
        // Add platform-specific delivery hints to increase likelihood of OS-level popups
        android: {
          priority: 'high',
          notification: {
            channel_id: 'default',
            default_sound: true,
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
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

    const responseText = await response.text();
    let responseJson: any | null = null;
    try {
      responseJson = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      // non-json body
    }

    if (!response.ok) {
      // Log more details to help debugging (status + body)
      console.error('❌ FCM send failed:', response.status, responseText);

      // Handle UNREGISTERED / invalid tokens by invalidating locally
      if (
        responseJson &&
        responseJson.error &&
        Array.isArray(responseJson.error.details)
      ) {
        const details = responseJson.error.details;
        const hasUnregistered = details.some(
          (d: any) => d.errorCode === 'UNREGISTERED'
        );
        if (hasUnregistered) {
          try {
            await invalidateToken(token);
            console.info(
              `🔔 Token ${token} invalidated due to UNREGISTERED error.`
            );
          } catch (ie) {
            console.error('Failed to invalidate token:', ie);
          }
        }
      }

      // Throw an error so callers can react if needed
      throw new Error(`FCM send failed with status ${response.status}`);
    }

    // Success - log response for diagnostics
    console.info(
      '✅ Push notification sent successfully.',
      responseJson ?? responseText
    );
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
};

// Raw sender that returns the FCM HTTP response for debugging/test purposes
export const sendPushNotificationRaw = async ({
  token,
  title,
  body,
  data,
}: PushNotificationPayload): Promise<{
  ok: boolean;
  status: number;
  body: any;
}> => {
  try {
    const cfg = config as {
      fcm_service_account_path?: string;
      firebase_project_id?: string;
    };

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
        android: {
          priority: 'high',
          notification: {
            channel_id: 'default',
            default_sound: true,
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseJson: any | null = null;
    try {
      responseJson = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      // ignore
    }

    if (!response.ok) {
      // attempt to invalidate invalid tokens
      if (
        responseJson &&
        responseJson.error &&
        Array.isArray(responseJson.error.details)
      ) {
        const details = responseJson.error.details;
        const hasUnregistered = details.some(
          (d: any) => d.errorCode === 'UNREGISTERED'
        );
        if (hasUnregistered) {
          try {
            await invalidateToken(token);
          } catch (ie) {
            console.error('Failed to invalidate token:', ie);
          }
        }
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      body: responseJson ?? responseText,
    };
  } catch (error) {
    console.error('Error in sendPushNotificationRaw:', error);
    return { ok: false, status: 0, body: String(error) };
  }
};
