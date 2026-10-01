export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const oracledb = await import('oracledb');
    try {
      // Force Thick mode initialization before ANY routes or Next.js modules load
      oracledb.default.initOracleClient({ libDir: '/usr/lib/oracle/21/client64/lib' });
      console.log('===========================================================');
      console.log('[Oracle DB] SUCCESS: Thick mode registered in instrumentation');
      console.log('===========================================================');
    } catch (err: any) {
      if (err.message?.includes('NJS-077') || err.message?.includes('already been called')) {
        // Safe to ignore, already initialized
      } else {
        console.error('[Oracle DB] FATAL: Instrumentation Thick mode failed:', err.message);
      }
    }
  }
}