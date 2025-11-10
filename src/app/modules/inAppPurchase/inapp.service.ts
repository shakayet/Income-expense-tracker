import { InAppPurchase } from './inapp.model';
import { IInAppPurchase } from './inapp.interface';

const createPurchaseInDB = async (payload: IInAppPurchase) => {
  const result = await InAppPurchase.create(payload);
  return result;
};

const getAllPurchasesFromDB = async (userId: string) => {
  const result = await InAppPurchase.find({ user: userId }).populate('user');
  return result;
};

const getSinglePurchaseFromDB = async (id: string, userId: string) => {
  const result = await InAppPurchase.findOne({ _id: id, user: userId }).populate('user');
  return result;
};

const deletePurchaseFromDB = async (id: string, userId: string) => {
  const result = await InAppPurchase.findOneAndDelete({ _id: id, user: userId });
  return result;
};

export const InAppPurchaseService = {
  createPurchaseInDB,
  getAllPurchasesFromDB,
  getSinglePurchaseFromDB,
  deletePurchaseFromDB,
};
