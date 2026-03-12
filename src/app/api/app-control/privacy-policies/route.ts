import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."PrivacyPolicy"';

export async function GET() {
  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "DisplayOrder" ASC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch privacy policies:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(CS, `INSERT INTO ${TABLE} ("PolicyId","SectionCode","SectionHeader","SectionSummary","SectionContent","IconName","DisplayOrder","Version","EffectiveDate","LastUpdated","Status","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:code,:header,:summary,:content,:icon,:order,:ver,:effDate,:lastUpd,:status,:createdBy,:updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, code: b.SectionCode, header: b.SectionHeader, summary: b.SectionSummary || null, content: b.SectionContent,
      icon: b.IconName || null, order: b.DisplayOrder || 0, ver: b.Version || null,
      effDate: b.EffectiveDate ? new Date(b.EffectiveDate) : null, lastUpd: new Date(),
      status: b.Status || 'Active', createdBy: b.CreatedBy || 'system', updatedBy: b.UpdatedBy || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "PolicyId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create privacy policy:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.PolicyId) return NextResponse.json({ message: 'PolicyId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.PolicyId };
    const map: Record<string, string> = { SectionCode:'code',SectionHeader:'header',SectionSummary:'summary',SectionContent:'content',IconName:'icon',DisplayOrder:'order',Version:'ver',Status:'status' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    if (b.EffectiveDate !== undefined) { fields.push('"EffectiveDate"=:effDate'); binds.effDate = b.EffectiveDate ? new Date(b.EffectiveDate) : null; }
    fields.push('"LastUpdated"=CURRENT_TIMESTAMP'); fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = b.UpdatedBy || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "PolicyId"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "PolicyId"=:id`, { id: b.PolicyId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update privacy policy:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { PolicyId } = await req.json();
    if (!PolicyId) return NextResponse.json({ message: 'PolicyId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "PolicyId"=:id`, { id: PolicyId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete privacy policy:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
