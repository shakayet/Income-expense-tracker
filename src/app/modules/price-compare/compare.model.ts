import { Schema, model } from "mongoose";
import { ICostCompare } from "./compare.interface";

const costCompareSchema = new Schema<ICostCompare>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    initialPrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    savedAmount: { type: Number, required: true },
    costType: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<ICostCompare>("CostCompare", costCompareSchema);
