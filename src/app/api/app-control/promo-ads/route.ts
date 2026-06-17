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
    await executeQuery(CS, `INSERT INTO ${TABLE} ("Id","Title","Subtitle","PageNumber","Description","TargetUrl","ImageUrl","ThumbnailUrl","DisplayOrder","AdType","StartDate","EndDate","Status","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:title,:subtitle,:page,:descr,:target,:image,:thumb,:order,:adType,:startDate,:endDate,:status,:createdBy,:updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, title: b.Title, subtitle: b.Subtitle || null, page: b.PageNumber, descr: b.Description || null,
      target: b.TargetUrl || null, image: b.ImageUrl || null, thumb: b.ThumbnailUrl || null,
      order: b.DisplayOrder || 0, adType: b.AdType || null,
      startDate: b.StartDate ? new Date(b.StartDate) : null, endDate: b.EndDate ? new Date(b.EndDate) : null,
      status: b.Status || 'Active', createdBy: session.user?.email || 'system', updatedBy: session.user?.email || 'system'
    });
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
    const map: Record<string, string> = { Title:'title',Subtitle:'subtitle',PageNumber:'page',Description:'desc',TargetUrl:'target',ImageUrl:'image',ThumbnailUrl:'thumb',DisplayOrder:'order',AdType:'adType',Status:'status' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    if (b.StartDate !== undefined) { fields.push('"StartDate"=:startDate'); binds.startDate = b.StartDate ? new Date(b.StartDate) : null; }
    if (b.EndDate !== undefined) { fields.push('"EndDate"=:endDate'); binds.endDate = b.EndDate ? new Date(b.EndDate) : null; }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = session.user?.email || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Id"=:id`, binds);
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
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete promo ad:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
