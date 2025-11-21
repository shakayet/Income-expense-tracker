"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasReachedThreshold = void 0;
const thresholdMap = new Map();
const hasReachedThreshold = (userId, monthKey, threshold) => {
    const key = `${userId}-${monthKey}`;
    if (!thresholdMap.has(key)) {
        thresholdMap.set(key, new Set());
    }
    const userThresholds = thresholdMap.get(key);
    if (userThresholds.has(threshold)) {
        return false;
    }
    userThresholds.add(threshold);
    return true;
};
exports.hasReachedThreshold = hasReachedThreshold;
