import cron from 'node-cron';
import { sendMonthlyAndYearlyNotifications } from './notificationTrigger';

// Run at 00:01 on the 1st day of every month
sendMonthlyAndYearlyNotifications();

// Run at 00:01 on the 1st day of every month
cron.schedule('1 0 1 * *', () => {
  sendMonthlyAndYearlyNotifications();
});

// Run at 00:02 on the 1st day of every year
cron.schedule('2 0 1 1 *', () => {
  sendMonthlyAndYearlyNotifications();
});
