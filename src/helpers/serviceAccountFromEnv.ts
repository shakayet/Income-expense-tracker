/* eslint-disable no-console */
/* eslint-disable no-undef */
// This script decodes the base64-encoded service account key from the environment and writes it to a temp file for use by the push notification logic.
import fs from 'fs';
import path from 'path';
import process from 'process';

export function getServiceAccountPathFromEnv(): string {
  const base64 = process.env.FCM_SERVICE_ACCOUNT_BASE64;
  if (!base64)
    throw new Error(
      'FCM_SERVICE_ACCOUNT_BASE64 is not set in environment variables'
    );
  const json = Buffer.from(base64, 'base64').toString('utf8');
  // Always resolve to the project root config folder
  const configDir = path.resolve(__dirname, '../../config');
  const tempPath = path.join(configDir, '.serviceAccountKey.temp.json');
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(tempPath, json, { encoding: 'utf8' });
  } catch (err) {
    throw new Error('Failed to write service account temp file: ' + err);
  }
  return tempPath;
}
