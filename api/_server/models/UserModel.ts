import mongoose, { Schema, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  isVerified: boolean;
  emailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationCode(): string;
  generateResetPasswordCode(): string;
  verifyEmailCode(code: string): boolean;
  verifyResetPasswordCode(code: string): boolean;
  clearResetPasswordCode(): void;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false, // Make email optional for phone-based auth
      unique: true,
      sparse: true, // Only enforce uniqueness when email exists
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: false, // Make phone optional to support email-only auth
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    password: {
      type: String,
      required: false, // Make password optional to support Firebase auth
      select: false, // Don't return password by default
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      required: false,
    },
    verificationCodeExpires: {
      type: Date,
      required: false,
    },
    resetPasswordCode: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate verification code
UserSchema.methods.generateVerificationCode = function(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  this.verificationCode = code;
  this.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return code;
};

// Method to generate password reset code
UserSchema.methods.generateResetPasswordCode = function(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  this.resetPasswordCode = code;
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return code;
};

// Method to verify email code
UserSchema.methods.verifyEmailCode = function(code: string): boolean {
  if (!this.verificationCode || !this.verificationCodeExpires) return false;
  if (this.verificationCodeExpires < new Date()) return false;
  if (this.verificationCode !== code) return false;
  
  this.emailVerified = true;
  this.verificationCode = undefined;
  this.verificationCodeExpires = undefined;
  return true;
};

// Method to verify password reset code
UserSchema.methods.verifyResetPasswordCode = function(code: string): boolean {
  if (!this.resetPasswordCode || !this.resetPasswordExpires) return false;
  if (this.resetPasswordExpires < new Date()) return false;
  if (this.resetPasswordCode !== code) return false;
  
  return true;
};

// Method to clear reset password code after use
UserSchema.methods.clearResetPasswordCode = function(): void {
  this.resetPasswordCode = undefined;
  this.resetPasswordExpires = undefined;
};



// Export model with check for existing model to avoid re-definition error in Vercel
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

