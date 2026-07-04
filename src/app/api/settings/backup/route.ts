import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const BACKUP_DIR = path.join(process.cwd(), 'public', 'backups');

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const backups = await prisma.configBackup.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(backups, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to fetch backups:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  const { label, description, backupType } = await req.json();
  const userEmail = (session as any).user?.email || 'system';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup-${timestamp}.json`;
  const filePath = `/backups/${fileName}`;
  const absolutePath = path.join(BACKUP_DIR, fileName);

  // Create in-progress record
  const record = await prisma.configBackup.create({
    data: {
      label: label || `Backup ${new Date().toLocaleDateString()}`,
      description: description || null,
      backupType: backupType || 'Full',
      database: 'PostgreSQL (dash_module)',
      status: 'InProgress',
      createdBy: userEmail,
    },
  });

  try {
    ensureBackupDir();

    // Collect data from Prisma tables
    const [users, roles, branches, departments, schools, securityPolicy, ipWhitelist, ipsbanks, ipswallets] = await Promise.all([
      prisma.user.findMany({ select: { id: true, employeeId: true, name: true, email: true, role: true, branch: true, department: true, status: true, createdAt: true } }),
      prisma.role.findMany(),
      prisma.branch.findMany(),
      prisma.department.findMany(),
      prisma.school.findMany(),
      prisma.securityPolicy.findMany(),
      prisma.ipWhitelist.findMany(),
      prisma.iPSBank.findMany(),
      prisma.iPSWallet.findMany(),
    ]);

    const snapshot = {
      meta: {
        createdAt: new Date().toISOString(),
        createdBy: userEmail,
        backupType: backupType || 'Full',
        database: 'dash_module',
        version: '1.0',
      },
      data: { users, roles, branches, departments, schools, securityPolicy, ipWhitelist, ipsbanks, ipswallets },
    };

    const content = JSON.stringify(snapshot, null, 2);
    fs.writeFileSync(absolutePath, content, 'utf8');

    const fileSizeKb = Math.round(Buffer.byteLength(content, 'utf8') / 1024);
    const checksum = crypto.createHash('sha256').update(content).digest('hex');

    const updated = await prisma.configBackup.update({
      where: { id: record.id },
      data: { status: 'Completed', filePath, fileSize: fileSizeKb, checksum },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error: any) {
    await prisma.configBackup.update({ where: { id: record.id }, data: { status: 'Failed' } });
    console.error('Backup failed:', error);
    return NextResponse.json({ message: error.message || 'Backup failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { id } = await req.json();
    const record = await prisma.configBackup.findUnique({ where: { id } });
    if (record?.filePath) {
      const abs = path.join(process.cwd(), 'public', record.filePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await prisma.configBackup.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Delete backup failed:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
