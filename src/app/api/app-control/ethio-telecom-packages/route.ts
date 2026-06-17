import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."EthioTelecomPackage"';

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "Rank" ASC, "PackageName" ASC`);
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Failed to fetch Ethio telecom packages:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    const id = crypto.randomUUID();

    await executeQuery(
      CS,
      `INSERT INTO ${TABLE} ("Id","PackageCode","PackageName","Description","Price","DataAmount","VoiceMinutes","SmsCount","Validity","Bonus","UssdCode","CategoryId","TagId","IconUrl","IsFeatured","IsAvailable","Status","Rank","CreatedBy","UpdatedBy","CreatedAt","UpdatedAt") VALUES (:id,:code,:name,:descr,:price,:dataAmount,:voiceMinutes,:smsCount,:validity,:bonus,:ussd,:categoryId,:tagId,:icon,:isFeatured,:isAvailable,:status,:rank,:createdBy,:updatedBy,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
      {
        id,
        code: b.PackageCode,
        name: b.PackageName,
        descr: b.Description || null,
        price: Number(b.Price),
        dataAmount: b.DataAmount || null,
        voiceMinutes: b.VoiceMinutes || null,
        smsCount: b.SmsCount || null,
        validity: b.Validity || null,
        bonus: b.Bonus || null,
        ussd: b.UssdCode || null,
        categoryId: b.CategoryId,
        tagId: b.TagId || null,
        icon: b.IconUrl || null,
        isFeatured: b.IsFeatured ? 1 : 0,
        isAvailable: b.IsAvailable === false ? 0 : 1,
        status: b.Status || 'Active',
        rank: b.Rank || 0,
        createdBy: session.user?.email || 'system',
        updatedBy: session.user?.email || 'system',
      }
    );

    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id });
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create Ethio telecom package:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const b = await req.json();
    if (!b.Id) return NextResponse.json({ message: 'Id required' }, { status: 400 });

    const fields: string[] = [];
    const binds: any = { id: b.Id };

    const directMap: Record<string, string> = {
      PackageCode: 'code',
      PackageName: 'name',
      Description: 'descr',
      Price: 'price',
      DataAmount: 'dataAmount',
      VoiceMinutes: 'voiceMinutes',
      SmsCount: 'smsCount',
      Validity: 'validity',
      Bonus: 'bonus',
      UssdCode: 'ussd',
      CategoryId: 'categoryId',
      TagId: 'tagId',
      IconUrl: 'icon',
      Status: 'status',
      Rank: 'rank',
    };

    for (const [col, bind] of Object.entries(directMap)) {
      if (b[col] !== undefined) {
        fields.push(`"${col}"=:${bind}`);
        binds[bind] = b[col];
      }
    }

    if (b.IsFeatured !== undefined) {
      fields.push('"IsFeatured"=:isFeatured');
      binds.isFeatured = b.IsFeatured ? 1 : 0;
    }

    if (b.IsAvailable !== undefined) {
      fields.push('"IsAvailable"=:isAvailable');
      binds.isAvailable = b.IsAvailable ? 1 : 0;
    }

    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP');
    fields.push('"UpdatedBy"=:updBy');
    binds.updBy = session.user?.email || 'system';

    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Id"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id: b.Id });
    return NextResponse.json(r.rows[0]);
  } catch (error) {
    console.error('Failed to update Ethio telecom package:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
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
    console.error('Failed to delete Ethio telecom package:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
