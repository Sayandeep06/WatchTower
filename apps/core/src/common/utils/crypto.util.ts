import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class CryptoUtil {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly keyLength = 32;
  private static readonly ivLength = 16;
  private static readonly saltLength = 64;
  private static readonly tagLength = 16;

  /**
   * Encrypt data using AES-256-GCM
   */
  static async encrypt(text: string, password: string): Promise<string> {
    const salt = randomBytes(this.saltLength);
    const iv = randomBytes(this.ivLength);

    const key = (await scryptAsync(password, salt, this.keyLength)) as Buffer;
    const cipher = createCipheriv(this.algorithm, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([salt, iv, tag, encrypted]);
    return result.toString('base64');
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    const buffer = Buffer.from(encryptedData, 'base64');

    const salt = buffer.subarray(0, this.saltLength);
    const iv = buffer.subarray(this.saltLength, this.saltLength + this.ivLength);
    const tag = buffer.subarray(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength,
    );
    const encrypted = buffer.subarray(this.saltLength + this.ivLength + this.tagLength);

    const key = (await scryptAsync(password, salt, this.keyLength)) as Buffer;
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  /**
   * Generate a random token
   */
  static generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a cryptographically secure random string
   */
  static generateSecureRandom(length: number = 16): string {
    return randomBytes(length).toString('base64url');
  }
}
