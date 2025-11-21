"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../app/modules/auth/auth.route");
const user_route_1 = require("../app/modules/user/user.route");
const expense_route_1 = require("../app/modules/expense/expense.route");
const income_route_1 = require("../app/modules/income/income.route");
const budget_route_1 = require("../app/modules/budget/budget.route");
const report_route_1 = require("../app/modules/reports/report.route");
// import path from 'path';
// import { NotificationRoutes } from '../app/modules/notification/notification.route';
// import { PlanRoutes } from '../app/modules/plan/plan.routes';
// import { SubscriptionRoutes } from '../app/modules/subscription/subscription.routes';
const category_route_1 = require("../app/modules/category/category.route");
const compare_route_1 = __importDefault(require("../app/modules/price-compare/compare.route"));
const routes_1 = require("../app/modules/terms&conditions/routes");
const review_route_1 = require("../app/modules/review/review.route");
const recentTransaction_route_1 = require("../app/modules/recentTransaction/recentTransaction.route");
// import { stripePayments } from '../stripe/stripeRoute';
const affiliate_routes_1 = require("../app/modules/scraping/affiliate.routes");
const notification_route_1 = require("../app/modules/notification/notification.route");
const marketplace_route_1 = require("../app/modules/marketplace/marketplace.route");
const marketplacecredential_route_1 = require("../app/modules/marketplacecredential/marketplacecredential.route");
const savings_route_1 = require("../app/modules/savings/savings.route");
const inapp_route_1 = require("../app/modules/inAppPurchase/inapp.route");
const route_1 = require("../app/modules/subscription_plan/route");
const dev_route_1 = __importDefault(require("../app/modules/dev/dev.route"));
const router = express_1.default.Router();
const apiRoutes = [
    {
        path: '/user',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/expense',
        route: expense_route_1.ExpenseRoutes,
    },
    {
        path: '/income',
        route: income_route_1.IncomeRoutes,
    },
    {
        path: '/budget',
        route: budget_route_1.BudgetRoutes,
    },
    {
        path: '/reports',
        route: report_route_1.ReportRoutes,
    },
    {
        path: '/notifications',
        route: notification_route_1.NotificationRoutes,
    },
    // {
    //   path: '/plan',
    //   route: PlanRoutes,
    // },
    // {
    //   path: '/subscription',
    //   route: SubscriptionRoutes,
    // },
    {
        path: '/category',
        route: category_route_1.CategoryRoutes,
    },
    {
        path: '/compare-price',
        route: compare_route_1.default,
    },
    {
        path: '/terms-conditions',
        route: routes_1.TermsRoutes,
    },
    {
        path: '/review',
        route: review_route_1.ReviewRoutes,
    },
    {
        path: '/recent-transactions',
        route: recentTransaction_route_1.recentTransaction,
    },
    // {
    //   path: '/stripe',
    //   route: stripePayments,
    // },
    {
        path: '/scraping',
        route: affiliate_routes_1.Scraping,
    },
    {
        path: '/marketplace',
        route: marketplace_route_1.MarketplaceRoutes,
    },
    {
        path: '/marketplacecredential',
        route: marketplacecredential_route_1.MarketplacecredentialRoutes,
    },
    {
        path: '/savings',
        route: savings_route_1.SavingsRoutes,
    },
    {
        path: '/payment',
        route: inapp_route_1.InAppPurchaseRoutes,
    },
    {
        path: '/subscription-plan',
        route: route_1.SubscriptionPlan,
    },
    {
        path: '/dev',
        route: dev_route_1.default,
    },
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
