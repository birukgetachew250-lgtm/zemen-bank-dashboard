import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."BillCategory"';

export async function GET() {
  try {
    const query = `SELECT "CategoryId","CategoryName","Description","LogoUrl","IconUrl","ColorHex","Status","Rank","CreatedAt","UpdatedAt","CreatedBy","UpdatedBy" FROM ${TABLE} ORDER BY "Rank" ASC, "CategoryName" ASC`;
    const result: any = await executeQuery(CS, query);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch bill categories:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = crypto.randomUUID();
    const query = `INSERT INTO ${TABLE} ("CategoryId","CategoryName","Description","LogoUrl","IconUrl","ColorHex","Status","Rank","CreatedBy","UpdatedBy") VALUES (:id,:name,:desc,:logo,:icon,:color,:status,:rank,:createdBy,:updatedBy)`;
    await executeQuery(CS, query, {
      id, name: body.CategoryName, desc: body.Description || null, logo: body.LogoUrl || null, icon: body.IconUrl || null,
      color: body.ColorHex || null, status: body.Status || 'Active', rank: body.Rank || 0, createdBy: body.CreatedBy || 'system', updatedBy: body.UpdatedBy || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "CategoryId" = :id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create bill category:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.CategoryId) return NextResponse.json({ message: 'CategoryId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: body.CategoryId };
    if (body.CategoryName !== undefined) { fields.push('"CategoryName"=:name'); binds.name = body.CategoryName; }
    if (body.Description !== undefined) { fields.push('"Description"=:desc'); binds.desc = body.Description; }
    if (body.LogoUrl !== undefined) { fields.push('"LogoUrl"=:logo'); binds.logo = body.LogoUrl; }
    if (body.IconUrl !== undefined) { fields.push('"IconUrl"=:icon'); binds.icon = body.IconUrl; }
    if (body.ColorHex !== undefined) { fields.push('"ColorHex"=:color'); binds.color = body.ColorHex; }
    if (body.Status !== undefined) { fields.push('"Status"=:status'); binds.status = body.Status; }
    if (body.Rank !== undefined) { fields.push('"Rank"=:rank'); binds.rank = body.Rank; }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = body.UpdatedBy || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "CategoryId"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "CategoryId"=:id`, { id: body.CategoryId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update bill category:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { CategoryId } = await req.json();
    if (!CategoryId) return NextResponse.json({ message: 'CategoryId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "CategoryId"=:id`, { id: CategoryId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete bill category:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
