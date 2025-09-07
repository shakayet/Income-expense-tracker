/* eslint-disable no-console */
import cron from 'node-cron';
import {
  sendMonthlyNotifications,
  sendYearlyNotifications,
} from './notificationTrigger';

// cron.schedule('* * * * *', () => {
//   console.log('Running notifications every minute...');
//   sendMonthlyNotifications().catch(console.error);
// });
// Run monthly report notifications at 00:01 on 1st day of every month
cron.schedule('1 0 1 * *', () => {
  console.log('Running monthly notifications...');
  sendMonthlyNotifications().catch(console.error);
});

// Run yearly report notifications at 00:02 on 1st day of every year (Jan 1st)
cron.schedule('2 0 1 1 *', () => {
  console.log('Running yearly notifications...');
  sendYearlyNotifications().catch(console.error);
});
