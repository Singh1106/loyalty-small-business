import { sign } from 'jsonwebtoken';
import { transporter } from './nodemailer';

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
  return true;
};

// export const sendOtpByPhone = ({
//   phoneNumber,
//   countryCode,
// }: {
//   phoneNumber: string;
//   countryCode: string;
// }) => {};

export const sendOtpToMail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIl,
    to: email,
    subject: 'OTP for IsItBusiness By Jaswinder Singh.',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP for your login</title>
</head>
<body>
  <p>Your OTP is <strong>${otp}</strong>.</p>
  <p>It is valid for 10 minutes.</p>
</body>
</html>
`,
  };
  try {
    await transporter.sendMail(mailOptions);
    return { otp };
  } catch (error) {
    console.log(error);
  }
};
