/* eslint-disable @typescript-eslint/no-explicit-any */
import { Income } from '../income/income.model';
import Expense from '../expense/expense.model';
import { Budget } from '../budget/budget.model';

export const getMonthlyReport = async (userId: string, month: string) => {
  const incomes = await Income.find({ userId, month });
  const expenses = await Expense.find({
    userId,
    createdAt: {
      $gte: new Date(`${month}-01`),
      $lt: new Date(`${month}-31T23:59:59.999Z`),
    },
  });
  const budgetDoc = await Budget.findOne({ userId, month });

  const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
  const totalExpense = expenses.reduce((acc, item) => acc + item.amount, 0);

  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  for (const i of incomes)
    incomeByCategory[i.source] = (incomeByCategory[i.source] || 0) + i.amount;
  for (const e of expenses) {
    // Expense model uses `source` for the category/source field
    const catKey = e.source ? String(e.source) : 'unknown';
    expenseByCategory[catKey] = (expenseByCategory[catKey] || 0) + e.amount;
  }

  const incomeCategoryPercentage = Object.entries(incomeByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Number(((totalIncome > 0 ? (amount / totalIncome) * 100 : 0)).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const expenseCategoryPercentage = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Number(((totalExpense > 0 ? (amount / totalExpense) * 100 : 0)).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Fix: Access totalBudget directly from the document
  const budget = (budgetDoc as any)?.totalBudget || 0;
  const savings = (totalIncome - totalExpense).toFixed(2);

  // Avoid division by zero
  const budgetUsedPercentage =
    budget > 0 ? ((totalExpense / budget) * 100).toFixed(2) : '0.00';

  return {
    month,
    budget,
    totalIncome,
    totalExpense,
    savings,
    budgetUsedPercentage,
    incomeCategoryPercentage,
    expenseCategoryPercentage,
  };
};

export const getYearlyReport = async (userId: string, year: string) => {
  const incomeDocs = await Income.find({
    userId,
    month: { $regex: `^${year}-` },
  });
  const expenseDocs = await Expense.find({
    userId,
    createdAt: {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${year}-12-31T23:59:59.999Z`),
    },
  });
  const budgets = await Budget.find({ userId, month: { $regex: `^${year}-` } });

  const totalIncome = incomeDocs.reduce((acc, item) => acc + item.amount, 0);
  const totalExpense = expenseDocs.reduce((acc, item) => acc + item.amount, 0);

  // Fix: Access amount directly from budget documents
  const totalBudget = budgets.reduce(
    (acc, b) => acc + ((b as any).amount || 0),
    0
  );

  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  for (const i of incomeDocs)
    incomeByCategory[i.source] = (incomeByCategory[i.source] || 0) + i.amount;
  for (const e of expenseDocs) {
    // Expense model uses `source` for the category/source field
    const catKey = e.source ? String(e.source) : 'unknown';
    expenseByCategory[catKey] = (expenseByCategory[catKey] || 0) + e.amount;
  }

  const incomeCategoryPercentage = Object.entries(incomeByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Number(((totalIncome > 0 ? (amount / totalIncome) * 100 : 0)).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const expenseCategoryPercentage = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Number(((totalExpense > 0 ? (amount / totalExpense) * 100 : 0)).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const savings = (totalIncome - totalExpense).toFixed(2);

  // Avoid division by zero
  const budgetUsedPercentage =
    totalBudget > 0 ? ((totalExpense / totalBudget) * 100).toFixed(2) : '0.00';

  return {
    year,
    totalBudget,
    totalIncome,
    totalExpense,
    savings,
    budgetUsedPercentage,
    incomeCategoryPercentage,
    expenseCategoryPercentage,
  };
};
