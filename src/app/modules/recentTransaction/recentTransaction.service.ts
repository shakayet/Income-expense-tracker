import { Income } from '../income/income.model';
// import IncomeModel from '../income/income.model';
import ExpenseModel from '../expense/expense.model';
import { IRecentTransaction } from './recentTransaction.interface';

export const getRecentTransactions = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  // Fetch incomes & expenses
  const incomes = await Income.find({ userId })
    .select('_id source amount date')
    .lean();

  const expenses = await ExpenseModel.find({ userId })
    .select('_id category amount createdAt')
    .lean();

  // Normalize into common structure
  const transactions: IRecentTransaction[] = [
    ...incomes.map(i => ({
      _id: i._id.toString(),
      type: 'income' as const,
      title: typeof i.source === 'string' ? i.source : String(i.source),
      amount: i.amount,
      createdAt: i.date instanceof Date ? i.date : new Date(i.date),
    })),
    ...expenses.map(e => ({
      _id: e._id.toString(),
      type: 'expense' as const,
      title:
        typeof e.category === 'string'
          ? e.category
          : e.category
          ? String(e.category)
          : '',
      amount: e.amount,
      createdAt:
        e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt),
    })),
  ];

  // Ensure createdAt is a Date object for all transactions
  transactions.forEach(t => {
    if (!(t.createdAt instanceof Date)) {
      t.createdAt = new Date(t.createdAt);
    }
  });

  // Sort by latest
  transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Paginate
  const paginated = transactions.slice(skip, skip + limit);

  // Format response
  const formatted = paginated.map(t => ({
    _id: t._id,
    title: t.type === 'income' ? `${t.title} Deposit` : t.title,
    type: t.type,
    amount: t.type === 'income' ? `+${t.amount}` : `-${t.amount}`,
    time: formatDate(t.createdAt),
  }));

  return {
    transactions: formatted,
    total: transactions.length,
    page,
    limit,
  };
};

// Helper to format dates
function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const d = date.toDateString();
  if (d === today.toDateString()) return 'Today';
  if (d === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
}
