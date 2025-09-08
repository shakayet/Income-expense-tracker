import { TermsModel } from './model';
import { ITerms } from './interface';

const createTerms = async (payload: ITerms) => {
  return await TermsModel.create(payload);
};

const getLatestTerms = async () => {
  return await TermsModel.findOne().sort({ effectiveDate: -1 });
};

const getAllTerms = async () => {
  return await TermsModel.find().sort({ effectiveDate: -1 });
};

export const updateTerms = async (id: string, payload: Partial<ITerms>) => {
  return await TermsModel.findByIdAndUpdate(id, payload, { new: true });
};

const deleteTerms = async (id: string) => {
  return await TermsModel.findByIdAndDelete(id);
};

export const TermsService = {
  createTerms,
  getLatestTerms,
  getAllTerms,
  updateTerms,
  deleteTerms,
};
