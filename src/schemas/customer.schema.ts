import mongoose from 'mongoose';

export const CustomerSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    name: {
      required: false,
      type: String,
    },
    businessesEarning: [
      {
        id: {
          required: true,
          type: String,
        },
        loyalty: {
          required: true,
          type: Number,
        },
      },
    ],
    tokens: [
      {
        type: String,
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export type Customer = mongoose.Document & {
  phoneNumber: string;
  countryCode: string;
  name?: string;
  businessesEarning: { id: string; loyalty: number }[];
  tokens?: string[];
};

export const CustomerModel = mongoose.model('customer', CustomerSchema);
