import mongoose from 'mongoose';
import { UserTypes } from 'src/static/enums';

export const OtpSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      required: true,
      enum: UserTypes,
    },
    refId: {
      type: String,
      required: true,
    },
    otp: {
      required: true,
      type: String,
    },
    expiry: {
      required: true,
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export type Otp = mongoose.Document & {
  userType: UserTypes;
  refId: string;
  otp: string;
  expiry: string;
};

export const OtpModel = mongoose.model('otp', OtpSchema);
