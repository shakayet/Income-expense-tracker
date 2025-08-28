import { Schema } from "mongoose";

export type ICostCompare = {
  user: Schema.Types.ObjectId;
  initialPrice: number;
  finalPrice: number;
  savedAmount: number;
  costType: string; // e.g., Food, Shopping, Transport
}

