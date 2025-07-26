const thresholdMap: Map<string, Set<number>> = new Map();

export const hasReachedThreshold = (userId: string, monthKey: string, threshold: number) => {
  const key = `${userId}-${monthKey}`;
  if (!thresholdMap.has(key)) {
    thresholdMap.set(key, new Set());
  }

  const userThresholds = thresholdMap.get(key)!;
  if (userThresholds.has(threshold)) {
    return false;
  }

  userThresholds.add(threshold);
  return true;
};
