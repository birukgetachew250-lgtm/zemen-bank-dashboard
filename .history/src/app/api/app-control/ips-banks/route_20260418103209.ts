import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."IPSBank"';

export async function GET() {
  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "Rank" ASC, "BankName" ASC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch IPS banks:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(CS, `INSERT INTO ${TABLE} ("Id","BankName","BankCode","ReconciliationAccount","BankLogo","PrimaryColor","SecondaryColor","AccentColor","Status","Rank","BranchCode","CreatedAt","UpdatedAt") VALUES (:id,:name,:code,:recon,:logo,:pColor,:sColor,:aColor,:status,:rank,:branchCode,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, name: b.BankName, code: b.BankCode, recon: b.ReconciliationAccount, logo: b.BankLogo || null,
      pColor: b.PrimaryColor || null, sColor: b.SecondaryColor || null, aColor: b.AccentColor || null,
      status: b.Status || 'Active', rank: b.Rank || 0, branchCode: b.BranchCode
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create IPS bank:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.Id) return NextResponse.json({ message: 'Id required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.Id };
    const map: Record<string, string> = { BankName:'name',BankCode:'code',ReconciliationAccount:'recon',BankLogo:'logo',PrimaryColor:'pColor',SecondaryColor:'sColor',AccentColor:'aColor',Status:'status',Rank:'rank',BranchCode:'branchCode' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP');
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Id"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id: b.Id });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update IPS bank:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { Id } = await req.json();
    if (!Id) return NextResponse.json({ message: 'Id required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "Id"=:id`, { id: Id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete IPS bank:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
