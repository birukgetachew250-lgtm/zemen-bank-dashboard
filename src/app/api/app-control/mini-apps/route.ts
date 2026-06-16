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
    await executeQuery(CS, `INSERT INTO ${TABLE} ("Id","Name","Url","LogoUrl","Username","Password","EncryptionKey","HoldingAccount","Status","ThemeColor","Rank","CategoryId","UniqueName","Description","RequiresCamera","RequiresLocation","RequiresFileAccess","CreatedAt","UpdatedAt") VALUES (:id,:name,:url,:logo,:user,:pass,:encKey,:holdAcc,:status,:theme,:rank,:catId,:uniqueName,:descr,:cam,:loc,:file,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, name: b.Name, url: b.Url, logo: b.LogoUrl, user: b.Username, pass: b.Password, encKey: b.EncryptionKey,
      holdAcc: b.HoldingAccount || '', status: b.Status || 'Active', theme: b.ThemeColor || '#808080', rank: b.Rank || 0,
      catId: b.CategoryId || null, uniqueName: b.UniqueName || null, descr: b.Description || null,
      cam: b.RequiresCamera ? 1 : 0, loc: b.RequiresLocation ? 1 : 0, file: b.RequiresFileAccess ? 1 : 0
    });
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
    const map: Record<string, string> = { Name:'name',Url:'url',LogoUrl:'logo',Username:'user',Password:'pass',EncryptionKey:'encKey',HoldingAccount:'holdAcc',Status:'status',ThemeColor:'theme',Rank:'rank',CategoryId:'catId',UniqueName:'uniqueName',Description:'desc' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    const boolMap: Record<string, string> = { RequiresCamera:'cam',RequiresLocation:'loc',RequiresFileAccess:'file' };
    for (const [col, bind] of Object.entries(boolMap)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col] ? 1 : 0; } }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP');
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Id"=:id`, binds);
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
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete mini app:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
