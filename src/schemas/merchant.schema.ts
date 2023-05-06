import mongoose from 'mongoose';

export const MerchantSchema = new mongoose.Schema({
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
});
