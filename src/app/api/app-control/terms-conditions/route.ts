import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';


const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."TermsCondition"';

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "DisplayOrder" ASC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch terms conditions:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(CS, `INSERT INTO ${TABLE} ("TermId","SectionCode","SectionHeader","SectionSummary","SectionContent","IconName","DisplayOrder","Version","EffectiveDate","LastUpdated","RequiresAcceptance","Status","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:code,:header,:summary,:content,:icon,:order,:ver,:effDate,:lastUpd,:reqAccept,:status,:createdBy,:updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, code: b.SectionCode, header: b.SectionHeader, summary: b.SectionSummary || null, content: b.SectionContent,
      icon: b.IconName || null, order: b.DisplayOrder || 0, ver: b.Version || null,
      effDate: b.EffectiveDate ? new Date(b.EffectiveDate) : null, lastUpd: new Date(),
      reqAccept: b.RequiresAcceptance ? 1 : 0, status: b.Status || 'Active',
      createdBy: session.user?.email || 'system', updatedBy: session.user?.email || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "TermId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create terms condition:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    if (!b.TermId) return NextResponse.json({ message: 'TermId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.TermId };
    const map: Record<string, string> = { SectionCode:'code',SectionHeader:'header',SectionSummary:'summary',SectionContent:'content',IconName:'icon',DisplayOrder:'order',Version:'ver',Status:'status' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    if (b.EffectiveDate !== undefined) { fields.push('"EffectiveDate"=:effDate'); binds.effDate = b.EffectiveDate ? new Date(b.EffectiveDate) : null; }
    if (b.RequiresAcceptance !== undefined) { fields.push('"RequiresAcceptance"=:reqAccept'); binds.reqAccept = b.RequiresAcceptance ? 1 : 0; }
    fields.push('"LastUpdated"=CURRENT_TIMESTAMP'); fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = session.user?.email || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "TermId"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "TermId"=:id`, { id: b.TermId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update terms condition:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { TermId } = await req.json();
    if (!TermId) return NextResponse.json({ message: 'TermId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "TermId"=:id`, { id: TermId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete terms condition:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
