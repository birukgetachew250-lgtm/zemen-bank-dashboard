import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."BillSubcategory"';

export async function GET() {
  try {
    const query = `SELECT s.*, c."CategoryName" FROM ${TABLE} s LEFT JOIN "APP_CONTROL_MODULE"."BillCategory" c ON s."CategoryId" = c."CategoryId" ORDER BY s."Rank" ASC`;
    const result: any = await executeQuery(CS, query);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch bill subcategories:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = crypto.randomUUID();
    const query = `INSERT INTO ${TABLE} ("SubcategoryId","CategoryId","SubcategoryName","HoldingAccountId","IsMiniApp","WebUrl","ApiEndpoint","Description","LogoUrl","IconUrl","IsBillable","PageTemplate","Status","Rank","CreatedBy","UpdatedBy") VALUES (:id,:catId,:name,:holdAcc,:isMini,:webUrl,:apiEnd,:desc,:logo,:icon,:billable,:pageTpl,:status,:rank,:createdBy,:updatedBy)`;
    await executeQuery(CS, query, {
      id, catId: body.CategoryId, name: body.SubcategoryName, holdAcc: body.HoldingAccountId,
      isMini: body.IsMiniApp ? 1 : 0, webUrl: body.WebUrl || null, apiEnd: body.ApiEndpoint || null,
      desc: body.Description || null, logo: body.LogoUrl || null, icon: body.IconUrl || null,
      billable: body.IsBillable ? 1 : 0, pageTpl: body.PageTemplate || null,
      status: body.Status || 'Active', rank: body.Rank || 0, createdBy: body.CreatedBy || 'system', updatedBy: body.UpdatedBy || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "SubcategoryId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create bill subcategory:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.SubcategoryId) return NextResponse.json({ message: 'SubcategoryId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: body.SubcategoryId };
    if (body.CategoryId !== undefined) { fields.push('"CategoryId"=:catId'); binds.catId = body.CategoryId; }
    if (body.SubcategoryName !== undefined) { fields.push('"SubcategoryName"=:name'); binds.name = body.SubcategoryName; }
    if (body.HoldingAccountId !== undefined) { fields.push('"HoldingAccountId"=:holdAcc'); binds.holdAcc = body.HoldingAccountId; }
    if (body.IsMiniApp !== undefined) { fields.push('"IsMiniApp"=:isMini'); binds.isMini = body.IsMiniApp ? 1 : 0; }
    if (body.WebUrl !== undefined) { fields.push('"WebUrl"=:webUrl'); binds.webUrl = body.WebUrl; }
    if (body.ApiEndpoint !== undefined) { fields.push('"ApiEndpoint"=:apiEnd'); binds.apiEnd = body.ApiEndpoint; }
    if (body.Description !== undefined) { fields.push('"Description"=:desc'); binds.desc = body.Description; }
    if (body.LogoUrl !== undefined) { fields.push('"LogoUrl"=:logo'); binds.logo = body.LogoUrl; }
    if (body.IconUrl !== undefined) { fields.push('"IconUrl"=:icon'); binds.icon = body.IconUrl; }
    if (body.IsBillable !== undefined) { fields.push('"IsBillable"=:billable'); binds.billable = body.IsBillable ? 1 : 0; }
    if (body.PageTemplate !== undefined) { fields.push('"PageTemplate"=:pageTpl'); binds.pageTpl = body.PageTemplate; }
    if (body.Status !== undefined) { fields.push('"Status"=:status'); binds.status = body.Status; }
    if (body.Rank !== undefined) { fields.push('"Rank"=:rank'); binds.rank = body.Rank; }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = body.UpdatedBy || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "SubcategoryId"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "SubcategoryId"=:id`, { id: body.SubcategoryId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update bill subcategory:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { SubcategoryId } = await req.json();
    if (!SubcategoryId) return NextResponse.json({ message: 'SubcategoryId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "SubcategoryId"=:id`, { id: SubcategoryId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete bill subcategory:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
