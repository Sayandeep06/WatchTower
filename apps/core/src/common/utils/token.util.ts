import { randomBytes } from 'crypto';

export class TokenUtil {
  /**
   * Generate a random token with specified length
   */
  static generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a URL-safe token
   */
  static generateUrlSafeToken(length: number = 32): string {
    return randomBytes(length).toString('base64url');
  }

  /**
   * Generate a numeric OTP code
   */
  static generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      otp += digits[randomIndex];
    }

    return otp;
  }

  /**
   * Generate an alphanumeric code
   */
  static generateAlphanumericCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    const randomValues = randomBytes(length);
    for (let i = 0; i < length; i++) {
      code += chars[randomValues[i] % chars.length];
    }

    return code;
  }

  /**
   * Generate a verification token (email/phone verification)
   */
  static generateVerificationToken(): string {
    return this.generateToken(32);
  }

  /**
   * Generate a password reset token
   */
  static generatePasswordResetToken(): string {
    return this.generateToken(32);
  }

  /**
   * Check if a token is expired
   */
  static isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Calculate token expiry date
   */
  static getTokenExpiry(hours: number = 24): Date {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + hours);
    return expiryDate;
  }
}
