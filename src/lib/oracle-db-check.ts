import { executeQuery } from './oracle-db';

/**
 * Tries to execute a query against an Oracle DB. Returns the rows if successful (isLive=true),
 * or null data (isLive=false) if the connection fails. Never throws.
 */
export async function tryOracleQuery(
  connectionString: string | undefined,
  query: string,
  binds?: Record<string, any>
): Promise<{ data: any[] | null; isLive: boolean }> {
  if (!connectionString) return { data: null, isLive: false };
  try {
    const result: any = await executeQuery(connectionString, query, binds);
    return { data: result.rows || [], isLive: true };
  } catch {
    return { data: null, isLive: false };
  }
}
