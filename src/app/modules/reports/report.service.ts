import { Income } from '../income/income.model';
import Expense from '../expense/expense.model';
import { Types } from 'mongoose';
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
  for (const e of expenses)
    expenseByCategory[e.category] =
      (expenseByCategory[e.category] || 0) + e.amount;

  const incomeCategoryPercentage = Object.entries(incomeByCategory)
    .map(([category, amount]) => ({
      category,
      percentage: Number(((amount / totalIncome) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const expenseCategoryPercentage = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({
      category,
      percentage: Number(((amount / totalExpense) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const budget = budgetDoc?.amount || 0;
  const savings = (totalIncome - totalExpense).toFixed(2);

  const budgetUsedPercentage = ((totalExpense / budget) * 100 ).toFixed(2);

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
  const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);

  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  for (const i of incomeDocs)
    incomeByCategory[i.source] = (incomeByCategory[i.source] || 0) + i.amount;
  for (const e of expenseDocs)
    expenseByCategory[e.category] =
      (expenseByCategory[e.category] || 0) + e.amount;

  const incomeCategoryPercentage = Object.entries(incomeByCategory)
    .map(([category, amount]) => ({
      category,
      percentage: Number(((amount / totalIncome) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const expenseCategoryPercentage = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({
      category,
      percentage: Number(((amount / totalExpense) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const savings = (totalIncome - totalExpense).toFixed(2);

  const budgetUsedPercentage = ((totalExpense / totalBudget) * 100 ).toFixed(2);

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
