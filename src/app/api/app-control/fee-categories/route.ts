import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."FeeCategory"';

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "Rank" ASC, "CategoryName" ASC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch fee categories:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(CS, `INSERT INTO ${TABLE} ("CategoryId","CategoryName","CategoryCode","Description","IconUrl","ColorHex","Status","Rank","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:name,:code,:descr,:icon,:color,:status,:rank,:createdBy,:updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, name: b.CategoryName, code: b.CategoryCode, descr: b.Description || null, icon: b.IconUrl || null,
      color: b.ColorHex || null, status: b.Status || 'Active', rank: b.Rank || 0,
      createdBy: session.user?.email || 'system', updatedBy: session.user?.email || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "CategoryId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create fee category:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    if (!b.CategoryId) return NextResponse.json({ message: 'CategoryId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { b_id: b.CategoryId };
    const map: Record<string, string> = { CategoryName:'b_name',CategoryCode:'b_code',Description:'b_desc',IconUrl:'b_icon',ColorHex:'b_color',Status:'b_status',Rank:'b_rank' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:b_updBy'); binds.b_updBy = session.user?.email || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "CategoryId"=:b_id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "CategoryId"=:b_id`, { b_id: b.CategoryId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update fee category:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { CategoryId } = await req.json();
    if (!CategoryId) return NextResponse.json({ message: 'CategoryId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "CategoryId"=:b_id`, { b_id: CategoryId });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Failed to delete fee category:", error);
    if (error.message && error.message.includes('ORA-02292')) {
      return NextResponse.json({ message: "Cannot delete this category because it is still being used by one or more fee charges. Please reassign or delete the associated fee charges first." }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
