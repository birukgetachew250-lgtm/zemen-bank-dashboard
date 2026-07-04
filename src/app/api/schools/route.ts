import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

function generateId() {
  return 'sch_' + Math.random().toString(36).substring(2, 15);
}

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const cs = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    // We attempt to fetch from Oracle APP_CONTROL_MODULE
    const result = await executeQuery(cs, `
      SELECT "Id" as "id", "SchoolName" as "schoolName", "SchoolImage" as "schoolImage",
             "SchoolExternalId" as "schoolExternalId", "SchoolFlexAccount" as "schoolFlexAccount",
             "SchoolProductId" as "schoolProductId", "Status" as "status",
             "Description" as "description", "CreatedAt" as "createdAt",
             "UpdatedAt" as "updatedAt"
      FROM "APP_CONTROL_MODULE"."Schools"
      ORDER BY "SchoolName" ASC
    `);
    
    return NextResponse.json(result.rows || [], {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: any) {
    console.error('Failed to fetch schools from Oracle:', error);
    // If table doesn't exist yet, return empty array to prevent UI crash
    if (error.message && error.message.includes('ORA-00942')) {
      return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const { schoolName, schoolImage, schoolExternalId, schoolFlexAccount, schoolProductId, status, description } = body;

    if (!schoolName || !schoolExternalId || !schoolFlexAccount || !schoolProductId) {
      return NextResponse.json({ message: 'School name, external ID, flex account, and product ID are required.' }, { status: 400 });
    }

    const cs = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    const newId = generateId();
    const createdBy = (session as any).user?.email || 'system';

    // We do an INSERT query. Note that Oracle automatically commits if we use isDML=true in our executeQuery utility
    await executeQuery(cs, `
      INSERT INTO "APP_CONTROL_MODULE"."Schools" 
        ("Id", "SchoolName", "SchoolImage", "SchoolExternalId", "SchoolFlexAccount", "SchoolProductId", "Status", "Description", "CreatedBy", "UpdatedBy", "CreatedAt", "UpdatedAt")
      VALUES 
        (:id, :schoolName, :schoolImage, :schoolExternalId, :schoolFlexAccount, :schoolProductId, :status, :description, :createdBy, :updatedBy, SYSDATE, SYSDATE)
    `, {
      id: newId,
      schoolName,
      schoolImage: schoolImage || null,
      schoolExternalId,
      schoolFlexAccount,
      schoolProductId,
      status: status || 'Active',
      description: description || null,
      createdBy,
      updatedBy: createdBy
    });

    return NextResponse.json({ id: newId, schoolName, schoolExternalId, status: status || 'Active' }, { status: 201 });
  } catch (error: any) {
    if (error.message && error.message.includes('ORA-00001')) {
      return NextResponse.json({ message: 'A school with this external ID already exists.' }, { status: 409 });
    }
    console.error('Failed to create school in Oracle:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const { id, schoolName, schoolImage, schoolExternalId, schoolFlexAccount, schoolProductId, status, description } = body;

    if (!id) return NextResponse.json({ message: 'ID is required.' }, { status: 400 });

    const cs = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    const updatedBy = (session as any).user?.email || 'system';

    await executeQuery(cs, `
      UPDATE "APP_CONTROL_MODULE"."Schools"
      SET "SchoolName" = :schoolName,
          "SchoolImage" = :schoolImage,
          "SchoolExternalId" = :schoolExternalId,
          "SchoolFlexAccount" = :schoolFlexAccount,
          "SchoolProductId" = :schoolProductId,
          "Status" = :status,
          "Description" = :description,
          "UpdatedBy" = :updatedBy,
          "UpdatedAt" = SYSDATE
      WHERE "Id" = :id
    `, {
      id,
      schoolName,
      schoolImage: schoolImage || null,
      schoolExternalId,
      schoolFlexAccount,
      schoolProductId,
      status: status || 'Active',
      description: description || null,
      updatedBy
    });

    return NextResponse.json({ id, schoolName, status });
  } catch (error: any) {
    if (error.message && error.message.includes('ORA-00001')) {
      return NextResponse.json({ message: 'A school with this external ID already exists.' }, { status: 409 });
    }
    console.error('Failed to update school in Oracle:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: 'ID is required.' }, { status: 400 });

    const cs = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    await executeQuery(cs, `DELETE FROM "APP_CONTROL_MODULE"."Schools" WHERE "Id" = :id`, { id });
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Failed to delete school from Oracle:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
