import mongoose, { HydratedDocument } from 'mongoose';

export const CustomerSchema = new mongoose.Schema({
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

export type Customer = HydratedDocument<typeof CustomerSchema>;
