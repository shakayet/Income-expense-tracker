import { INotification } from '../app/modules/notification/notification.interface';
import { createNotification } from '../app/modules/notification/notification.service';
import {
  getMonthlyReport,
  getYearlyReport,
} from '../app/modules/reports/report.service';
import { getAllUsersFromDB } from '../app/modules/user/user.service';

export const sendMonthlyNotifications = async (): Promise<void> => {
  const users = await getAllUsersFromDB();

  const date = new Date();
  const currentYear = String(date.getFullYear());
  const prevMonth = String(
    date.getMonth() === 0 ? 12 : date.getMonth()
  ).padStart(2, '0');
  const selectDate = currentYear + '-' + prevMonth;

  for (const user of users) {
    if (!user || !user.id) continue;

    const monthlyReport = await getMonthlyReport(user.id, selectDate);

    const monthlyData: Partial<INotification> & {
      title: string;
      message: string;
    } = {
      type: 'monthly-report',
      title: 'Your Monthly Report is Ready',
      message: `Tap to see your report for ${prevMonth}/${currentYear}`,
      reportMonth: prevMonth,
      reportYear: currentYear,
    };

    if (
      (monthlyReport?.totalIncome ?? -1) >= 0 ||
      (monthlyReport?.totalExpense ?? -1) >= 0
    ) {
      await createNotification(monthlyData, user.id);
    }
  }
};

export const sendYearlyNotifications = async (): Promise<void> => {
  const users = await getAllUsersFromDB();

  const date = new Date();
  // const currentYear = String(date.getFullYear());
  const prevYear = (
    date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear()
  ).toString();

  for (const user of users) {
    if (!user || !user.id) continue;

    const yearlyReport = await getYearlyReport(user.id, prevYear);

    const yearlyData: Partial<INotification> & {
      title: string;
      message: string;
    } = {
      type: 'yearly-report',
      title: 'Your Yearly Report is Ready',
      message: `Tap to see your report for ${prevYear}`,
      reportYear: prevYear,
    };

    if (
      (yearlyReport?.totalIncome ?? -1) >= 0 ||
      (yearlyReport?.totalExpense ?? -1) >= 0
    ) {
      await createNotification(yearlyData, user.id);
    }
  }
};
