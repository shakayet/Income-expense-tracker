import { Income } from '../income/income.model';
import { Expense } from '../expense/expense.model';
import { Types } from 'mongoose';

const calculatePercentage = (data: Record<string, number>, total: number) => {
  return Object.entries(data)
    .map(([key, value]) => ({
      category: key,
      percentage: +((value / total) * 100).toFixed(2),
    }))
    .sort((a, b) => b.percentage - a.percentage);
};

export const getMonthlyReport = async (userId: string, month: string) => {
  const incomeData = await Income.find({
    userId: new Types.ObjectId(userId),
    month,
  });
  const expenseData = await Expense.find({
    userId: new Types.ObjectId(userId),
  });

  const monthlyExpenses = expenseData.filter(item => {
    const d = new Date(item.createdAt);
    return (
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` ===
      month
    );
  });

  const totalIncome = incomeData.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const incomeByCategory: Record<string, number> = {};
  for (const inc of incomeData) {
    incomeByCategory[inc.source] =
      (incomeByCategory[inc.source] || 0) + inc.amount;
  }

  const expenseByCategory: Record<string, number> = {};
  for (const exp of monthlyExpenses) {
    expenseByCategory[exp.category] =
      (expenseByCategory[exp.category] || 0) + exp.amount;
  }

  const savings = totalIncome - totalExpense;

  return {
    month,
    totalIncome,
    incomeBreakdown: calculatePercentage(incomeByCategory, totalIncome),
    totalExpense,
    expenseBreakdown: calculatePercentage(expenseByCategory, totalExpense),
    savings,
  };
};

export const getYearlyReport = async (userId: string, year: string) => {
  const incomeData = await Income.find({ userId: new Types.ObjectId(userId) });
  const expenseData = await Expense.find({
    userId: new Types.ObjectId(userId),
  });

  const yearlyIncome = incomeData.filter(
    i => new Date(i.date).getFullYear().toString() === year
  );
  const yearlyExpense = expenseData.filter(
    e => new Date(e.createdAt).getFullYear().toString() === year
  );

  const totalIncome = yearlyIncome.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = yearlyExpense.reduce((sum, e) => sum + e.amount, 0);

  const incomeByCategory: Record<string, number> = {};
  for (const inc of yearlyIncome) {
    incomeByCategory[inc.source] =
      (incomeByCategory[inc.source] || 0) + inc.amount;
  }

  const expenseByCategory: Record<string, number> = {};
  for (const exp of yearlyExpense) {
    expenseByCategory[exp.category] =
      (expenseByCategory[exp.category] || 0) + exp.amount;
  }

  const savings = totalIncome - totalExpense;

  return {
    year,
    totalIncome,
    incomeBreakdown: calculatePercentage(incomeByCategory, totalIncome),
    totalExpense,
    expenseBreakdown: calculatePercentage(expenseByCategory, totalExpense),
    savings,
  };
};
