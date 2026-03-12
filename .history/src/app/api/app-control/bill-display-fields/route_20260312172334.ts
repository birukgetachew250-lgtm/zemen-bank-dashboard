import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."BillDisplayField"';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    let query = `SELECT d.*, p."ProviderName" FROM ${TABLE} d LEFT JOIN "APP_CONTROL_MODULE"."BillProvider" p ON d."ProviderId"=p."ProviderId"`;
    const binds: any = {};
    if (providerId) { query += ` WHERE d."ProviderId"=:pid`; binds.pid = providerId; }
    query += ` ORDER BY d."DisplayOrder" ASC`;
    const result: any = await executeQuery(CS, query, binds);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch bill display fields:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    const query = `INSERT INTO ${TABLE} ("DisplayFieldId","ProviderId","ScreenType","SourceField","Label","ValueFormat","FormatString","IconName","IsHighlighted","TextStyle","TextColor","GroupName","DisplayOrder","VisibilityCondition","DefaultValue","Prefix","Suffix","Copyable","Status","CreatedBy","UpdatedBy") VALUES (:id,:pid,:screen,:source,:label,:valFmt,:fmtStr,:icon,:highlight,:textStyle,:textColor,:group,:order,:visCond,:defVal,:prefix,:suffix,:copyable,:status,:createdBy,:updatedBy)`;
    await executeQuery(CS, query, {
      id, pid: b.ProviderId, screen: b.ScreenType || 'confirmation', source: b.SourceField,
      label: b.Label, valFmt: b.ValueFormat || 'text', fmtStr: b.FormatString || null,
      icon: b.IconName || null, highlight: b.IsHighlighted ? 1 : 0, textStyle: b.TextStyle || 'normal',
      textColor: b.TextColor || null, group: b.GroupName || null, order: b.DisplayOrder || 0,
      visCond: b.VisibilityCondition || null, defVal: b.DefaultValue || null,
      prefix: b.Prefix || null, suffix: b.Suffix || null, copyable: b.Copyable ? 1 : 0,
      status: b.Status || 'Active', createdBy: b.CreatedBy || 'system', updatedBy: b.UpdatedBy || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "DisplayFieldId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create bill display field:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.DisplayFieldId) return NextResponse.json({ message: 'DisplayFieldId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.DisplayFieldId };
    const map: Record<string, string> = {
      ProviderId:'pid',ScreenType:'screen',SourceField:'source',Label:'label',ValueFormat:'valFmt',
      FormatString:'fmtStr',IconName:'icon',TextStyle:'textStyle',TextColor:'textColor',
      GroupName:'group',DisplayOrder:'order',VisibilityCondition:'visCond',DefaultValue:'defVal',
      Prefix:'prefix',Suffix:'suffix',Status:'status'
    };
    for (const [col, bind] of Object.entries(map)) {
      if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; }
    }
    const boolMap: Record<string, string> = { IsHighlighted:'highlight',Copyable:'copyable' };
    for (const [col, bind] of Object.entries(boolMap)) {
      if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col] ? 1 : 0; }
    }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = b.UpdatedBy || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "DisplayFieldId"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "DisplayFieldId"=:id`, { id: b.DisplayFieldId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update bill display field:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { DisplayFieldId } = await req.json();
    if (!DisplayFieldId) return NextResponse.json({ message: 'DisplayFieldId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "DisplayFieldId"=:id`, { id: DisplayFieldId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete bill display field:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
