import { Types } from 'mongoose';

export type IInAppPurchase = {
  user: Types.ObjectId;
  productId: string;
  transactionId: string;
  purchaseDate: Date;
}
