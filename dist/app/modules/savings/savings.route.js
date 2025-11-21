"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const savings_controller_1 = require("./savings.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const savings_validation_1 = require("./savings.validation");
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const savings_pdf_controller_1 = require("./savings.pdf.controller");
const savings_csv_excel_controller_1 = require("./savings.csv.excel.controller");
const router = express_1.default.Router();
router
    .route('/')
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(savings_validation_1.createSavingsZodSchema), savings_controller_1.SavingsController.createSavings)
    .get((0, auth_1.default)(user_1.USER_ROLES.USER), savings_controller_1.SavingsController.getAllSavings);
router
    .route('/summary')
    .get((0, auth_1.default)(user_1.USER_ROLES.USER), savings_controller_1.SavingsController.getSavingsSummaryByCategory);
router.route('/pdf').get((0, auth_1.default)(user_1.USER_ROLES.USER), savings_pdf_controller_1.savingsPdfController);
router.route('/csv').get((0, auth_1.default)(user_1.USER_ROLES.USER), savings_csv_excel_controller_1.savingsCSVController);
router.route('/excel').get((0, auth_1.default)(user_1.USER_ROLES.USER), savings_csv_excel_controller_1.savingsExcelController);
exports.SavingsRoutes = router;
