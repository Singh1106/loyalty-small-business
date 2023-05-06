import mongoose from 'mongoose';

export const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  },
  earningPercentage: {
    required: true,
    type: Number,
  },
});
