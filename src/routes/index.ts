import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { ExpenseRoutes } from '../app/modules/expense/expense.route';
import { IncomeRoutes } from '../app/modules/income/income.route';
import { BudgetRoutes } from '../app/modules/budget/budget.route';
import { ReportRoutes } from '../app/modules/reports/report.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/expense',
    route: ExpenseRoutes,
  },
  {
    path: '/income',
    route: IncomeRoutes,
  },
  {
    path: '/budget',
    route: BudgetRoutes,
  },
  {
    path: '/reports',
    route: ReportRoutes,
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
