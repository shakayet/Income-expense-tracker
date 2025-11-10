import { InAppPurchase } from './inapp.model';
import { IInAppPurchase } from './inapp.interface';

const createPurchaseInDB = async (payload: IInAppPurchase) => {
  const result = await InAppPurchase.create(payload);
  return result;
};

const getAllPurchasesFromDB = async () => {
  const result = await InAppPurchase.find().populate('user');
  return result;
};

const getSinglePurchaseFromDB = async (id: string) => {
  const result = await InAppPurchase.findById(id).populate('user');
  return result;
};

const deletePurchaseFromDB = async (id: string) => {
  const result = await InAppPurchase.findByIdAndDelete(id);
  return result;
};

export const InAppPurchaseService = {
  createPurchaseInDB,
  getAllPurchasesFromDB,
  getSinglePurchaseFromDB,
  deletePurchaseFromDB,
};
