import { Logger } from '../utils/logger';
import twilio from 'twilio';

interface OTPData {
  otp: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<string, OTPData>();

// OTP expiration time (10 minutes)
const OTP_EXPIRY_TIME = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 3;

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const SMS_ENABLED = process.env.SMS_ENABLED === 'true' || process.env.SMS_ENABLED === '1';

// Initialize Twilio client if credentials are available
let twilioClient: twilio.Twilio | null = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && SMS_ENABLED) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  Logger.info('✅ Twilio SMS service initialized');
} else {
  Logger.warn('⚠️  Twilio SMS not configured. OTPs will be logged to console only.');
  Logger.warn('   Set SMS_ENABLED=true and provide TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
}

export class OTPService {
  /**
   * Generate a 6-digit OTP
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP for a phone number
   */
  static storeOTP(phone: string, otp: string): void {
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_TIME,
      attempts: 0,
    });

    // Clean up expired OTPs
    setTimeout(() => {
      otpStore.delete(phone);
    }, OTP_EXPIRY_TIME);

    Logger.info(`OTP stored for ${phone} (expires in 10 minutes)`);
  }

  /**
   * Verify OTP
   */
  static verifyOTP(phone: string, otp: string): {
    valid: boolean;
    message: string;
  } {
    const otpData = otpStore.get(phone);

    if (!otpData) {
      return {
        valid: false,
        message: 'OTP not found or expired. Please request a new OTP.',
      };
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(phone);
      return {
        valid: false,
        message: 'OTP has expired. Please request a new OTP.',
      };
    }

    if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
      otpStore.delete(phone);
      return {
        valid: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.',
      };
    }

    otpData.attempts += 1;

    if (otpData.otp !== otp) {
      return {
        valid: false,
        message: `Invalid OTP. ${MAX_OTP_ATTEMPTS - otpData.attempts + 1} attempts remaining.`,
      };
    }

    // OTP is valid, remove it
    otpStore.delete(phone);
    return {
      valid: true,
      message: 'OTP verified successfully.',
    };
  }

  /**
   * Format phone number for international SMS (adds country code)
   * Assumes Indian numbers (+91) if not provided
   */
  static formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If already has country code (starts with + or has 11+ digits), return as is
    if (cleaned.length > 10) {
      return `+${cleaned}`;
    }
    
    // For 10-digit Indian numbers, add +91
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    return phone;
  }

  /**
   * Send OTP via SMS using Twilio
   */
  static async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const message = `Your GK General Store OTP is ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;

      // If Twilio is configured and enabled, send real SMS
      if (twilioClient && TWILIO_PHONE_NUMBER && SMS_ENABLED) {
        try {
          const messageResponse = await twilioClient.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: formattedPhone,
          });

          Logger.info(`✅ SMS sent successfully to ${formattedPhone}`);
          Logger.info(`   Message SID: ${messageResponse.sid}`);
          Logger.info(`   Status: ${messageResponse.status}`);
          
          return true;
        } catch (twilioError: any) {
          Logger.error('❌ Twilio SMS sending failed:', twilioError.message);
          Logger.error('   Error code:', twilioError.code);
          
          // Log the OTP in console as fallback
          Logger.warn(`📱 OTP for ${phone}: ${otp} (SMS failed, check console)`);
          
          // Return true anyway so user can still verify (OTP is logged)
          // In production, you might want to return false here
          return true;
        }
      } else {
        // Development mode: Just log to console
        Logger.info(`📱 OTP for ${phone}: ${otp}`);
        Logger.info(`   Formatted: ${formattedPhone}`);
        Logger.warn(`⚠️  SMS not enabled. OTP logged to console only.`);
        Logger.warn(`   To enable SMS: Set SMS_ENABLED=true in .env file`);
        
        // Simulate sending delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        return true;
      }
    } catch (error: any) {
      Logger.error('Error sending OTP:', error);
      // Log OTP as fallback
      Logger.warn(`📱 OTP for ${phone}: ${otp} (Error occurred, check console)`);
      return true; // Return true so user can still verify
    }
  }

  /**
   * Request OTP for signup/login
   */
  static async requestOTP(phone: string): Promise<{
    success: boolean;
    message: string;
    otp?: string; // Only return in development when SMS is disabled
  }> {
    // Validate phone number format
    if (!/^[0-9]{10}$/.test(phone)) {
      return {
        success: false,
        message: 'Please provide a valid 10-digit phone number',
      };
    }

    const otp = this.generateOTP();
    this.storeOTP(phone, otp);

    const sent = await this.sendOTP(phone, otp);

    if (!sent) {
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
      };
    }

    // In development mode (when SMS is disabled), return OTP for testing
    const isDevelopment = !SMS_ENABLED || process.env.NODE_ENV !== 'production';
    
    return {
      success: true,
      message: SMS_ENABLED 
        ? `OTP sent to ${phone}. Please check your SMS.` 
        : `OTP sent to ${phone}. ${isDevelopment ? `(Development mode - OTP: ${otp})` : ''}`,
      ...(isDevelopment && !SMS_ENABLED && { otp }), // Only return OTP if SMS is disabled
    };
  }

  /**
   * Clean up expired OTPs
   */
  static cleanupExpiredOTPs(): void {
    const now = Date.now();
    otpStore.forEach((data, phone) => {
      if (now > data.expiresAt) {
        otpStore.delete(phone);
      }
    });
  }
}

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  OTPService.cleanupExpiredOTPs();
}, 5 * 60 * 1000);
