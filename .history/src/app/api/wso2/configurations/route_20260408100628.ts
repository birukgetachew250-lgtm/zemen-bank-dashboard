import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.WSO2_MODULE_DB_CONNECTION_STRING;
const TABLE = '"WSO2_MODULE"."WSO2_CONFIGURATIONS"';

export async function GET() {
  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY INSERT_DATE DESC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Failed to fetch WSO2 configurations:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(
      CS,
      `INSERT INTO ${TABLE} (ID,SERVICE_NAME,ENDPOINT_URL,IS_ACTIVE,HTTP_METHOD,CONTENT_TYPE,DESCRIPTION,TIMEOUT_SECONDS,INSERT_USER,UPDATE_USER)
       VALUES (:id,:svcName,:endpointUrl,:isActive,:httpMethod,:contentType,:descr,:timeout,:insertUser,:updateUser)`,
      {
        id,
        svcName: b.SERVICE_NAME,
        endpointUrl: b.ENDPOINT_URL,
        isActive: b.IS_ACTIVE !== undefined ? (b.IS_ACTIVE ? 1 : 0) : 1,
        httpMethod: b.HTTP_METHOD || 'POST',
        contentType: b.CONTENT_TYPE || 'application/json',
        descr: b.DESCRIPTION || null,
        timeout: b.TIMEOUT_SECONDS || 30,
        insertUser: b.INSERT_USER || 'system',
        updateUser: b.UPDATE_USER || 'system',
      }
    );
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE ID=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Failed to create WSO2 configuration:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.ID) return NextResponse.json({ message: 'ID required' }, { status: 400 });
    const fields: string[] = [];
    const binds: any = { id: b.ID };
    const map: Record<string, string> = {
      SERVICE_NAME: 'svcName',
      ENDPOINT_URL: 'endpointUrl',
      HTTP_METHOD: 'httpMethod',
      CONTENT_TYPE: 'contentType',
      DESCRIPTION: 'descr',
      TIMEOUT_SECONDS: 'timeout',
      UPDATE_USER: 'updateUser',
    };
    for (const [col, bind] of Object.entries(map)) {
      if (b[col] !== undefined) { fields.push(`${col}=:${bind}`); binds[bind] = b[col]; }
    }
    if (b.IS_ACTIVE !== undefined) { fields.push('IS_ACTIVE=:isActive'); binds.isActive = b.IS_ACTIVE ? 1 : 0; }
    fields.push('UPDATE_DATE=CURRENT_TIMESTAMP');
    if (!binds.updateUser) { fields.push('UPDATE_USER=:updateUser'); binds.updateUser = 'system'; }
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE ID=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE ID=:id`, { id: b.ID });
    return NextResponse.json(r.rows[0]);
  } catch (error: any) {
    console.error('Failed to update WSO2 configuration:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { ID } = await req.json();
    if (!ID) return NextResponse.json({ message: 'ID required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE ID=:id`, { id: ID });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Failed to delete WSO2 configuration:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
