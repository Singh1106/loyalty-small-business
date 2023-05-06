import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class CommonUtilsService {
  constructor(private readonly mailerService: MailerService) {}

  sendOtpToMail(to: string, otp: string) {
    return this.mailerService.sendMail({
      from: process.env.SENDER_EMAIl,
      to,
      subject: 'OTP for Loyalty 4 ABC',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP to continue</title>
</head>
<body>
  <p>Your OTP is <strong>${otp}</strong>.</p>
  <p>It is valid for 10 minutes.</p>
</body>
</html>
`,
    });
  }
}
