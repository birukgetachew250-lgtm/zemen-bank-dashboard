import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."BillFlowStep"';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    let query = `SELECT s.*, p."ProviderName" FROM ${TABLE} s LEFT JOIN "APP_CONTROL_MODULE"."BillProvider" p ON s."ProviderId"=p."ProviderId"`;
    const binds: any = {};
    if (providerId) { query += ` WHERE s."ProviderId"=:pid`; binds.pid = providerId; }
    query += ` ORDER BY s."StepOrder" ASC`;
    const result: any = await executeQuery(CS, query, binds);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch bill flow steps:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    const query = `INSERT INTO ${TABLE} ("StepId","ProviderId","StepOrder","StepType","Title","Subtitle","IconName","PrimaryButtonText","SecondaryButtonText","ApiEndpoint","ApiMethod","RequestTemplate","ResponseMapping","SuccessCondition","ErrorMessagePath","ShowLoading","LoadingMessage","RequiresAuth","AuthType","NextStepOnSuccess","NextStepOnError","CanGoBack","SkipCondition","Layout","BackgroundColor","CustomComponent","Status","CreatedBy","UpdatedBy") VALUES (:id,:pid,:order,:stype,:title,:subtitle,:icon,:pBtn,:sBtn,:api,:method,:reqTpl,:resMap,:succCond,:errPath,:showLoad,:loadMsg,:reqAuth,:authType,:nextSucc,:nextErr,:canBack,:skipCond,:layout,:bgColor,:custom,:status,:createdBy,:updatedBy)`;
    await executeQuery(CS, query, {
      id, pid: b.ProviderId, order: b.StepOrder || 1, stype: b.StepType || 'input', title: b.Title,
      subtitle: b.Subtitle || null, icon: b.IconName || null, pBtn: b.PrimaryButtonText || 'Continue',
      sBtn: b.SecondaryButtonText || null, api: b.ApiEndpoint || null, method: b.ApiMethod || null,
      reqTpl: b.RequestTemplate || null, resMap: b.ResponseMapping || null, succCond: b.SuccessCondition || null,
      errPath: b.ErrorMessagePath || null, showLoad: b.ShowLoading !== false ? 1 : 0, loadMsg: b.LoadingMessage || null,
      reqAuth: b.RequiresAuth ? 1 : 0, authType: b.AuthType || null, nextSucc: b.NextStepOnSuccess || null,
      nextErr: b.NextStepOnError || null, canBack: b.CanGoBack !== false ? 1 : 0, skipCond: b.SkipCondition || null,
      layout: b.Layout || 'standard', bgColor: b.BackgroundColor || null, custom: b.CustomComponent || null,
      status: b.Status || 'Active', createdBy: b.CreatedBy || 'system', updatedBy: b.UpdatedBy || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "StepId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create bill flow step:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.StepId) return NextResponse.json({ message: 'StepId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.StepId };
    const map: Record<string, string> = {
      ProviderId:'pid',StepOrder:'order',StepType:'stype',Title:'title',Subtitle:'subtitle',IconName:'icon',
      PrimaryButtonText:'pBtn',SecondaryButtonText:'sBtn',ApiEndpoint:'api',ApiMethod:'method',
      RequestTemplate:'reqTpl',ResponseMapping:'resMap',SuccessCondition:'succCond',ErrorMessagePath:'errPath',
      LoadingMessage:'loadMsg',AuthType:'authType',NextStepOnSuccess:'nextSucc',NextStepOnError:'nextErr',
      SkipCondition:'skipCond',Layout:'layout',BackgroundColor:'bgColor',CustomComponent:'custom',Status:'status'
    };
    for (const [col, bind] of Object.entries(map)) {
      if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; }
    }
    const boolMap: Record<string, string> = { ShowLoading:'showLoad',RequiresAuth:'reqAuth',CanGoBack:'canBack' };
    for (const [col, bind] of Object.entries(boolMap)) {
      if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col] ? 1 : 0; }
    }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = b.UpdatedBy || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "StepId"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "StepId"=:id`, { id: b.StepId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update bill flow step:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { StepId } = await req.json();
    if (!StepId) return NextResponse.json({ message: 'StepId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "StepId"=:id`, { id: StepId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete bill flow step:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
