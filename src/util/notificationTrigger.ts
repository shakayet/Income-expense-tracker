import { createNotification } from '../app/modules/notification/notification.service';
import {
  getMonthlyReport,
  getYearlyReport,
} from '../app/modules/reports/report.service';
import { getAllUsersFromDB }  from '../app/modules/user/user.service';
import { getBudgetDetails } from '../app/modules/budget/budget.controller';

export const sendMonthlyAndYearlyNotifications = async () => {
  const users = await getAllUsersFromDB();

  for (const user of users) {
    const date = new Date();
    const currentMonth = String(date.getMonth() + 1).padStart(2, '0');
    const currentYear = String(date.getFullYear());
    const prevMonth = String(
      date.getMonth() === 0 ? 12 : date.getMonth()
    ).padStart(2, '0');
    const prevYear =
      date.getMonth() === 0 ? (date.getFullYear() - 1).toString() : currentYear;
    const selectDate = currentYear + '-' + prevMonth;

    // Monthly report
    const monthlyReport = await getMonthlyReport(user.id, selectDate);
    if (monthlyReport.totalIncome > 0 || monthlyReport.totalExpense > 0) {
      await createNotification({
        userId: user.id,
        type: 'monthly-report',
        title: 'Your Monthly Report is Ready',
        message: `Tap to see your report for ${prevMonth}/${currentYear}`,
        reportMonth: prevMonth,
        reportYear: currentYear,
      });
    }

    // Yearly report
    if (date.getMonth() === 0) {
      const yearlyReport = await getYearlyReport(user.id, prevYear);
      if (yearlyReport.totalIncome > 0 || yearlyReport.totalExpense > 0) {
        await createNotification({
          userId: user.id,
          type: 'yearly-report',
          title: 'Your Yearly Report is Ready',
          message: `Tap to see your report for ${prevYear}`,
          reportYear: prevYear,
        });
      }
    }
  }
};
