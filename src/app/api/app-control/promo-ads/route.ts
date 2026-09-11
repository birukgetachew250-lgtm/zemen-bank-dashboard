import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."PromoAd"';

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "DisplayOrder" ASC, "CreatedAt" DESC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch promo ads:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(CS, `INSERT INTO ${TABLE} ("Id","Title","Subtitle","PageNumber","Description","TargetUrl","ImageUrl","ThumbnailUrl","DisplayOrder","AdType","IsIFB","StartDate","EndDate","Status","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:b_title,:b_subtitle,:b_page,:b_desc,:b_target,:b_image,:b_thumb,:b_order,:b_adType,:b_isIfb,:b_startDate,:b_endDate,:b_status,:b_createdBy,:b_updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, b_title: b.Title, b_subtitle: b.Subtitle || null, b_page: b.PageNumber, b_desc: b.Description || null,
      b_target: b.TargetUrl || null, b_image: b.ImageUrl || null, b_thumb: b.ThumbnailUrl || null,
      b_order: b.DisplayOrder || 0, b_adType: b.AdType || null, b_isIfb: b.IsIFB ? 1 : 0,
      b_startDate: b.StartDate ? new Date(b.StartDate) : null, b_endDate: b.EndDate ? new Date(b.EndDate) : null,
      b_status: b.Status || 'Active', b_createdBy: session.user?.email || 'system', b_updatedBy: session.user?.email || 'system'
    });
    await executeQuery(CS, 'COMMIT');
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create promo ad:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    if (!b.Id) return NextResponse.json({ message: 'Id required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.Id };
    const map: Record<string, string> = { Title:'b_title',Subtitle:'b_subtitle',PageNumber:'b_page',Description:'b_desc',TargetUrl:'b_target',ImageUrl:'b_image',ThumbnailUrl:'b_thumb',DisplayOrder:'b_order',AdType:'b_adType',Status:'b_status' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    if (b.IsIFB !== undefined) { fields.push('"IsIFB"=:b_isIfb'); binds.b_isIfb = b.IsIFB ? 1 : 0; }
    if (b.StartDate !== undefined) { fields.push('"StartDate"=:b_startDate'); binds.b_startDate = b.StartDate ? new Date(b.StartDate) : null; }
    if (b.EndDate !== undefined) { fields.push('"EndDate"=:b_endDate'); binds.b_endDate = b.EndDate ? new Date(b.EndDate) : null; }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:b_updatedBy'); binds.b_updatedBy = session.user?.email || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Id"=:id`, binds);
    await executeQuery(CS, 'COMMIT');
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id: b.Id });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update promo ad:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { Id } = await req.json();
    if (!Id) return NextResponse.json({ message: 'Id required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "Id"=:id`, { id: Id });
    await executeQuery(CS, 'COMMIT');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete promo ad:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
