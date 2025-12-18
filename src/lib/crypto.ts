
import crypto from 'crypto';
import config from './config';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

if (!config.security.encryptionMasterKey) {
    throw new Error('ENCRYPTION_MASTER_KEY must be set.');
}

// Decode the master key from base64
const masterKey = Buffer.from(config.security.encryptionMasterKey, 'base64');

if (masterKey.length !== 32) {
    throw new Error('Decoded ENCRYPTION_MASTER_KEY must be 32 bytes (256 bits).');
}


/**
 * Encrypts a string using AES-256-CBC.
 * The IV is prepended to the encrypted data, and the result is Base64 encoded.
 * @param value The string to encrypt.
 * @returns The Base64 encoded encrypted string.
 */
export function encrypt(value: string): string | null {
    try {
        if (!value) return null;

        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);
        
        let encrypted = cipher.update(value, 'utf8', 'binary');
        encrypted += cipher.final('binary');

        const result = Buffer.concat([iv, Buffer.from(encrypted, 'binary')]);
        
        return result.toString('base64');
    } catch (error) {
        console.error("Encryption failed.", error);
        // In a real application, you'd want more robust error handling/logging
        throw new crypto.CryptoError("Encryption failed.");
    }
}

/**
 * Decrypts a string that was encrypted with the encrypt function.
 * It expects a Base64 string where the first 16 bytes are the IV.
 * @param value The Base64 encoded encrypted string.
 * @returns The decrypted string.
 */
export function decrypt(value: string): string | null {
    try {
        if (!value) return null;

        const encryptedData = Buffer.from(value, 'base64');
        
        const iv = encryptedData.subarray(0, IV_LENGTH);
        const cipherText = encryptedData.subarray(IV_LENGTH);

        const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);
        
        let decrypted = decipher.update(cipherText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString('utf8');
    } catch (error) {
        console.error("Decryption failed for value:", value, error);
        // Return the original value if decryption fails, or handle as needed
        return value;
    }
}
