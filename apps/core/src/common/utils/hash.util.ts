import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

export class HashUtil {
  private static readonly saltRounds = 10;

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate SHA-256 hash
   */
  static sha256(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate SHA-512 hash
   */
  static sha512(data: string): string {
    return createHash('sha512').update(data).digest('hex');
  }

  /**
   * Generate MD5 hash (use for non-security purposes only)
   */
  static md5(data: string): string {
    return createHash('md5').update(data).digest('hex');
  }

  /**
   * Hash data with salt
   */
  static hashWithSalt(data: string, salt: string): string {
    return createHash('sha256')
      .update(data + salt)
      .digest('hex');
  }
}
