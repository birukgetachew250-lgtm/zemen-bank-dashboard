import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';


const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."PrivacyPolicy"';

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "DisplayOrder" ASC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch privacy policies:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(CS, `INSERT INTO ${TABLE} ("PolicyId","SectionCode","SectionHeader","SectionSummary","SectionContent","IconName","DisplayOrder","Version","EffectiveDate","LastUpdated","Status","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:b_code,:b_header,:b_summary,:b_content,:b_icon,:b_order,:b_ver,:b_effDate,:b_lastUpd,:b_status,:b_createdBy,:b_updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, b_code: b.SectionCode, b_header: b.SectionHeader, b_summary: b.SectionSummary || null, b_content: b.SectionContent,
      b_icon: b.IconName || null, b_order: b.DisplayOrder || 0, b_ver: b.Version || null,
      b_effDate: b.EffectiveDate ? new Date(b.EffectiveDate) : null, b_lastUpd: new Date(),
      b_status: b.Status || 'Active', b_createdBy: session.user?.email || 'system', b_updatedBy: session.user?.email || 'system'
    });
    await executeQuery(CS, 'COMMIT');
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "PolicyId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create privacy policy:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    if (!b.PolicyId) return NextResponse.json({ message: 'PolicyId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.PolicyId };
    const map: Record<string, string> = { SectionCode:'b_code',SectionHeader:'b_header',SectionSummary:'b_summary',SectionContent:'b_content',IconName:'b_icon',DisplayOrder:'b_order',Version:'b_ver',Status:'b_status' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    if (b.EffectiveDate !== undefined) { fields.push('"EffectiveDate"=:b_effDate'); binds.b_effDate = b.EffectiveDate ? new Date(b.EffectiveDate) : null; }
    fields.push('"LastUpdated"=CURRENT_TIMESTAMP'); fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:b_updBy'); binds.b_updBy = session.user?.email || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "PolicyId"=:id`, binds);
    await executeQuery(CS, 'COMMIT');
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "PolicyId"=:id`, { id: b.PolicyId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update privacy policy:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { PolicyId } = await req.json();
    if (!PolicyId) return NextResponse.json({ message: 'PolicyId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "PolicyId"=:id`, { id: PolicyId });
    await executeQuery(CS, 'COMMIT');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete privacy policy:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
