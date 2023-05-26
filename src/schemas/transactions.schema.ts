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
    earning: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Transaction = mongoose.Document & {
  business: string;
  customer: string;
  totalAmount: number;
  amountBreakup: {
    loyalty: { amount: number };
    nonLoyalty: { amount: number; paymentMethod: NonLoyaltyPaymentMethods };
  };
  earning: number;
};

export const TransactionModel = mongoose.model(
  'transaction',
  TransactionSchema,
);
