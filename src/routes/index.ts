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
// import { stripePayments } from '../stripe/stripeRoute';
import { Scraping } from '../app/modules/scraping/affiliate.routes';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { MarketplaceRoutes } from '../app/modules/marketplace/marketplace.route';
import { MarketplacecredentialRoutes } from '../app/modules/marketplacecredential/marketplacecredential.route';
import { SavingsRoutes } from '../app/modules/savings/savings.route';
import { InAppPurchaseRoutes } from '../app/modules/inAppPurchase/inapp.route';
import { SubscriptionPlan } from '../app/modules/subscription_plan/route';
import DevRoutes from '../app/modules/dev/dev.route';

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
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/plan',
    route: PlanRoutes,
  },
  {
    path: '/subscription',
    route: SubscriptionRoutes,
  },
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
  // {
  //   path: '/stripe',
  //   route: stripePayments,
  // },
  {
    path: '/scraping',
    route: Scraping,
  },
  {
    path: '/marketplace',
    route: MarketplaceRoutes,
  },
  {
    path: '/marketplacecredential',
    route: MarketplacecredentialRoutes,
  },
  {
    path: '/savings',
    route: SavingsRoutes,
  },
  {
    path: '/payment',
    route: InAppPurchaseRoutes,
  },
  {
    path: '/subscription-plan',
    route: SubscriptionPlan,
  },
  {
    path: '/dev',
    route: DevRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
