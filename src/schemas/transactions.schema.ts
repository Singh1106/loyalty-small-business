import mongoose from 'mongoose';
import { NonLoyaltyPaymentMethods } from 'src/static/enums';

export const TransactionSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
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
          type: NonLoyaltyPaymentMethods,
          reqiured: false,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);
