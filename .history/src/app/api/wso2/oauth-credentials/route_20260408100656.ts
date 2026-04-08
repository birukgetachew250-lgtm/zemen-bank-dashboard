import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.WSO2_MODULE_DB_CONNECTION_STRING;
const TABLE = '"WSO2_MODULE"."WSO2_OAUTH_CREDENTIALS"';

const maskSecret = (row: any) =>
  row ? { ...row, CLIENT_SECRET: row.CLIENT_SECRET ? '••••••••' : null } : row;

export async function GET() {
  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY INSERT_DATE DESC`);
    return NextResponse.json((result.rows || []).map(maskSecret));
  } catch (error) {
    console.error('Failed to fetch WSO2 OAuth credentials:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(
      CS,
      `INSERT INTO ${TABLE} (ID,CREDENTIAL_NAME,AUTH_URL,CLIENT_ID,CLIENT_SECRET,GRANT_TYPE,SCOPE,IS_ACTIVE,DESCRIPTION,INSERT_USER,UPDATE_USER)
       VALUES (:id,:credName,:authUrl,:clientId,:clientSecret,:grantType,:scope,:isActive,:descr,:insertUser,:updateUser)`,
      {
        id,
        credName: b.CREDENTIAL_NAME,
        authUrl: b.AUTH_URL,
        clientId: b.CLIENT_ID,
        clientSecret: b.CLIENT_SECRET,
        grantType: b.GRANT_TYPE || 'client_credentials',
        scope: b.SCOPE || null,
        isActive: b.IS_ACTIVE !== undefined ? (b.IS_ACTIVE ? 1 : 0) : 1,
        descr: b.DESCRIPTION || null,
        insertUser: b.INSERT_USER || 'system',
        updateUser: b.UPDATE_USER || 'system',
      }
    );
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE ID=:id`, { id });
    return NextResponse.json(maskSecret(r.rows[0]), { status: 201 });
  } catch (error: any) {
    console.error('Failed to create WSO2 OAuth credential:', error);
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
      CREDENTIAL_NAME: 'credName',
      AUTH_URL: 'authUrl',
      CLIENT_ID: 'clientId',
      GRANT_TYPE: 'grantType',
      SCOPE: 'scope',
      DESCRIPTION: 'descr',
      UPDATE_USER: 'updateUser',
    };
    for (const [col, bind] of Object.entries(map)) {
      if (b[col] !== undefined) { fields.push(`${col}=:${bind}`); binds[bind] = b[col]; }
    }
    if (b.CLIENT_SECRET && !b.CLIENT_SECRET.includes('••••')) {
      fields.push('CLIENT_SECRET=:clientSecret'); binds.clientSecret = b.CLIENT_SECRET;
    }
    if (b.IS_ACTIVE !== undefined) { fields.push('IS_ACTIVE=:isActive'); binds.isActive = b.IS_ACTIVE ? 1 : 0; }
    fields.push('UPDATE_DATE=CURRENT_TIMESTAMP');
    if (!binds.updateUser) { fields.push('UPDATE_USER=:updateUser2'); binds.updateUser2 = 'system'; }
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE ID=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE ID=:id`, { id: b.ID });
    return NextResponse.json(maskSecret(r.rows[0]));
  } catch (error: any) {
    console.error('Failed to update WSO2 OAuth credential:', error);
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
    console.error('Failed to delete WSO2 OAuth credential:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
