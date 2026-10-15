import accountClassesJson from '@/data/account-classes.json';

/**
 * Account Class to Description dictionary loaded directly from JSON.
 * High performance, zero runtime I/O, bundled at compile time.
 */
export const ACCOUNT_CLASS_MAP: Record<string, string> = accountClassesJson;

/**
 * Returns the descriptive AC_DESC for any ACCOUNT_CLASS.
 * Instant O(1) in-memory lookup.
 *
 * @param accountClass Short account class code (e.g. 'SPRI', 'CPRI', 'LOAN')
 * @param fallback Optional fallback description if not found (defaults to accountClass itself)
 */
export function getAccountClassDescription(
  accountClass: string | null | undefined,
  fallback?: string
): string {
  if (!accountClass) {
    return fallback || '';
  }

  const code = accountClass.trim().toUpperCase();

  if (ACCOUNT_CLASS_MAP[code]) {
    return ACCOUNT_CLASS_MAP[code];
  }

  return fallback !== undefined ? fallback : accountClass;
}
