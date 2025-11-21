"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseRoutes = void 0;
const express_1 = __importDefault(require("express"));
const expenseController = __importStar(require("./expense.controller"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const expense_zod_1 = require("./expense.zod");
const expense_ocr_controller_1 = require("./expense.ocr.controller");
const expense_controller_1 = require("./expense.controller");
const user_1 = require("../../../enums/user");
const expense_pdf_controller_1 = require("./expense.pdf.controller");
const expense_csv_excel_controller_1 = require("./expense.csv.excel.controller");
const router = express_1.default.Router();
router.use((0, auth_1.default)(user_1.USER_ROLES.USER));
router
    .route('/')
    .post((0, validateRequest_1.default)(expense_zod_1.createExpenseZodSchema), expenseController.createExpense)
    .get(expenseController.getExpenses);
router.route('/summary').get(expense_controller_1.getMonthlyExpenseSummary);
router
    .route('/expense-categories')
    .get(expenseController.getExpenseCategories)
    .post(expenseController.createExpenseCategory);
router.post('/ocr-raw', expense_ocr_controller_1.uploadTextAndExtractExpense);
router.route('/generate/csv').get(expense_csv_excel_controller_1.expenseCSVController);
router.route('/generate/excel').get(expense_csv_excel_controller_1.expenseExcelController);
router
    .route('/:id')
    .get(expenseController.getExpense) // Add this line
    .put((0, validateRequest_1.default)(expense_zod_1.expenseUpdateSchema), expenseController.updateExpense)
    .delete(expenseController.deleteExpense);
router.route('/categories/:id').patch(expenseController.updateExpenseCategory);
router.route('/categories/:id').delete(expenseController.deleteIncomeCategory);
router.route('/generate/pdf').get(expense_pdf_controller_1.expensePdfController);
exports.ExpenseRoutes = router;
