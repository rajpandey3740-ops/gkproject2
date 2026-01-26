import * as nodemailer from 'nodemailer';
import { Logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter;

  private static async initializeTransporter() {
    if (!this.transporter) {
      const emailService = process.env.EMAIL_SERVICE || 'ethereal';
      
      if (emailService === 'gmail') {
        // Using Gmail SMTP with app password (free option)
        // You'll need to enable 2FA and create an app password in Google Account settings
        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
      } else if (emailService === 'firebase') {
        // Using Firebase for authentication - emails handled by Firebase internally
        // Return early since Firebase handles email verification internally
        Logger.info('Using Firebase for authentication - email verification handled internally');
        return true;
      } else {
        // Using Ethereal.email (completely free, no setup required)
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        
        Logger.info('Ethereal.email test account created:', {
          user: testAccount.user,
          pass: testAccount.pass,
          web: testAccount.web,
        });
      }
    }
  }

  static async sendEmail(options: EmailOptions): Promise<boolean> {
    const emailService = process.env.EMAIL_SERVICE || 'ethereal';
    
    // If using Firebase, we don't need to send emails manually
    if (emailService === 'firebase') {
      Logger.info('Email service set to Firebase - skipping manual email sending');
      return true; // Return true as Firebase handles email internally
    }
    
    try {
      await this.initializeTransporter();

      const mailOptions = {
        from: `"GK Store" <${process.env.EMAIL_USER || 'noreply@gkstore.com'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      Logger.info('Email sent successfully:', info.messageId);
      
      // For Ethereal.email, you can preview the email
      if (process.env.EMAIL_SERVICE === 'ethereal') {
        Logger.info('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return true;
    } catch (error) {
      Logger.error('Email sending failed:', error);
      return false;
    }
  }

  static generateVerificationEmail(name: string, verificationCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px 40px; text-align: center; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">
                    <h1 style="color: white; margin: 0; font-size: 28px;">GK General Store</h1>
                    <p style="color: #e8f5e8; margin: 10px 0 0 0; font-size: 16px;">Welcome to our store!</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">
                      Thank you for registering with GK General Store. Please use the verification code below to complete your registration:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <div style="display: inline-block; padding: 15px 30px; background-color: #4CAF50; color: white; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
                        ${verificationCode}
                      </div>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6; font-size: 14px;">
                      This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px; background-color: #f8f9fa; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <p style="color: #888; margin: 0; font-size: 12px;">
                      © 2024 GK General Store. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  static generatePasswordResetEmail(name: string, resetCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px 40px; text-align: center; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);">
                    <h1 style="color: white; margin: 0; font-size: 28px;">GK General Store</h1>
                    <p style="color: #fff3e0; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">
                      We received a request to reset your password. Please use the verification code below to set a new password:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <div style="display: inline-block; padding: 15px 30px; background-color: #ff9800; color: white; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);">
                        ${resetCode}
                      </div>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6; font-size: 14px;">
                      This code will expire in 10 minutes. If you didn't request this password reset, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px; background-color: #f8f9fa; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <p style="color: #888; margin: 0; font-size: 12px;">
                      © 2024 GK General Store. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  static async sendVerificationEmail(email: string, name: string, verificationCode: string): Promise<boolean> {
    const html = this.generateVerificationEmail(name, verificationCode);
    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - GK General Store',
      html: html,
      text: `Hello ${name}! Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`
    });
  }

  static async sendPasswordResetEmail(email: string, name: string, resetCode: string): Promise<boolean> {
    const html = this.generatePasswordResetEmail(name, resetCode);
    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request - GK General Store',
      html: html,
      text: `Hello ${name}! Your password reset code is: ${resetCode}. This code will expire in 10 minutes.`
    });
  }
}