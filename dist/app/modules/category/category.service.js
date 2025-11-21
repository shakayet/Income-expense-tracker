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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = exports.createCategory = void 0;
const category_model_1 = require("./category.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const createCategory = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, icon } = payload;
    // Check if this category already exists globally (default or custom by user)
    const existingCategory = yield category_model_1.Category.findOne({
        name: new RegExp(`^${name}$`, 'i'), // case-insensitive match
        icon,
        $or: [
            { isDefault: true },
            { userId }, // matches current user's custom categories
        ],
    });
    if (existingCategory) {
        throw new Error('Category with same name and icon already exists');
    }
    const category = yield category_model_1.Category.create(Object.assign(Object.assign({}, payload), { userId, isDefault: false }));
    return category;
});
exports.createCategory = createCategory;
const getAllCategories = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield category_model_1.Category.find({
        $or: [
            { userId: null }, // Default categories
            { userId: userId }, // User-specific categories
        ],
    }, { _id: 1, name: 1 } // 👈 Only return _id and name
    ).sort({ createdAt: -1 });
    return categories.map(cat => ({
        categoryId: cat._id,
        categoryName: cat.name,
    }));
});
const updateCategory = (categoryId, userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.findOneAndUpdate({ _id: categoryId, userId }, // ✅ user-scoped
    updateData, { new: true });
    if (!category)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Category not found or unauthorized');
    return category;
});
const deleteCategory = (categoryId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.findOneAndDelete({ _id: categoryId, userId }); // ✅ scoped
    if (!category)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Category not found or unauthorized');
    return category;
});
exports.CategoryService = {
    updateCategory,
    deleteCategory,
    getAllCategories,
    createCategory: exports.createCategory,
};
