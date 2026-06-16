import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."FlexCubeIntegration"';

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "CreatedAt" DESC`);
    return NextResponse.json((result.rows || []).map((r: any) => ({ ...r, Password: r.Password ? '••••••••' : null, ApiKey: r.ApiKey ? '••••••••' : null })));
  } catch (error) {
    console.error("Failed to fetch flexcube integrations:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(CS, `INSERT INTO ${TABLE} ("Id","UniqueKey","IntegrationName","BaseUrl","Username","Password","ApiKey","AuthenticationParams","IntegrationType","TimeoutSeconds","MaxRetryAttempts","UseSSL","Status","IsProduction","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:ukey,:name,:url,:user,:pass,:apiKey,:authParams,:itype,:timeout,:maxRetry,:ssl,:status,:isProd,:createdBy,:updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, ukey: b.UniqueKey, name: b.IntegrationName, url: b.BaseUrl, user: b.Username, pass: b.Password || null,
      apiKey: b.ApiKey || null, authParams: b.AuthenticationParams || null, itype: b.IntegrationType || 'REST',
      timeout: b.TimeoutSeconds || 30, maxRetry: b.MaxRetryAttempts || 3, ssl: b.UseSSL !== false ? 1 : 0,
      status: b.Status || 'Pending', isProd: b.IsProduction ? 1 : 0,
      createdBy: b.CreatedBy || session.user?.email || 'system', updatedBy: b.UpdatedBy || session.user?.email || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id });
    return NextResponse.json({ ...r.rows[0], Password: '••••••••', ApiKey: r.rows[0].ApiKey ? '••••••••' : null }, { status: 201 });
  } catch (error) {
    console.error("Failed to create flexcube integration:", error);
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
    const map: Record<string, string> = { UniqueKey:'ukey',IntegrationName:'name',BaseUrl:'url',Username:'user',AuthenticationParams:'authParams',IntegrationType:'itype',TimeoutSeconds:'timeout',MaxRetryAttempts:'maxRetry',Status:'status',LastErrorMessage:'lastErr' };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    if (b.Password && !b.Password.includes('••••')) { fields.push('"Password"=:pass'); binds.pass = b.Password; }
    if (b.ApiKey && !b.ApiKey.includes('••••')) { fields.push('"ApiKey"=:apiKey'); binds.apiKey = b.ApiKey; }
    const boolMap: Record<string, string> = { UseSSL:'ssl',IsProduction:'isProd' };
    for (const [col, bind] of Object.entries(boolMap)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col] ? 1 : 0; } }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = b.UpdatedBy || session.user?.email || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Id"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id: b.Id });
    return NextResponse.json({ ...r.rows[0], Password: '••••••••', ApiKey: r.rows[0].ApiKey ? '••••••••' : null });
  } catch (error) {
    console.error("Failed to update flexcube integration:", error);
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
    console.error("Failed to delete flexcube integration:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
