import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."ThirdPartyServiceConfig"';

export async function GET() {
  try {
    const result: any = await executeQuery(CS, `SELECT * FROM ${TABLE} ORDER BY "UpdatedAt" DESC`);
    return NextResponse.json(result.rows || []);
  } catch (error: any) {
    console.error('Failed to fetch third-party service configurations:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = crypto.randomUUID();

    await executeQuery(
      CS,
      `INSERT INTO ${TABLE} ("Id","ServiceName","DisplayName","GLAccount","BranchCode","Currency","ServiceCategory","IsEnabled","Status","ConfigParams","Description","CreatedAt","UpdatedAt","CreatedBy","UpdatedBy")
       VALUES (:id,:serviceName,:displayName,:glAccount,:branchCode,:currency,:serviceCategory,:isEnabled,:status,:configParams,:description,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,:createdBy,:updatedBy)`,
      {
        id,
        serviceName: b.ServiceName,
        displayName: b.DisplayName,
        glAccount: b.GLAccount,
        branchCode: b.BranchCode,
        currency: b.Currency,
        serviceCategory: b.ServiceCategory,
        isEnabled: b.IsEnabled !== undefined ? (b.IsEnabled ? 1 : 0) : 1,
        status: b.Status || 'Active',
        configParams: b.ConfigParams || null,
        description: b.Description || null,
        createdBy: b.CreatedBy || 'system',
        updatedBy: b.UpdatedBy || 'system',
      }
    );

    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id });
    return NextResponse.json(r.rows?.[0], { status: 201 });
  } catch (error: any) {
    console.error('Failed to create third-party service configuration:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    if (!b.Id) return NextResponse.json({ message: 'Id required' }, { status: 400 });

    const fields: string[] = [];
    const binds: any = { id: b.Id };
    const map: Record<string, string> = {
      ServiceName: 'serviceName',
      DisplayName: 'displayName',
      GLAccount: 'glAccount',
      BranchCode: 'branchCode',
      Currency: 'currency',
      ServiceCategory: 'serviceCategory',
      Status: 'status',
      ConfigParams: 'configParams',
      Description: 'description',
      CreatedBy: 'createdBy',
      UpdatedBy: 'updatedBy',
    };

    for (const [col, bind] of Object.entries(map)) {
      if (b[col] !== undefined) {
        fields.push(`"${col}"=:${bind}`);
        binds[bind] = b[col];
      }
    }

    if (b.IsEnabled !== undefined) {
      fields.push('"IsEnabled"=:isEnabled');
      binds.isEnabled = b.IsEnabled ? 1 : 0;
    }

    if (!binds.updatedBy) {
      fields.push('"UpdatedBy"=:updatedBy');
      binds.updatedBy = 'system';
    }

    fields.push('"UpdatedAt"=CURRENT_TIMESTAMP');

    await executeQuery(CS, `UPDATE ${TABLE} SET ${fields.join(',')} WHERE "Id"=:id`, binds);

    const r: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE "Id"=:id`, { id: b.Id });
    return NextResponse.json(r.rows?.[0]);
  } catch (error: any) {
    console.error('Failed to update third-party service configuration:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { Id } = await req.json();
    if (!Id) return NextResponse.json({ message: 'Id required' }, { status: 400 });

    await executeQuery(CS, `DELETE FROM ${TABLE} WHERE "Id"=:id`, { id: Id });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Failed to delete third-party service configuration:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
