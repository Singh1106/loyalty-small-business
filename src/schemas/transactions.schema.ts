import mongoose, { ObjectId } from 'mongoose';
import { NonLoyaltyPaymentMethods } from 'src/static/enums';

export const TransactionSchema = new mongoose.Schema(
  {
    business: {
      type: String, // mongoose.Schema.Types.ObjectId
      ref: 'Business',
      required: true,
    },
    customer: {
      type: String,
      ref: 'Customer',
      required: true,
    },
    totalAmount: {
      required: true,
      type: Number,
    },
    amountBreakup: {
      loyalty: {
        amount: {
          type: Number,
          required: true,
          default: 0,
        },
      },
      nonLoyalty: {
        amount: {
          type: Number,
          required: true,
          default: 0,
        },
        paymentMethod: {
          enum: NonLoyaltyPaymentMethods,
          type: String,
          reqiured: false,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

export type Transaction = mongoose.Document & {
  business: ObjectId;
  customer: string;
  totalAmount: number;
  amountBreakup: {
    loyalty: number;
    nonLoyalty: { amount: number; paymentMethod: NonLoyaltyPaymentMethods };
  };
};

export const TransactionModel = mongoose.model(
  'transaction',
  TransactionSchema,
);
