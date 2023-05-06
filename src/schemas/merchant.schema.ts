import mongoose from 'mongoose';

export const MerchantSchema = new mongoose.Schema(
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

export type Merchant = mongoose.Document & {
  phoneNumber: string;
  countryCode: string;
  name?: string;
  tokens?: string[];
};

export const MerchantModel = mongoose.model('merchant', MerchantSchema);
