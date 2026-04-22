import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."CustomerCategories"';

interface ImportRow {
  code: string;
  name: string;
  description?: string;
}

export async function POST(req: Request) {
  try {
    const { rows } = (await req.json()) as { rows: ImportRow[] };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: 'No rows provided' }, { status: 400 });
    }

    // Fetch existing codes to skip duplicates
    const existingResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      `SELECT "Code" FROM ${TABLE}`
    );
    const existingCodes = new Set<string>(
      (existingResult.rows || []).map((r: any) => String(r.Code || '').toUpperCase())
    );

    const created: ImportRow & { id: string }[] = [];

    for (const row of rows) {
      const code = String(row.code || '').trim();
      const name = String(row.name || '').trim();
      if (!code || !name) continue;
      if (existingCodes.has(code.toUpperCase())) continue; // skip duplicate

      const id = crypto.randomUUID();
      const query = `INSERT INTO ${TABLE} ("Id", "Code", "Name", "Description", "Version") VALUES (:Id, :Code, :Name, :Description, SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))`;
      await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, {
        Id: id,
        Code: code,
        Name: name,
        Description: row.description || null,
      });

      existingCodes.add(code.toUpperCase());
      created.push({ id, code, name, description: row.description || '' });
    }

    return NextResponse.json({ created }, { status: 201 });
  } catch (error) {
    console.error('Bulk import customer categories failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
