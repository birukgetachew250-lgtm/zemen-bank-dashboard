import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import oracledb from 'oracledb';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."BankLocation"';

export async function GET() {
  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "Rank" ASC, "PlaceName" ASC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch bank locations:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const query = `INSERT INTO ${TABLE} ("PlaceName","Latitude","Longitude","Location","Description","Type","Status","Rank","CreatedAt","UpdatedAt") VALUES (:name,:lat,:lng,:loc,:desc,:type,:status,:rank,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING "Lid" INTO :lid`;
    const result: any = await executeQuery(CS, query, {
      name: b.PlaceName, lat: b.Latitude, lng: b.Longitude, loc: b.Location,
      desc: b.Description || null, type: b.Type || 'Branch', status: b.Status ?? 1, rank: b.Rank || 0,
      lid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    });
    const newId = result.outBinds.lid[0];
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Lid"=:id`, { id: newId });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create bank location:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.Lid) return NextResponse.json({ message: 'Lid required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.Lid };
    const map: Record<string, string> = { PlaceName:'name',Latitude:'lat',Longitude:'lng',Location:'loc',Description:'desc',Type:'type',Status:'status',Rank:'rank' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP');
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Lid"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Lid"=:id`, { id: b.Lid });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update bank location:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { Lid } = await req.json();
    if (!Lid) return NextResponse.json({ message: 'Lid required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "Lid"=:id`, { id: Lid });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete bank location:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
