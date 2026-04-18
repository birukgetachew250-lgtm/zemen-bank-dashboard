import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."AppUpdate"';
const DEFAULT_AUDIT_USER = 'dmin@zemen.com';

export async function GET() {
  try {
    const result: any = await executeQuery(
      CS,
      `SELECT * FROM ${TABLE} ORDER BY "UpdateDate" DESC, "InsertDate" DESC`
    );
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Failed to fetch app updates:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();

    if (!b.VersionCode || !b.VersionName || !b.Platform) {
      return NextResponse.json(
        { message: 'VersionCode, VersionName and Platform are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await executeQuery(
      CS,
      `INSERT INTO ${TABLE} (
        "Id","VersionCode","VersionName","IsForcedUpdate","IsNewVersionAvailable","Platform","UpdateDate","InsertDate","InsertUser","UpdateUser"
      ) VALUES (
        :id,:versionCode,:versionName,:isForcedUpdate,:isNewVersionAvailable,:platform,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,:insertUser,:updateUser
      )`,
      {
        id,
        versionCode: String(b.VersionCode).trim(),
        versionName: String(b.VersionName).trim(),
        isForcedUpdate: b.IsForcedUpdate ? 1 : 0,
        isNewVersionAvailable: b.IsNewVersionAvailable ? 1 : 0,
        platform: String(b.Platform).trim(),
        insertUser: b.InsertUser || DEFAULT_AUDIT_USER,
        updateUser: b.UpdateUser || DEFAULT_AUDIT_USER,
      }
    );

    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id });
    return NextResponse.json(r.rows?.[0], { status: 201 });
  } catch (error: any) {
    const message = String(error?.message || '');
    if (message.includes('ORA-00001')) {
      return NextResponse.json(
        { message: 'VersionCode already exists. Please use a unique VersionCode.' },
        { status: 409 }
      );
    }
    console.error('Failed to create app update:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.Id) {
      return NextResponse.json({ message: 'Id required' }, { status: 400 });
    }

    const fields: string[] = [];
    const binds: any = { id: b.Id };

    const directMap: Record<string, string> = {
      VersionCode: 'versionCode',
      VersionName: 'versionName',
      Platform: 'platform',
      UpdateUser: 'updateUser',
    };

    for (const [col, bind] of Object.entries(directMap)) {
      if (b[col] !== undefined) {
        fields.push(`"${col}"=:${bind}`);
        binds[bind] = typeof b[col] === 'string' ? b[col].trim() : b[col];
      }
    }

    if (b.IsForcedUpdate !== undefined) {
      fields.push('"IsForcedUpdate"=:isForcedUpdate');
      binds.isForcedUpdate = b.IsForcedUpdate ? 1 : 0;
    }

    if (b.IsNewVersionAvailable !== undefined) {
      fields.push('"IsNewVersionAvailable"=:isNewVersionAvailable');
      binds.isNewVersionAvailable = b.IsNewVersionAvailable ? 1 : 0;
    }

    if (fields.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    fields.push('"UpdateDate"=CURRENT_TIMESTAMP');
    if (!fields.some((f) => f.includes('"UpdateUser"'))) {
      fields.push('"UpdateUser"=:updateUser');
      binds.updateUser = DEFAULT_AUDIT_USER;
    }

    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Id"=:id`, binds);
    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id: b.Id });
    return NextResponse.json(r.rows?.[0]);
  } catch (error: any) {
    const message = String(error?.message || '');
    if (message.includes('ORA-00001')) {
      return NextResponse.json(
        { message: 'VersionCode already exists. Please use a unique VersionCode.' },
        { status: 409 }
      );
    }
    console.error('Failed to update app update:', error);
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
    console.error('Failed to delete app update:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
