
'use server';

import { NextResponse } from 'next/server';
import { requireAnyPermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { db } from '@/lib/db';
import oracledb from 'oracledb';

const DB_CONN = process.env.APP_CONTROL_DB_CONNECTION_STRING;

function isSuperAdmin(session: any): boolean {
  return session?.user?.role === 'Super Admin' || session?.permissions?.includes('all');
}

async function getCallerBranch(email: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { email }, select: { role: true, branch: true } as any });
  return (user as any)?.branch ?? null;
}

async function getOracleConnection(connectionString: string | undefined) {
  if (!connectionString) throw new Error('APP_CONTROL_DB_CONNECTION_STRING is not defined');
  const userMatch = connectionString.match(/^(.*?)\//);
  const passwordMatch = connectionString.match(/\/(.*?)@/);
  const serverMatch = connectionString.match(/@(.*?)$/);
  if (!userMatch || !passwordMatch || !serverMatch) throw new Error('Invalid Oracle connection string format');
  return await oracledb.getConnection({
    user: userMatch[1],
    password: passwordMatch[1],
    connectString: serverMatch[1],
  });
}

const MEDIA_COLUMNS: Record<string, { column: string; mimeType: string }> = {
  video:     { column: '"Video"',          mimeType: 'video/mp4' },
  reference: { column: '"ReferenceImage"', mimeType: 'image/jpeg' },
  probe:     { column: '"ProbeImage"',     mimeType: 'image/jpeg' },
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAnyPermission([
    PERMISSIONS.ONLINE_LINKING_READ,
    PERMISSIONS.ONLINE_LINKING_REVIEW,
    PERMISSIONS.ONLINE_LINKING_APPROVE,
  ]);
  if (session instanceof NextResponse) return session;

  const { id } = params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || '';

  const mediaConfig = MEDIA_COLUMNS[type];
  if (!mediaConfig) {
    return NextResponse.json({ message: 'Invalid media type. Use: video, reference, probe' }, { status: 400 });
  }

  const email = session.user?.email || '';
  const callerBranch = isSuperAdmin(session) ? null : await getCallerBranch(email);

  let connection;
  try {
    connection = await getOracleConnection(DB_CONN);

    // First check branch access
    const branchCheck = await connection.execute(
      `SELECT "HomeBranch" FROM "APP_CONTROL_MODULE"."OnlineLinking" WHERE "Id" = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!branchCheck.rows || branchCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    const record = branchCheck.rows[0] as any;
    if (callerBranch && record.HomeBranch !== callerBranch) {
      return NextResponse.json({ message: 'Access denied: different branch' }, { status: 403 });
    }

    // Fetch the BLOB
    const blobQuery = `SELECT ${mediaConfig.column} AS "MediaBlob" FROM "APP_CONTROL_MODULE"."OnlineLinking" WHERE "Id" = :id`;
    const result = await connection.execute(blobQuery, { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ message: 'Media not found' }, { status: 404 });
    }

    const blobData = (result.rows[0] as any).MediaBlob;
    if (!blobData) {
      return NextResponse.json({ message: 'No media data available' }, { status: 404 });
    }

    // Convert to Buffer
    let buffer: Buffer;
    if (blobData instanceof Buffer) {
      buffer = blobData;
    } else if (blobData instanceof Uint8Array) {
      buffer = Buffer.from(blobData);
    } else if (typeof blobData === 'object' && blobData.read) {
      // It's a Lob object — read it
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        blobData.on('data', (chunk: Buffer) => chunks.push(chunk));
        blobData.on('end', () => resolve());
        blobData.on('error', (err: Error) => reject(err));
      });
      buffer = Buffer.concat(chunks);
    } else {
      return NextResponse.json({ message: 'Unsupported BLOB format' }, { status: 500 });
    }

    // Return the media with privacy headers
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': mediaConfig.mimeType,
        'Content-Length': String(buffer.length),
        'Content-Disposition': 'inline',                          // No download
        'Cache-Control': 'no-store, no-cache, must-revalidate',   // No caching
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "default-src 'self'",
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: any) {
    console.error('[OnlineLinking:media]', err);
    return NextResponse.json({ message: 'Failed to stream media' }, { status: 500 });
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
}
