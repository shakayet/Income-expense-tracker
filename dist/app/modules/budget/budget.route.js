'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.BudgetRoutes = void 0;
const express_1 = __importDefault(require('express'));
const budget_controller_1 = require('./budget.controller');
const validateRequest_1 = __importDefault(
  require('../../middlewares/validateRequest')
);
const budget_zod_1 = require('./budget.zod');
const auth_1 = __importDefault(require('../../middlewares/auth'));
const user_1 = require('../../../enums/user');
const router = express_1.default.Router();
router.use((0, auth_1.default)(user_1.USER_ROLES.USER));
// Route to get only monthly budget and month for a user
router.get('/monthly-budget', budget_controller_1.getMonthlyBudgetAndMonth);
router.route('/monthly').post(budget_controller_1.setMonthlyBudget);
// Accumulative POST for current month: body { category: string, amount: number }
router.route('/current').post(budget_controller_1.postAccumulativeBudget); // -------> actual working route
// Monthly summary: GET /budgets/monthly/:month
router.route('/monthly/:month').get(budget_controller_1.getMonthlySummary);
router
  .route('/simple-monthly-budget')
  .post(budget_controller_1.postSimpleBudgetDetails);
router
  .route('/simple-monthly-budget')
  .get(budget_controller_1.getSimpleBudgetDetails); // --------> actual working route
router
  .route('/monthly/:month')
  .patch(
    (0, validateRequest_1.default)(budget_zod_1.updateMonthlyBudgetZodSchema),
    budget_controller_1.updateMonthlyBudget
  );
router
  .route('/')
  .post(
    (0, validateRequest_1.default)(budget_zod_1.setBudgetZodSchema),
    budget_controller_1.setOrUpdateBudget
  );
router
  .route('/:month')
  .get(budget_controller_1.getBudgetDetails)
  .put(
    (0, validateRequest_1.default)(budget_zod_1.updateBudgetZodSchema),
    budget_controller_1.updateBudget
  )
  .delete(budget_controller_1.deleteBudget); // add PUT and DELETE
router
  .route('/:month/category')
  .post(
    (0, validateRequest_1.default)(budget_zod_1.addBudgetCategoryZodSchema),
    budget_controller_1.addBudgetCategory
  );
router
  .route('/:month/category/:category')
  .patch(
    (0, validateRequest_1.default)(budget_zod_1.updateBudgetCategoryZodSchema),
    budget_controller_1.updateBudgetCategory
  )
  .delete(budget_controller_1.deleteBudgetCategory);
exports.BudgetRoutes = router;
