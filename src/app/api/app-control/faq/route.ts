import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."Faq"';

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "DisplayOrder" ASC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch FAQ:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(CS, `INSERT INTO ${TABLE} ("FaqId","Question","Answer","Category","DisplayOrder","Status","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:b_question,:b_answer,:b_category,:b_order,:b_status,:b_createdBy,:b_updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, b_question: b.Question, b_answer: b.Answer, b_category: b.Category || 'General',
      b_order: b.DisplayOrder || 0, b_status: b.Status || 'Active',
      b_createdBy: session.user?.email || 'system', b_updatedBy: session.user?.email || 'system'
    });
    await executeQuery(CS, 'COMMIT');
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "FaqId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    if (!b.FaqId) return NextResponse.json({ message: 'FaqId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.FaqId };
    const map: Record<string, string> = { Question:'b_question',Answer:'b_answer',Category:'b_category',DisplayOrder:'b_order',Status:'b_status' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:b_updBy'); binds.b_updBy = session.user?.email || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "FaqId"=:id`, binds);
    await executeQuery(CS, 'COMMIT');
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "FaqId"=:id`, { id: b.FaqId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update FAQ:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { FaqId } = await req.json();
    if (!FaqId) return NextResponse.json({ message: 'FaqId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "FaqId"=:id`, { id: FaqId });
    await executeQuery(CS, 'COMMIT');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
