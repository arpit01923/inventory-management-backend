import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter = nodemailer.createTransport({
        service: 'Gmail', // or 'Outlook', 'Yahoo', etc.
        auth: {
            user: process.env.EMAIL_USER || 'arpit00.02kumar@gmail.com',
            pass: process.env.EMAIL_PASS || 'cvbkudlunzwmyysq',
        },
    });

    async sendResetPasswordEmail(email: string, resetToken: string) {
        const resetUrl = `http://localhost:4200/auth/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Password',
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
        };

        await this.transporter.sendMail(mailOptions);
    }
}
