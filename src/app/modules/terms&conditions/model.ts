import { Schema, model } from "mongoose";
import { ITerms } from "./interface";

const termsSchema = new Schema<ITerms>(
  {
    content: { type: String, required: true },
    version: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const TermsModel = model<ITerms>("Terms", termsSchema);
