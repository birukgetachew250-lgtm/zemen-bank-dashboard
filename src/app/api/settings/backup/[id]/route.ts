import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// GET /api/settings/backup/[id] — Download backup file
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const record = await prisma.configBackup.findUnique({ where: { id: params.id } });
    if (!record || !record.filePath) return NextResponse.json({ message: 'Backup file not found' }, { status: 404 });

    const absolutePath = path.join(process.cwd(), 'public', record.filePath);
    if (!fs.existsSync(absolutePath)) return NextResponse.json({ message: 'Backup file missing from disk' }, { status: 404 });

    const content = fs.readFileSync(absolutePath, 'utf8');
    const fileName = path.basename(absolutePath);

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/settings/backup/[id] — Restore from backup
export async function PUT(_req: Request, { params }: { params: { id: string } }) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const record = await prisma.configBackup.findUnique({ where: { id: params.id } });
    if (!record || !record.filePath) return NextResponse.json({ message: 'Backup not found' }, { status: 404 });

    const absolutePath = path.join(process.cwd(), 'public', record.filePath);
    if (!fs.existsSync(absolutePath)) return NextResponse.json({ message: 'Backup file missing' }, { status: 404 });

    const snapshot = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    const { data } = snapshot;

    // Restore roles (upsert by name)
    if (data.roles) {
      for (const role of data.roles) {
        await prisma.role.upsert({ where: { name: role.name }, update: role, create: role }).catch(() => {});
      }
    }

    // Restore IP whitelist
    if (data.ipWhitelist) {
      for (const ip of data.ipWhitelist) {
        await prisma.ipWhitelist.upsert({ where: { cidr: ip.cidr }, update: ip, create: ip }).catch(() => {});
      }
    }

    // Restore schools
    if (data.schools) {
      for (const school of data.schools) {
        await prisma.school.upsert({ where: { schoolExternalId: school.schoolExternalId }, update: school, create: school }).catch(() => {});
      }
    }

    // Mark backup as restored
    await prisma.configBackup.update({
      where: { id: params.id },
      data: { restoredAt: new Date(), restoredBy: (session as any).user?.email || 'system' },
    });

    return NextResponse.json({ message: 'Restore completed successfully', restoredAt: new Date() });
  } catch (error: any) {
    console.error('Restore failed:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
