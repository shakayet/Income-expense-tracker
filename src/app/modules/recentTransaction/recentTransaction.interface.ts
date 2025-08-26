export type IRecentTransaction = {
  _id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  createdAt: Date;
}
