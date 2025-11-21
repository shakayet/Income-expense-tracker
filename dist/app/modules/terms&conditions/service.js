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
exports.TermsService = exports.updateTerms = void 0;
const model_1 = require("./model");
const createTerms = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield model_1.TermsModel.create(payload);
});
const getLatestTerms = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield model_1.TermsModel.findOne().sort({ effectiveDate: -1 });
});
const getAllTerms = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield model_1.TermsModel.find().sort({ effectiveDate: -1 });
});
const updateTerms = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield model_1.TermsModel.findByIdAndUpdate(id, payload, { new: true });
});
exports.updateTerms = updateTerms;
const deleteTerms = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield model_1.TermsModel.findByIdAndDelete(id);
});
exports.TermsService = {
    createTerms,
    getLatestTerms,
    getAllTerms,
    updateTerms: exports.updateTerms,
    deleteTerms,
};
