import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."MiniApp"';

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const query = `SELECT m.*, c."Name" AS "CategoryName" FROM ${TABLE} m LEFT JOIN "APP_CONTROL_MODULE"."MiniAppCategory" c ON m."CategoryId"=c."Id" ORDER BY m."Rank" ASC, m."Name" ASC`;
    const result: any = await executeQuery(CS, query);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch mini apps:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(CS, `INSERT INTO ${TABLE} ("Id","Name","Url","LogoUrl","Username","Password","EncryptionKey","HoldingAccount","Status","ThemeColor","Rank","CategoryId","UniqueName","Description","RequiresCamera","RequiresLocation","RequiresFileAccess","CreatedAt","UpdatedAt") VALUES (:id,:b_name,:b_url,:b_logo,:b_user,:b_pass,:b_encKey,:b_holdAcc,:b_status,:b_theme,:b_rank,:b_catId,:b_uniqueName,:b_desc,:b_cam,:b_loc,:b_file,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, b_name: b.Name, b_url: b.Url, b_logo: b.LogoUrl, b_user: b.Username, b_pass: b.Password, b_encKey: b.EncryptionKey,
      b_holdAcc: b.HoldingAccount || '', b_status: b.Status || 'Active', b_theme: b.ThemeColor || '#808080', b_rank: b.Rank || 0,
      b_catId: b.CategoryId || null, b_uniqueName: b.UniqueName || null, b_desc: b.Description || null,
      b_cam: b.RequiresCamera ? 1 : 0, b_loc: b.RequiresLocation ? 1 : 0, b_file: b.RequiresFileAccess ? 1 : 0
    });
    await executeQuery(CS, 'COMMIT');
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create mini app:", error);
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
    const map: Record<string, string> = { Name:'b_name',Url:'b_url',LogoUrl:'b_logo',Username:'b_user',Password:'b_pass',EncryptionKey:'b_encKey',HoldingAccount:'b_holdAcc',Status:'b_status',ThemeColor:'b_theme',Rank:'b_rank',CategoryId:'b_catId',UniqueName:'b_uniqueName',Description:'b_desc' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    const boolMap: Record<string, string> = { RequiresCamera:'b_cam',RequiresLocation:'b_loc',RequiresFileAccess:'b_file' };
    for (const [col, bind] of Object.entries(boolMap)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col] ? 1 : 0; } }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP');
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Id"=:id`, binds);
    await executeQuery(CS, 'COMMIT');
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id: b.Id });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update mini app:", error);
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
    console.error("Failed to delete mini app:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
