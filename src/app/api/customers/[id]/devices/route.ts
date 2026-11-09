import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_READ);
  if (session instanceof NextResponse) return session;

  const rawId = params.id || '';
  const cif = rawId.startsWith('user_') ? rawId.split('_')[1] : rawId;

  const connStr = process.env.DEVICE_CONTROL_MODULE_DB_CONNECTION_STRING;
  if (!connStr) {
    return NextResponse.json({
      cif,
      devices: [],
      source: 'unconfigured',
    });
  }

  const pluralQuery = `
    SELECT
      d."Id"               AS "Id",
      d."Cif"              AS "Cif",
      d."DeviceId"         AS "DeviceId",
      d."DeviceName"       AS "DeviceName",
      d."DeviceModel"      AS "DeviceModel",
      d."DeviceOs"         AS "DeviceOs",
      d."DeviceOsVersion"  AS "DeviceOsVersion",
      d."DeviceType"       AS "DeviceType",
      d."AppVersion"       AS "AppVersion",
      d."Status"           AS "Status",
      d."LastSeenAt"       AS "LastSeenAt",
      d."CreatedAt"        AS "CreatedAt",
      nt."Provider"        AS "PushProvider",
      nt."Status"          AS "PushStatus",
      nt."LastRefreshedAt" AS "TokenLastRefreshedAt"
    FROM "DEVICE_CONTROL_MODULE"."CustomerDevices" d
    LEFT JOIN "DEVICE_CONTROL_MODULE"."NotificationTokens" nt
      ON nt."CustomerDeviceId" = d."Id"
    WHERE d."Cif" = :cif
    ORDER BY d."LastSeenAt" DESC NULLS LAST, d."CreatedAt" DESC NULLS LAST
  `;

  const singularQuery = `
    SELECT
      d."Id"               AS "Id",
      d."Cif"              AS "Cif",
      d."DeviceId"         AS "DeviceId",
      d."DeviceName"       AS "DeviceName",
      d."DeviceModel"      AS "DeviceModel",
      d."DeviceOs"         AS "DeviceOs",
      d."DeviceOsVersion"  AS "DeviceOsVersion",
      d."DeviceType"       AS "DeviceType",
      d."AppVersion"       AS "AppVersion",
      d."Status"           AS "Status",
      d."LastSeenAt"       AS "LastSeenAt",
      d."CreatedAt"        AS "CreatedAt",
      nt."Provider"        AS "PushProvider",
      nt."Status"          AS "PushStatus",
      nt."LastRefreshedAt" AS "TokenLastRefreshedAt"
    FROM "DEVICE_CONTROL_MODULE"."CustomerDevice" d
    LEFT JOIN "DEVICE_CONTROL_MODULE"."NotificationToken" nt
      ON nt."CustomerDeviceId" = d."Id"
    WHERE d."Cif" = :cif
    ORDER BY d."LastSeenAt" DESC NULLS LAST, d."CreatedAt" DESC NULLS LAST
  `;

  try {
    let result: any;
    try {
      result = await executeQuery(connStr, pluralQuery, { cif });
    } catch (firstErr: any) {
      if (String(firstErr?.message || '').includes('ORA-00942')) {
        result = await executeQuery(connStr, singularQuery, { cif });
      } else {
        throw firstErr;
      }
    }

    const devices = (result?.rows || []).map((row: any) => ({
      id: row.Id,
      cif: row.Cif || cif,
      deviceId: row.DeviceId || '—',
      deviceName: row.DeviceName || '',
      deviceModel: row.DeviceModel || '',
      deviceNameAndModel:
        [row.DeviceName, row.DeviceModel].filter(Boolean).join(' / ') || 'Unknown Device',
      deviceOs: row.DeviceOs || '',
      deviceOsVersion: row.DeviceOsVersion || '',
      platformOs:
        [row.DeviceOs, row.DeviceOsVersion].filter(Boolean).join(' ') || 'Unknown OS',
      deviceType: row.DeviceType || 'Mobile',
      appVersion: row.AppVersion || '—',
      status: row.Status || 'Active',
      lastSeenAt:
        row.LastSeenAt instanceof Date
          ? row.LastSeenAt.toISOString()
          : row.LastSeenAt || null,
      pushProvider: row.PushProvider || 'FCM',
      pushNotificationStatus: row.PushStatus || 'Inactive',
      tokenLastRefreshedAt:
        row.TokenLastRefreshedAt instanceof Date
          ? row.TokenLastRefreshedAt.toISOString()
          : row.TokenLastRefreshedAt || null,
    }));

    return NextResponse.json({
      cif,
      devices,
      source: 'oracle',
    });
  } catch (error: any) {
    console.error(
      `[CustomerDevices API] Failed to query DEVICE_CONTROL_MODULE for CIF ${cif}:`,
      error?.message || error
    );
    return NextResponse.json({
      cif,
      devices: [],
      source: 'error',
      error: 'Unable to reach DEVICE_CONTROL_MODULE database',
    });
  }
}
