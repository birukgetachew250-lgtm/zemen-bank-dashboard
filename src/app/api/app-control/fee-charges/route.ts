import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."FeeCharge"';

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const query = `SELECT f.*, c."CategoryName", c."CategoryCode" FROM ${TABLE} f LEFT JOIN "APP_CONTROL_MODULE"."FeeCategory" c ON f."CategoryId"=c."CategoryId" ORDER BY f."Rank" ASC, f."FeeName" ASC`;
    const result: any = await executeQuery(CS, query);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error("Failed to fetch fee charges:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    const id = crypto.randomUUID();
    await executeQuery(CS, `INSERT INTO ${TABLE} ("FeeId","CategoryId","FeeName","FeeCode","TransactionType","TransactionSubType","Description","FeeAmount","IsFree","FeePercentage","MinFeeAmount","MaxFeeAmount","MinTransactionAmount","MaxTransactionAmount","Currency","FeeFrequency","EffectiveFrom","EffectiveTo","IsVATApplicable","VATPercentage","IsWaivedForPremium","FreeTransactionsLimit","FreeTransactionsPeriod","Notes","Status","Rank","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:catId,:name,:code,:txnType,:txnSubType,:descr,:amt,:isFree,:pct,:minFee,:maxFee,:minTxn,:maxTxn,:currency,:freq,:effFrom,:effTo,:vat,:vatPct,:waived,:freeTxnLimit,:freeTxnPeriod,:notes,:status,:rank,:createdBy,:updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, {
      id, catId: b.CategoryId, name: b.FeeName, code: b.FeeCode, txnType: b.TransactionType,
      txnSubType: b.TransactionSubType || null, descr: b.Description || null, amt: b.FeeAmount || 0,
      isFree: b.IsFree ? 1 : 0, pct: b.FeePercentage || null, minFee: b.MinFeeAmount || null,
      maxFee: b.MaxFeeAmount || null, minTxn: b.MinTransactionAmount || null, maxTxn: b.MaxTransactionAmount || null,
      currency: b.Currency || 'ETB', freq: b.FeeFrequency || 'PerTransaction',
      effFrom: b.EffectiveFrom ? new Date(b.EffectiveFrom) : null, effTo: b.EffectiveTo ? new Date(b.EffectiveTo) : null,
      vat: b.IsVATApplicable ? 1 : 0, vatPct: b.VATPercentage || null, waived: b.IsWaivedForPremium ? 1 : 0,
      freeTxnLimit: b.FreeTransactionsLimit || null, freeTxnPeriod: b.FreeTransactionsPeriod || null,
      notes: b.Notes || null, status: b.Status || 'Active', rank: b.Rank || 0,
      createdBy: session.user?.email || 'system', updatedBy: session.user?.email || 'system'
    });
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "FeeId"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create fee charge:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    if (!b.FeeId) return NextResponse.json({ message: 'FeeId required' }, { status: 400 });
    const fields: string[] = []; const binds: any = { id: b.FeeId };
    const map: Record<string, string> = {
      CategoryId:'catId',FeeName:'name',FeeCode:'code',TransactionType:'txnType',TransactionSubType:'txnSubType',
      Description:'desc',FeeAmount:'amt',FeePercentage:'pct',MinFeeAmount:'minFee',MaxFeeAmount:'maxFee',
      MinTransactionAmount:'minTxn',MaxTransactionAmount:'maxTxn',Currency:'currency',FeeFrequency:'freq',
      VATPercentage:'vatPct',FreeTransactionsLimit:'freeTxnLimit',FreeTransactionsPeriod:'freeTxnPeriod',
      Notes:'notes',Status:'status',Rank:'rank'
    };
    for (const [col, bind] of Object.entries(map)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col]; } }
    const boolMap: Record<string, string> = { IsFree:'isFree',IsVATApplicable:'vat',IsWaivedForPremium:'waived' };
    for (const [col, bind] of Object.entries(boolMap)) { if (b[col] !== undefined) { fields.push(`"${col}"=:${bind}`); binds[bind] = b[col] ? 1 : 0; } }
    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP'); fields.push('"UpdatedBy"=:updBy'); binds.updBy = session.user?.email || 'system';
    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "FeeId"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "FeeId"=:id`, { id: b.FeeId });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error("Failed to update fee charge:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { FeeId } = await req.json();
    if (!FeeId) return NextResponse.json({ message: 'FeeId required' }, { status: 400 });
    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "FeeId"=:id`, { id: FeeId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete fee charge:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
