import oracledb from 'oracledb';

let initialized = false;

export function initOracleThickMode() {
    if (initialized) return;
    
    try {
        // Pointing exactly to the Instant Client you installed via yum
        oracledb.initOracleClient({ libDir: '/usr/lib/oracle/21/client64/lib' });
        console.log('[Oracle DB] Thick mode enabled (Oracle Client libraries loaded synchronously)');
    } catch (err: any) {
        if (err.message?.includes('NJS-077') || err.message?.includes('already been called')) {
            // Already initialized — safe to ignore
        } else if (err.message?.includes('NJS-118')) {
            console.error('[Oracle DB] FATAL RACE CONDITION: Thin mode started before Thick mode!');
        } else {
            console.error('[Oracle DB] Could not enable Thick mode:', err.message);
        }
    }
    initialized = true;
}

// Auto-run immediately when this file is imported
initOracleThickMode();
