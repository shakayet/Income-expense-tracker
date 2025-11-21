"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsController = exports.updateTerms = exports.getAllTerms = exports.getLatestTerms = exports.createTerms = exports.deleteTerms = void 0;
const deleteTerms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield service_1.TermsService.deleteTerms(id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Terms not found' });
    }
    res.json({
        success: true,
        message: 'Terms deleted successfully',
        data: result,
    });
});
exports.deleteTerms = deleteTerms;
const service_1 = require("./service");
const createTerms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield service_1.TermsService.createTerms(req.body);
    res.status(201).json({
        success: true,
        message: 'Terms & Conditions created successfully',
        data: result,
    });
});
exports.createTerms = createTerms;
const getLatestTerms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield service_1.TermsService.getLatestTerms();
    res.status(200).json({
        success: true,
        message: 'Latest Terms & Conditions retrieved',
        data: result,
    });
});
exports.getLatestTerms = getLatestTerms;
const getAllTerms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield service_1.TermsService.getAllTerms();
    res.status(200).json({
        success: true,
        message: 'All Terms & Conditions retrieved',
        data: result,
    });
});
exports.getAllTerms = getAllTerms;
const updateTerms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield service_1.TermsService.updateTerms(id, req.body);
    res.json({
        success: true,
        message: 'Terms updated successfully',
        data: result,
    });
});
exports.updateTerms = updateTerms;
exports.TermsController = {
    createTerms: exports.createTerms,
    getLatestTerms: exports.getLatestTerms,
    getAllTerms: exports.getAllTerms,
    updateTerms: exports.updateTerms,
};
