import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { ExpenseRoutes } from '../app/modules/expense/expense.route';
import { IncomeRoutes } from '../app/modules/income/income.route';
import { BudgetRoutes } from '../app/modules/budget/budget.route';
import { ReportRoutes } from '../app/modules/reports/report.route';
// import path from 'path';
// import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { PlanRoutes } from '../app/modules/plan/plan.routes';
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.routes';
import { CategoryRoutes } from '../app/modules/category/category.route';
import comparePriceRoutes from '../app/modules/price-compare/compare.route';
import { TermsRoutes } from '../app/modules/terms&conditions/routes';
import { ReviewRoutes } from '../app/modules/review/review.route';
import { recentTransaction } from '../app/modules/recentTransaction/recentTransaction.route';
import { stripePayments } from '../stripe/stripeRoute';
import { InAppPurchaseRoutes } from '../app/modules/inAppPurchase/inAppPurchase.route';

// import express from 'express';
// import { AuthRoutes } from '../app/modules/auth/auth.route';
// import { UserRoutes } from '../app/modules/user/user.route';
// import { ExpenseRoutes } from '../app/modules/expense/expense.route';
// import { IncomeRoutes } from '../app/modules/income/income.route';
// import { BudgetRoutes } from '../app/modules/budget/budget.route';
// import { ReportRoutes } from '../app/modules/reports/report.route';
// // import path from 'path';
// // import { NotificationRoutes } from '../app/modules/notification/notification.route';
// import { PlanRoutes } from '../app/modules/plan/plan.routes';
// import { SubscriptionRoutes } from '../app/modules/subscription/subscription.routes';
// import { CategoryRoutes } from '../app/modules/category/category.route';
// import comparePriceRoutes from '../app/modules/price-compare/compare.route';
// import { TermsRoutes } from '../app/modules/terms&conditions/routes';
// import { ReviewRoutes } from '../app/modules/review/review.route';
// import { recentTransaction } from '../app/modules/recentTransaction/recentTransaction.route';
// import { stripePayments } from '../stripe/stripeRoute';

const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/in-app-purchase',
    route: InAppPurchaseRoutes,
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
  },
  // {
  //   path: '/notifications',
  //   route: NotificationRoutes,
  // },
  { path: '/plan', route: PlanRoutes },
  { path: '/subscription', route: SubscriptionRoutes },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/compare-price',
    route: comparePriceRoutes,
  },
  {
    path: '/terms-conditions',
    route: TermsRoutes,
  },
  {
    path: '/review',
    route: ReviewRoutes,
  },
  {
    path: '/recent-transactions',
    route: recentTransaction,
  },
  {
    path: '/stripe',
    route: stripePayments,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
