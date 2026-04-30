import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."ChargeRules"';
const CATEGORY_MAP_TABLE = '"LIMIT_CHARGE_MODULE"."ChargeRuleCustomerCategories"';

function normalizeCategoryIds(rawCategoryIds: unknown, rawCategoryId: unknown): string[] {
  const fromArray = Array.isArray(rawCategoryIds)
    ? rawCategoryIds
        .map((value) => String(value || '').trim())
        .filter((value) => value.length > 0)
    : [];

  if (fromArray.length > 0) {
    return Array.from(new Set(fromArray));
  }

  const fallback = String(rawCategoryId || '').trim();
  return fallback ? [fallback] : [];
}

function parseDateTime(value: unknown): string | null {
  const normalized = String(value || '').trim();
  return normalized ? normalized : null;
}

export async function GET() {
  try {
    const query = `
      SELECT
        cr."Id" as "id",
        cr."CustomerCategoryId" as "customerCategoryId",
        cr."TransactionTypeId" as "transactionTypeId",
        cc."Name" as "category",
        (
          SELECT LISTAGG(map."CustomerCategoryId", ',') WITHIN GROUP (ORDER BY map."CustomerCategoryId")
          FROM ${CATEGORY_MAP_TABLE} map
          WHERE map."ChargeRuleId" = cr."Id"
        ) as "categoryIdsCsv",
        (
          SELECT LISTAGG(cat."Name", ', ') WITHIN GROUP (ORDER BY cat."Name")
          FROM ${CATEGORY_MAP_TABLE} map
          JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cat ON map."CustomerCategoryId" = cat."Id"
          WHERE map."ChargeRuleId" = cr."Id"
        ) as "categories",
        tt."Name" as "transactionType",
        cr."ServiceName" as "serviceName",
        cr."ChargeType" as "chargeType",
        cr."Percentage" as "percentage",
        cr."FixedAmount" as "fixedAmount",
        cr."VatPercentage" as "vatPercentage",
        cr."DisasterRiskPercentage" as "disasterRiskPercentage",
        cr."MinCharge" as "minCharge",
        cr."MaxCharge" as "maxCharge",
        cr."EffectiveFrom" as "effectiveFrom",
        cr."EffectiveTo" as "effectiveTo",
        cr."IsActive" as "isActive"
      FROM ${TABLE} cr
      LEFT JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON cr."CustomerCategoryId" = cc."Id"
      LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON cr."TransactionTypeId" = tt."Id"
      WHERE cr."IsActive" = 1
      ORDER BY cc."Name", tt."Name"
    `;

    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);

    if (!result.rows) {
      return NextResponse.json([]);
    }

    return NextResponse.json(
      result.rows.map((row: any) => {
        const categoryIds = row.categoryIdsCsv
          ? String(row.categoryIdsCsv)
              .split(',')
              .map((value: string) => value.trim())
              .filter(Boolean)
          : row.customerCategoryId
            ? [String(row.customerCategoryId)]
            : [];

        const categoryDisplay = row.categories || row.category || 'All Categories';

        return {
          id: row.id,
          customerCategoryId: row.customerCategoryId,
          customerCategoryIds: categoryIds,
          categories: categoryIds.length > 0 ? categoryDisplay : 'All Categories',
          transactionTypeId: row.transactionTypeId,
          transactionType: row.transactionType || 'All Types',
          serviceName: row.serviceName,
          chargeType: row.chargeType || 'FLAT',
          percentage: row.percentage,
          fixedAmount: row.fixedAmount,
          vatPercentage: row.vatPercentage,
          disasterRiskPercentage: row.disasterRiskPercentage,
          minCharge: row.minCharge,
          maxCharge: row.maxCharge,
          effectiveFrom: row.effectiveFrom,
          effectiveTo: row.effectiveTo,
        };
      })
    );
  } catch (error) {
    console.error('Failed to fetch charge rules:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      categoryIds,
      categoryId,
      transactionTypeId,
      serviceName,
      chargeType,
      percentage,
      fixedAmount,
      vatPercentage,
      disasterRiskPercentage,
      minCharge,
      maxCharge,
      effectiveFrom,
      effectiveTo,
    } = await req.json();

    const resolvedCategoryIds = normalizeCategoryIds(categoryIds, categoryId);
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO ${TABLE} (
        "Id", "CustomerCategoryId", "TransactionTypeId", "ServiceName", "ChargeType", "Percentage", "FixedAmount", "VatPercentage", "DisasterRiskPercentage", "MinCharge", "MaxCharge", "EffectiveFrom", "EffectiveTo", "IsActive", "InsertDate", "Version"
      )
      VALUES (
        :Id, :CustomerCategoryId, :TransactionTypeId, :ServiceName, :ChargeType, :Percentage, :FixedAmount, :VatPercentage, :DisasterRiskPercentage, :MinCharge, :MaxCharge,
        CASE WHEN :EffectiveFrom IS NOT NULL THEN TO_TIMESTAMP(:EffectiveFrom, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        CASE WHEN :EffectiveTo IS NOT NULL THEN TO_TIMESTAMP(:EffectiveTo, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        1, SYSTIMESTAMP, SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8)
      )
    `;

    const binds = {
      Id: id,
      CustomerCategoryId: resolvedCategoryIds[0] || null,
      TransactionTypeId: transactionTypeId || null,
      ServiceName: serviceName || null,
      ChargeType: chargeType || 'FLAT',
      Percentage: parseFloat(percentage) || 0,
      FixedAmount: parseFloat(fixedAmount) || 0,
      VatPercentage: vatPercentage !== undefined && vatPercentage !== '' ? parseFloat(vatPercentage) : 15,
      DisasterRiskPercentage:
        disasterRiskPercentage !== undefined && disasterRiskPercentage !== '' ? parseFloat(disasterRiskPercentage) : null,
      MinCharge: minCharge ? parseFloat(minCharge) : null,
      MaxCharge: maxCharge ? parseFloat(maxCharge) : null,
      EffectiveFrom: parseDateTime(effectiveFrom),
      EffectiveTo: parseDateTime(effectiveTo),
    };

    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);

    for (const customerCategoryId of resolvedCategoryIds) {
      const mapQuery = `
        INSERT INTO ${CATEGORY_MAP_TABLE} ("Id", "ChargeRuleId", "CustomerCategoryId", "InsertDate", "UpdateDate", "InsertUser", "UpdateUser", "Version")
        VALUES (SYS_GUID(), :ChargeRuleId, :CustomerCategoryId, SYSTIMESTAMP, SYSTIMESTAMP, 'system', 'system', SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))
      `;
      await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, mapQuery, {
        ChargeRuleId: id,
        CustomerCategoryId: customerCategoryId,
      });
    }

    let categories = 'All Categories';
    let typeName = 'All Types';

    if (resolvedCategoryIds.length > 0) {
      const categoryRes: any = await executeQuery(
        process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
        `SELECT LISTAGG("Name", ', ') WITHIN GROUP (ORDER BY "Name") AS "categories" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" WHERE "Id" IN (${resolvedCategoryIds.map((_, index) => `:category_${index}`).join(',')})`,
        Object.fromEntries(resolvedCategoryIds.map((idValue, index) => [`category_${index}`, idValue]))
      );
      if (categoryRes.rows?.[0]?.categories) {
        categories = categoryRes.rows[0].categories;
      }
    }

    if (transactionTypeId) {
      const typeRes: any = await executeQuery(
        process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
        `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" WHERE "Id" = :id`,
        { id: transactionTypeId }
      );
      if (typeRes.rows?.[0]?.Name) {
        typeName = typeRes.rows[0].Name;
      }
    }

    return NextResponse.json(
      {
        id,
        customerCategoryId: resolvedCategoryIds[0] || null,
        customerCategoryIds: resolvedCategoryIds,
        categories,
        transactionTypeId: transactionTypeId || null,
        transactionType: typeName,
        serviceName: serviceName || null,
        chargeType: chargeType || 'FLAT',
        percentage: parseFloat(percentage) || 0,
        fixedAmount: parseFloat(fixedAmount) || 0,
        vatPercentage: binds.VatPercentage,
        disasterRiskPercentage: binds.DisasterRiskPercentage,
        minCharge: binds.MinCharge,
        maxCharge: binds.MaxCharge,
        effectiveFrom: binds.EffectiveFrom,
        effectiveTo: binds.EffectiveTo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create charge rule:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const {
      id,
      categoryIds,
      categoryId,
      transactionTypeId,
      serviceName,
      chargeType,
      percentage,
      fixedAmount,
      vatPercentage,
      disasterRiskPercentage,
      minCharge,
      maxCharge,
      effectiveFrom,
      effectiveTo,
    } = await req.json();

    const resolvedCategoryIds = normalizeCategoryIds(categoryIds, categoryId);

    const query = `
      UPDATE ${TABLE} SET
        "CustomerCategoryId" = :CustomerCategoryId,
        "TransactionTypeId" = :TransactionTypeId,
        "ServiceName" = :ServiceName,
        "ChargeType" = :ChargeType,
        "Percentage" = :Percentage,
        "FixedAmount" = :FixedAmount,
        "VatPercentage" = :VatPercentage,
        "DisasterRiskPercentage" = :DisasterRiskPercentage,
        "MinCharge" = :MinCharge,
        "MaxCharge" = :MaxCharge,
        "EffectiveFrom" = CASE WHEN :EffectiveFrom IS NOT NULL THEN TO_TIMESTAMP(:EffectiveFrom, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        "EffectiveTo" = CASE WHEN :EffectiveTo IS NOT NULL THEN TO_TIMESTAMP(:EffectiveTo, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        "UpdateDate" = SYSTIMESTAMP
      WHERE "Id" = :Id
    `;

    const binds = {
      Id: id,
      CustomerCategoryId: resolvedCategoryIds[0] || null,
      TransactionTypeId: transactionTypeId || null,
      ServiceName: serviceName || null,
      ChargeType: chargeType || 'FLAT',
      Percentage: parseFloat(percentage) || 0,
      FixedAmount: parseFloat(fixedAmount) || 0,
      VatPercentage: vatPercentage !== undefined && vatPercentage !== '' ? parseFloat(vatPercentage) : 15,
      DisasterRiskPercentage:
        disasterRiskPercentage !== undefined && disasterRiskPercentage !== '' ? parseFloat(disasterRiskPercentage) : null,
      MinCharge: minCharge ? parseFloat(minCharge) : null,
      MaxCharge: maxCharge ? parseFloat(maxCharge) : null,
      EffectiveFrom: parseDateTime(effectiveFrom),
      EffectiveTo: parseDateTime(effectiveTo),
    };

    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);

    await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      `DELETE FROM ${CATEGORY_MAP_TABLE} WHERE "ChargeRuleId" = :id`,
      { id }
    );

    for (const customerCategoryId of resolvedCategoryIds) {
      const mapQuery = `
        INSERT INTO ${CATEGORY_MAP_TABLE} ("Id", "ChargeRuleId", "CustomerCategoryId", "InsertDate", "UpdateDate", "InsertUser", "UpdateUser", "Version")
        VALUES (SYS_GUID(), :ChargeRuleId, :CustomerCategoryId, SYSTIMESTAMP, SYSTIMESTAMP, 'system', 'system', SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))
      `;
      await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, mapQuery, {
        ChargeRuleId: id,
        CustomerCategoryId: customerCategoryId,
      });
    }

    let categories = 'All Categories';
    let typeName = 'All Types';

    if (resolvedCategoryIds.length > 0) {
      const categoryRes: any = await executeQuery(
        process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
        `SELECT LISTAGG("Name", ', ') WITHIN GROUP (ORDER BY "Name") AS "categories" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" WHERE "Id" IN (${resolvedCategoryIds.map((_, index) => `:category_${index}`).join(',')})`,
        Object.fromEntries(resolvedCategoryIds.map((idValue, index) => [`category_${index}`, idValue]))
      );
      if (categoryRes.rows?.[0]?.categories) {
        categories = categoryRes.rows[0].categories;
      }
    }

    if (transactionTypeId) {
      const typeRes: any = await executeQuery(
        process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
        `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" WHERE "Id" = :id`,
        { id: transactionTypeId }
      );
      if (typeRes.rows?.[0]?.Name) {
        typeName = typeRes.rows[0].Name;
      }
    }

    return NextResponse.json({
      id,
      customerCategoryId: resolvedCategoryIds[0] || null,
      customerCategoryIds: resolvedCategoryIds,
      categories,
      transactionTypeId: transactionTypeId || null,
      transactionType: typeName,
      serviceName: serviceName || null,
      chargeType: chargeType || 'FLAT',
      percentage: parseFloat(percentage) || 0,
      fixedAmount: parseFloat(fixedAmount) || 0,
      vatPercentage: binds.VatPercentage,
      disasterRiskPercentage: binds.DisasterRiskPercentage,
      minCharge: binds.MinCharge,
      maxCharge: binds.MaxCharge,
      effectiveFrom: binds.EffectiveFrom,
      effectiveTo: binds.EffectiveTo,
    });
  } catch (error) {
    console.error('Failed to update charge rule:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const query = `UPDATE ${TABLE} SET "IsActive" = 0, "UpdateDate" = SYSTIMESTAMP WHERE "Id" = :Id`;
    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { Id: id });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete charge rule:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}