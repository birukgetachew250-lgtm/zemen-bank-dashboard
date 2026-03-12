import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."BillApiConfig"';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    let query = `SELECT a.*, p."ProviderName" FROM ${TABLE} a LEFT JOIN "APP_CONTROL_MODULE"."BillProvider" p ON a."ProviderId"=p."ProviderId"`;
    const binds: any = {};
    if (providerId) { query += ` WHERE a."ProviderId"=:pid`; binds.pid = providerId; }
    query += ` ORDER BY a."ExecutionOrder" ASC`;
    const result: any = await executeQuery(CS, query, binds);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch bill api configs:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    const query = `INSERT INTO ${TABLE} ("ConfigId","ProviderId","ApiType","DisplayName","Endpoint","HttpMethod","ContentType","RequestHeaders","RequestBodyTemplate","QueryParameters","ResponseMapping","SuccessStatusPath","SuccessStatusValues","ErrorMessagePath","DefaultErrorMessage","TimeoutSeconds","RetryCount","RetryDelayMs","CacheResponse","CacheDurationSeconds","UseProxy","EnableLogging","MaskSensitiveData","MockResponse","MockEnabled","ExecutionOrder","Status","CreatedBy","UpdatedBy") VALUES (:id,:pid,:apiType,:dispName,:endpoint,:method,:ctype,:reqHeaders,:reqBody,:queryParams,:resMap,:succPath,:succVals,:errPath,:defErr,:timeout,:retryCount,:retryDelay,:cache,:cacheDur,:useProxy,:enableLog,:maskData,:mockResp,:mockEnabled,:execOrder,:status,:createdBy,:updatedBy)`;
    await executeQuery(CS, query, {
      id, pid: b.ProviderId, apiType: b.ApiType, dispName: b.DisplayName || null, endpoint: b.Endpoint,
      method: b.HttpMethod || 'POST', ctype: b.ContentType || 'application/json',
      reqHeaders: b.RequestHeaders || null, reqBody: b.RequestBodyTemplate || null,
      queryParams: b.QueryParameters || null, resMap: b.ResponseMapping || null,
      succPath: b.SuccessStatusPath || null, succVals: b.SuccessStatusValues || null,
      errPath: b.ErrorMessagePath || null, defErr: b.DefaultErrorMessage || null,
      timeout: b.TimeoutSeconds || 30, retryCount: b.RetryCount || 0, retryDelay: b.RetryDelayMs || 1000,
      cache: b.CacheResponse ? 1 : 0, cacheDur: b.CacheDurationSeconds || 300,
      useProxy: b.UseProxy ? 1 : 0, enableLog: b.EnableLogging !== false ? 1 : 0,
      maskData: b.MaskSensitiveData !== false ? 1 : 0, mockResp: b.MockResponse || null,
      mockEnabled: b.MockEnabled ? 1 : 0, execOrder: b.ExecutionOrder || 0,
      status: b.Status || 'Active', createdBy: b.CreatedBy || 'system', updatedBy: b.UpdatedBy || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "ConfigId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create bill api config:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.ConfigId) return NextResponse.json({ message: 'ConfigId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.ConfigId };
    const map: Record<string, string> = {
      ProviderId:'pid',ApiType:'apiType',DisplayName:'dispName',Endpoint:'endpoint',HttpMethod:'method',
      ContentType:'ctype',RequestHeaders:'reqHeaders',RequestBodyTemplate:'reqBody',QueryParameters:'queryParams',
      ResponseMapping:'resMap',SuccessStatusPath:'succPath',SuccessStatusValues:'succVals',ErrorMessagePath:'errPath',
      DefaultErrorMessage:'defErr',TimeoutSeconds:'timeout',RetryCount:'retryCount',RetryDelayMs:'retryDelay',
      CacheDurationSeconds:'cacheDur',MockResponse:'mockResp',ExecutionOrder:'execOrder',Status:'status'
    };
    for (const [col, bind] of Object.entries(map)) {
      if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; }
    }
    const boolMap: Record<string, string> = { CacheResponse:'cache',UseProxy:'useProxy',EnableLogging:'enableLog',MaskSensitiveData:'maskData',MockEnabled:'mockEnabled' };
    for (const [col, bind] of Object.entries(boolMap)) {
      if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col] ? 1 : 0; }
    }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = b.UpdatedBy || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "ConfigId"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "ConfigId"=:id`, { id: b.ConfigId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update bill api config:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { ConfigId } = await req.json();
    if (!ConfigId) return NextResponse.json({ message: 'ConfigId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "ConfigId"=:id`, { id: ConfigId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete bill api config:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
