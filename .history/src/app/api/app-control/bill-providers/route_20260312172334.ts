import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."BillProvider"';

export async function GET() {
  try {
    const query = `SELECT p.*, c."CategoryName", s."SubcategoryName" FROM ${TABLE} p LEFT JOIN "APP_CONTROL_MODULE"."BillCategory" c ON p."CategoryId"=c."CategoryId" LEFT JOIN "APP_CONTROL_MODULE"."BillSubcategory" s ON p."SubcategoryId"=s."SubcategoryId" ORDER BY p."Rank" ASC`;
    const result: any = await executeQuery(CS, query);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch bill providers:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = crypto.randomUUID();
    const query = `INSERT INTO ${TABLE} ("ProviderId","CategoryId","SubcategoryId","ProviderName","ProviderCode","ApiEndpoint","HoldingAccountId","Description","LogoUrl","IconUrl","PrimaryColor","SecondaryColor","PageTemplate","MinAmount","MaxAmount","ServiceChargePercent","ServiceChargeFixed","Status","Rank","CreatedBy","UpdatedBy") VALUES (:id,:catId,:subId,:name,:code,:api,:holdAcc,:desc,:logo,:icon,:pColor,:sColor,:pageTpl,:minAmt,:maxAmt,:scPct,:scFix,:status,:rank,:createdBy,:updatedBy)`;
    await executeQuery(CS, query, {
      id, catId: body.CategoryId, subId: body.SubcategoryId || null, name: body.ProviderName, code: body.ProviderCode,
      api: body.ApiEndpoint || null, holdAcc: body.HoldingAccountId, desc: body.Description || null,
      logo: body.LogoUrl || null, icon: body.IconUrl || null, pColor: body.PrimaryColor || null, sColor: body.SecondaryColor || null,
      pageTpl: body.PageTemplate || 1, minAmt: body.MinAmount || null, maxAmt: body.MaxAmount || null,
      scPct: body.ServiceChargePercent || null, scFix: body.ServiceChargeFixed || null,
      status: body.Status || 'Active', rank: body.Rank || 0, createdBy: body.CreatedBy || 'system', updatedBy: body.UpdatedBy || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "ProviderId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create bill provider:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.ProviderId) return NextResponse.json({ message: 'ProviderId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: body.ProviderId };
    const map: Record<string, string> = {
      CategoryId: 'catId', SubcategoryId: 'subId', ProviderName: 'name', ProviderCode: 'code',
      ApiEndpoint: 'api', HoldingAccountId: 'holdAcc', Description: 'desc', LogoUrl: 'logo',
      IconUrl: 'icon', PrimaryColor: 'pColor', SecondaryColor: 'sColor', PageTemplate: 'pageTpl',
      MinAmount: 'minAmt', MaxAmount: 'maxAmt', ServiceChargePercent: 'scPct', ServiceChargeFixed: 'scFix',
      Status: 'status', Rank: 'rank'
    };
    for (const [col, bind] of Object.entries(map)) {
      if (body[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = body[col]; }
    }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = body.UpdatedBy || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "ProviderId"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "ProviderId"=:id`, { id: body.ProviderId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update bill provider:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { ProviderId } = await req.json();
    if (!ProviderId) return NextResponse.json({ message: 'ProviderId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "ProviderId"=:id`, { id: ProviderId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete bill provider:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
