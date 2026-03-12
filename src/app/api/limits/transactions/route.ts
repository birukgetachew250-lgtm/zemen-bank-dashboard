import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle-db";
import { decrypt } from "@/lib/crypto";

const connStr = process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const offset = (page - 1) * pageSize;
    const binds: Record<string, any> = {};
    const conditions: string[] = [];

    if (search) {
      conditions.push(
        `(t."CIFNumber" LIKE :search OR t."CustomerName" LIKE :search OR t."ExternalReference" LIKE :search OR t."FlexcubeReference" LIKE :search)`
      );
      binds.search = `%${search}%`;
    }

    if (status) {
      conditions.push(`t."TransactionStatus" = :status`);
      binds.status = status;
    }

    if (dateFrom) {
      conditions.push(`t."TransactionDate" >= TO_TIMESTAMP(:dateFrom, 'YYYY-MM-DD"T"HH24:MI:SS')`);
      binds.dateFrom = dateFrom;
    }

    if (dateTo) {
      conditions.push(`t."TransactionDate" <= TO_TIMESTAMP(:dateTo, 'YYYY-MM-DD"T"HH24:MI:SS')`);
      binds.dateTo = dateTo;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count query
    const countResult = await executeQuery(
      connStr,
      `SELECT COUNT(*) AS "total" FROM "LIMIT_CHARGE_MODULE"."CustomerTransactions" t ${whereClause}`,
      binds
    );
    const total = countResult.rows?.[0]?.total || 0;

    // Data query
    const query = `
      SELECT t."Id", t."CIFNumber", t."CustomerName", t."CustomerCategory",
        t."DebitAccountEncrypted", t."DebitBranchCode", t."DebitCurrency",
        t."CreditAccountEncrypted", t."CreditAccountName", t."CreditBranchCode", t."CreditCurrency",
        t."CreditBankCode", t."CreditBankName",
        t."TransactionTypeId", tt."Name" AS "TransactionTypeName",
        t."ServiceName", t."Amount", t."Currency", t."ExchangeRate", t."CreditAmount",
        t."TransactionDate", t."Narration",
        t."FeeAmount", t."VatAmount", t."TotalCharge",
        t."AppliedChargeRuleId", t."AppliedLimitRuleId", t."AppliedExceptionId",
        t."LimitValidationPassed", t."LimitValidationMessage",
        t."TransactionStatus", t."IsApproved",
        t."ErrorCode", t."ErrorMessage",
        t."RetryCount", t."LastRetryDate",
        t."IntegrationTransactionId", t."FlexcubeReference", t."FlexcubeStatus",
        t."ExternalReference", t."ExternalStatus", t."ExternalResponseCode", t."ExternalResponseMessage",
        t."RtgsReference", t."SwitchReference",
        t."ReconciliationStatus", t."ReconciliationDate", t."ReconciliationNotes", t."ReconciledBy",
        t."Channel", t."DeviceId", t."IpAddress", t."SessionId",
        t."FlexcubePostingDate", t."FlexcubeCompletionDate",
        t."ExternalCallDate", t."ExternalResponseDate", t."CompletionDate",
        t."Comments",
        t."CreatedBy", t."CreateDate", t."UpdatedBy", t."UpdateDate"
      FROM "LIMIT_CHARGE_MODULE"."CustomerTransactions" t
      LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON t."TransactionTypeId" = tt."Id"
      ${whereClause}
      ORDER BY t."TransactionDate" DESC
      OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY
    `;

    const dataResult = await executeQuery(connStr, query, {
      ...binds,
      offset,
      pageSize,
    });

    const rows = (dataResult.rows || []).map((row: any) => ({
      ...row,
      debitAccount: row.DebitAccountEncrypted ? decrypt(row.DebitAccountEncrypted) : null,
      creditAccount: row.CreditAccountEncrypted ? decrypt(row.CreditAccountEncrypted) : null,
      DebitAccountEncrypted: undefined,
      CreditAccountEncrypted: undefined,
    }));

    return NextResponse.json({
      data: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error("CustomerTransactions GET error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
