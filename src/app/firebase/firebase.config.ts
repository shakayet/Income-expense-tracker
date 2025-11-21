/* eslint-disable no-console */
import { getMessaging, getToken } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

// const firebaseConfig = {
//   apiKey: 'AIzaSyCE-Z5Vb9cCBAf0INydoWQ_SWp-vhyy12c',
//   authDomain: 'push-notification-41546.firebaseapp.com',
//   projectId: 'push-notification-41546',
//   storageBucket: 'push-notification-41546.firebasestorage.app',
//   messagingSenderId: '816064339711',
//   appId: '1:816064339711:web:dbd364b3c42bb0a71376ca',
// };

const firebaseConfig = {
  apiKey: "AIzaSyBzs05V-QG5TSAyBDWJkhGEy3mU7JJ2kZA",
  authDomain: "income-expense-tracker-6efe2.firebaseapp.com",
  projectId: "income-expense-tracker-6efe2",
  storageBucket: "income-expense-tracker-6efe2.firebasestorage.app",
  messagingSenderId: "136536097614",
  appId: "1:136536097614:web:f237a2ffadfd871a56141f"
};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

getToken(messaging, {
  vapidKey:
    'BEtfHt8S0P9H1TQ0v4F97N1yWg4SH58Uj1JJ7lbTvu3JDQQhP-OMDzY-4S5Ffu75ol_6dsL1gSuSGXH87wYwDkk',
})
  .then(token => {
    if (token) {
      console.log('✅ New FCM token:', token);
      // Use this token on your backend to send push notifications
    } else {
      console.log('⚠️ No registration token available. Request permission.');
    }
  })
  .catch(err => {
    console.error('❌ Error getting token:', err);
  });
