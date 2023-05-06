import { sign } from 'jsonwebtoken';

export const generateJWT = (data: any, expiry: string): string => {
  const token = sign(data, process.env.JWT_SECRET, {
    expiresIn: expiry,
  });
  return token;
};

export const generateOtp = (length: number): string => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
};

export const validateOtp = (
  dbOtp: string,
  expiry: string,
  userOtp: string,
): boolean => {
  if (dbOtp != userOtp) {
    return false;
  }
  const now = new Date();
  if (new Date(expiry) < now) {
    return false;
  }
  console.log(dbOtp, userOtp);
  return true;
};

// export const sendOtpByPhone = ({
//   phoneNumber,
//   countryCode,
// }: {
//   phoneNumber: string;
//   countryCode: string;
// }) => {};
