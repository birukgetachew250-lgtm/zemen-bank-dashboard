import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."EthioTelecomTag"';

export async function GET() {
  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "Rank" ASC, "TagName" ASC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Failed to fetch Ethio telecom tags:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = crypto.randomUUID();

    await executeQuery(
      CS,
      `INSERT INTO ${TABLE} ("Id","TagName","Description","ColorHex","IconName","Status","Rank","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:name,:descr,:color,:icon,:status,:rank,:createdBy,:updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
      {
        id,
        name: b.TagName,
        descr: b.Description || null,
        color: b.ColorHex || null,
        icon: b.IconName || null,
        status: b.Status || 'Active',
        rank: b.Rank || 0,
        createdBy: b.CreatedBy || 'system',
        updatedBy: b.UpdatedBy || 'system',
      }
    );

    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create Ethio telecom tag:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.Id) return NextResponse.json({ message: 'Id required' }, { status: 400 });

    const fields: string[] = [];
    const binds: any = { id: b.Id };
    const map: Record<string, string> = {
      TagName: 'name',
      Description: 'descr',
      ColorHex: 'color',
      IconName: 'icon',
      Status: 'status',
      Rank: 'rank',
    };

    for (const [col, bind] of Object.entries(map)) {
      if (b[col] !== undefined) {
        fields.push(`"${col}"=:${bind}`);
        binds[bind] = b[col];
      }
    }

    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP');
    fields.push('"UpdatedBy"=:updBy');
    binds.updBy = b.UpdatedBy || 'system';

    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Id"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id: b.Id });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error('Failed to update Ethio telecom tag:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { Id } = await req.json();
    if (!Id) return NextResponse.json({ message: 'Id required' }, { status: 400 });

    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "Id"=:id`, { id: Id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete Ethio telecom tag:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
