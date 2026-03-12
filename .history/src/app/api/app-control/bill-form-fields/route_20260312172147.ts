import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."BillFormField"';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    let query = `SELECT f.*, p."ProviderName" FROM ${TABLE} f LEFT JOIN "APP_CONTROL_MODULE"."BillProvider" p ON f."ProviderId"=p."ProviderId"`;
    const binds: any = {};
    if (providerId) { query += ` WHERE f."ProviderId"=:pid`; binds.pid = providerId; }
    query += ` ORDER BY f."StepNumber" ASC, f."FieldOrder" ASC`;
    const result: any = await executeQuery(CS, query, binds);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch bill form fields:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    const query = `INSERT INTO ${TABLE} ("FieldId","ProviderId","FieldKey","Label","Placeholder","HelperText","FieldType","KeyboardType","IconName","IsRequired","IsReadOnly","IsHidden","IsMasked","MinLength","MaxLength","MinValue","MaxValue","ValidationPattern","ValidationMessage","DefaultValue","Options","FieldGroup","FieldOrder","StepNumber","VisibilityCondition","TriggerLookup","LookupEndpoint","Status","CreatedBy","UpdatedBy") VALUES (:id,:pid,:key,:label,:ph,:helper,:ftype,:ktype,:icon,:req,:ro,:hidden,:masked,:minL,:maxL,:minV,:maxV,:vPat,:vMsg,:defVal,:opts,:fGroup,:fOrder,:step,:visCond,:trigLook,:lookEnd,:status,:createdBy,:updatedBy)`;
    await executeQuery(CS, query, {
      id, pid: b.ProviderId, key: b.FieldKey, label: b.Label, ph: b.Placeholder || null, helper: b.HelperText || null,
      ftype: b.FieldType || 'text', ktype: b.KeyboardType || null, icon: b.IconName || null,
      req: b.IsRequired ? 1 : 0, ro: b.IsReadOnly ? 1 : 0, hidden: b.IsHidden ? 1 : 0, masked: b.IsMasked ? 1 : 0,
      minL: b.MinLength || null, maxL: b.MaxLength || null, minV: b.MinValue || null, maxV: b.MaxValue || null,
      vPat: b.ValidationPattern || null, vMsg: b.ValidationMessage || null, defVal: b.DefaultValue || null,
      opts: b.Options || null, fGroup: b.FieldGroup || null, fOrder: b.FieldOrder || 0, step: b.StepNumber || 1,
      visCond: b.VisibilityCondition || null, trigLook: b.TriggerLookup ? 1 : 0, lookEnd: b.LookupEndpoint || null,
      status: b.Status || 'Active', createdBy: b.CreatedBy || 'system', updatedBy: b.UpdatedBy || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "FieldId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create bill form field:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.FieldId) return NextResponse.json({ message: 'FieldId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.FieldId };
    const map: Record<string, string> = {
      ProviderId:'pid',FieldKey:'key',Label:'label',Placeholder:'ph',HelperText:'helper',FieldType:'ftype',
      KeyboardType:'ktype',IconName:'icon',ValidationPattern:'vPat',ValidationMessage:'vMsg',
      DefaultValue:'defVal',Options:'opts',FieldGroup:'fGroup',FieldOrder:'fOrder',StepNumber:'step',
      VisibilityCondition:'visCond',LookupEndpoint:'lookEnd',Status:'status',MinLength:'minL',MaxLength:'maxL'
    };
    for (const [col, bind] of Object.entries(map)) {
      if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; }
    }
    const boolMap: Record<string, string> = { IsRequired:'req',IsReadOnly:'ro',IsHidden:'hidden',IsMasked:'masked',TriggerLookup:'trigLook' };
    for (const [col, bind] of Object.entries(boolMap)) {
      if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col] ? 1 : 0; }
    }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = b.UpdatedBy || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "FieldId"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "FieldId"=:id`, { id: b.FieldId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update bill form field:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { FieldId } = await req.json();
    if (!FieldId) return NextResponse.json({ message: 'FieldId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "FieldId"=:id`, { id: FieldId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete bill form field:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
