"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const income_controller_1 = require("./income.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const income_pdf_controller_1 = require("./income.pdf.controller");
const income_csv_excel_controller_1 = require("./income.csv.excel.controller");
const router = express_1.default.Router();
router.use((0, auth_1.default)(user_1.USER_ROLES.USER));
router.route('/').post(income_controller_1.createIncome).get(income_controller_1.getAllIncomes);
router.route('/:id').patch(income_controller_1.updateIncome).delete(income_controller_1.deleteIncome);
router.route('/summary').get(income_controller_1.getMonthlyIncomeSummary);
router.route('/categories').get(income_controller_1.getIncomeCategories).post(income_controller_1.createIncomeCategory);
router
    .route('/categories/:id')
    .patch(income_controller_1.updateIncomeCategory)
    .delete(income_controller_1.deleteIncomeCategory);
router.route('/pdf').get(income_pdf_controller_1.incomePdfController);
router.route('/csv').get(income_csv_excel_controller_1.incomeCSVController);
router.route('/excel').get(income_csv_excel_controller_1.incomeExcelController);
exports.IncomeRoutes = router;
