export const deleteTerms = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TermsService.deleteTerms(id);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Terms not found' });
  }
  res.json({
    success: true,
    message: 'Terms deleted successfully',
    data: result,
  });
};
import { Request, Response } from 'express';
import { TermsService } from './service';

export const createTerms = async (req: Request, res: Response) => {
  const result = await TermsService.createTerms(req.body);
  res.status(201).json({
    success: true,
    message: 'Terms & Conditions created successfully',
    data: result,
  });
};

export const getLatestTerms = async (req: Request, res: Response) => {
  const result = await TermsService.getLatestTerms();
  res.status(200).json({
    success: true,
    message: 'Latest Terms & Conditions retrieved',
    data: result,
  });
};

export const getAllTerms = async (req: Request, res: Response) => {
  const result = await TermsService.getAllTerms();
  res.status(200).json({
    success: true,
    message: 'All Terms & Conditions retrieved',
    data: result,
  });
};

export const updateTerms = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TermsService.updateTerms(id, req.body);
  res.json({
    success: true,
    message: 'Terms updated successfully',
    data: result,
  });
};

export const TermsController = {
  createTerms,
  getLatestTerms,
  getAllTerms,
  updateTerms,
};
