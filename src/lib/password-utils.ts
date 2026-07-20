/**
 * Shared password security utilities for Zemen Bank Dashboard.
 *
 * - validatePasswordComplexity: enforces banking-grade password rules server-side
 * - checkPasswordHistory: prevents reuse of recent passwords
 * - recordPasswordHistory: saves current password to history before update
 */

import { db } from '@/lib/db';


/** Number of previous passwords to retain and check against. */
export const PASSWORD_HISTORY_DEPTH = 5;

export interface PasswordComplexityResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates that a password meets Zemen Bank complexity requirements:
 *   - Minimum 12 characters
 *   - At least one uppercase letter (A-Z)
 *   - At least one lowercase letter (a-z)
 *   - At least one digit (0-9)
 *   - At least one special character
 */
export function validatePasswordComplexity(password: string): PasswordComplexityResult {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required.'] };
  }

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit (0-9).');
  }
  if (!/[!@#$%^&*()\-_=+\[\]{}|;':",.<>?/\\`~]/.test(password)) {
    errors.push('Password must contain at least one special character (e.g. !@#$%^&*).');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Checks whether newPassword matches any of the user''s last N passwords.
 * Returns true if the password was recently used (should be rejected).
 */
export async function checkPasswordHistory(
  userId: number,
  newPassword: string,
  depth: number = PASSWORD_HISTORY_DEPTH
): Promise<boolean> {
  try {
    const history = await (db as any).passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: depth,
      select: { password: true },
    });
    const bcrypt = require('bcryptjs');
    return history.some((entry: { password: string }) => {
      try {
        return bcrypt.compareSync(newPassword, entry.password);
      } catch {
        return entry.password === newPassword;
      }
    });
  } catch (e) {
    console.error('[password-utils] Failed to check password history:', e);
    return false;
  }
}

/**
 * Saves oldPassword (the user''s current password before update) to PasswordHistory,
 * and trims the history to the last `depth` entries.
 */
export async function recordPasswordHistory(
  userId: number,
  oldPassword: string,
  depth: number = PASSWORD_HISTORY_DEPTH
): Promise<void> {
  try {
    await (db as any).passwordHistory.create({
      data: { userId, password: oldPassword },
    });
    const all = await (db as any).passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (all.length > depth) {
      const toDelete = all.slice(depth).map((r: { id: number }) => r.id);
      await (db as any).passwordHistory.deleteMany({
        where: { id: { in: toDelete } },
      });
    }
  } catch (e) {
    console.error('[password-utils] Failed to record password history:', e);
  }
}
