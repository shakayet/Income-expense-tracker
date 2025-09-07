import { getMessaging, getToken } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCE-Z5Vb9cCBAf0INydoWQ_SWp-vhyy12c',
  authDomain: 'push-notification-41546.firebaseapp.com',
  projectId: 'push-notification-41546',
  storageBucket: 'push-notification-41546.firebasestorage.app',
  messagingSenderId: '816064339711',
  appId: '1:816064339711:web:dbd364b3c42bb0a71376ca',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

getToken(messaging, { vapidKey: 'BLwQqe7RCSzb35mOMVEcnMYYlM7JcL-u1R3ExlJosqBHKF_-aXrR3MCx1dboySZsVj2yFC1E-D5DOmxQGL_f6DY' })
  .then((token) => {
    if (token) {
      console.log('✅ New FCM token:', token);
      // Use this token on your backend to send push notifications
    } else {
      console.log('⚠️ No registration token available. Request permission.');
    }
  })
  .catch((err) => {
    console.error('❌ Error getting token:', err);
  });
