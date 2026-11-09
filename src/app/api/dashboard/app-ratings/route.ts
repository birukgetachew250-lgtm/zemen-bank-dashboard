import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requireAuthenticatedSession } from '@/lib/auth-utils';

function maskCif(cif: string): string {
  const cleaned = String(cif || '').trim();
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 2)}${'*'.repeat(Math.max(2, cleaned.length - 4))}${cleaned.slice(-2)}`;
}

export async function GET(req: Request) {
  const session = await requireAuthenticatedSession();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '6', 10)));
  const ratingFilter = searchParams.get('rating') ? parseInt(searchParams.get('rating')!, 10) : null;

  const connStr = process.env.DEVICE_CONTROL_MODULE_DB_CONNECTION_STRING;
  if (!connStr) {
    return NextResponse.json({
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: [],
      page,
      pageSize,
      totalPages: 1,
      source: 'unconfigured',
    });
  }

  try {
    const statsQuery = `
      SELECT
        COUNT(*) AS "total",
        NVL(AVG("RatingScore"), 0) AS "avgScore",
        SUM(CASE WHEN "RatingScore" = 5 THEN 1 ELSE 0 END) AS "r5",
        SUM(CASE WHEN "RatingScore" = 4 THEN 1 ELSE 0 END) AS "r4",
        SUM(CASE WHEN "RatingScore" = 3 THEN 1 ELSE 0 END) AS "r3",
        SUM(CASE WHEN "RatingScore" = 2 THEN 1 ELSE 0 END) AS "r2",
        SUM(CASE WHEN "RatingScore" = 1 THEN 1 ELSE 0 END) AS "r1"
      FROM "DEVICE_CONTROL_MODULE"."AppRatings"
      WHERE "Status" = 'Active'
    `;

    const hasRatingFilter = ratingFilter !== null && ratingFilter >= 1 && ratingFilter <= 5;
    const filterClause = hasRatingFilter ? `AND "RatingScore" = :ratingScore` : '';
    const offset = (page - 1) * pageSize;

    const listQuery = `
      SELECT
        "Id",
        "CustomerDeviceId",
        "Cif",
        "PhoneNumber",
        "RatingScore",
        "Comment",
        "AppVersion",
        "DeviceOs",
        "DeviceOsVersion",
        "DeviceModel",
        "Status",
        "CreatedAt"
      FROM "DEVICE_CONTROL_MODULE"."AppRatings"
      WHERE "Status" = 'Active' ${filterClause}
      ORDER BY "CreatedAt" DESC
      OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY
    `;

    const countFilteredQuery = hasRatingFilter
      ? `SELECT COUNT(*) AS "cnt" FROM "DEVICE_CONTROL_MODULE"."AppRatings" WHERE "Status" = 'Active' AND "RatingScore" = :ratingScore`
      : null;

    const listBinds: Record<string, any> = { offset, pageSize };
    if (hasRatingFilter) {
      listBinds.ratingScore = ratingFilter;
    }

    const [statsRes, listRes, filteredCountRes] = await Promise.all([
      executeQuery(connStr, statsQuery),
      executeQuery(connStr, listQuery, listBinds),
      countFilteredQuery
        ? executeQuery(connStr, countFilteredQuery, { ratingScore: ratingFilter })
        : Promise.resolve(null),
    ]);

    const statsRow = statsRes?.rows?.[0] || {};
    const totalReviews = Number(statsRow.total) || 0;
    const averageRating = Number(Number(statsRow.avgScore || 0).toFixed(2));
    const distribution = {
      5: Number(statsRow.r5) || 0,
      4: Number(statsRow.r4) || 0,
      3: Number(statsRow.r3) || 0,
      2: Number(statsRow.r2) || 0,
      1: Number(statsRow.r1) || 0,
    };

    const filteredTotal = hasRatingFilter
      ? Number(filteredCountRes?.rows?.[0]?.cnt) || 0
      : totalReviews;

    const reviews = (listRes?.rows || []).map((row: any) => {
      const rawCif = String(row.Cif || '');
      return {
        id: row.Id,
        customerDeviceId: row.CustomerDeviceId,
        cif: rawCif,
        maskedCif: maskCif(rawCif),
        phoneNumber: row.PhoneNumber || '',
        ratingScore: Number(row.RatingScore) || 0,
        comment: row.Comment || '',
        appVersion: row.AppVersion || '',
        deviceOs: row.DeviceOs || '',
        deviceOsVersion: row.DeviceOsVersion || '',
        deviceModel: row.DeviceModel || '',
        status: row.Status || 'Active',
        createdAt: row.CreatedAt instanceof Date ? row.CreatedAt.toISOString() : String(row.CreatedAt || ''),
      };
    });

    return NextResponse.json({
      averageRating,
      totalReviews,
      filteredTotal,
      distribution,
      reviews,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filteredTotal / pageSize)),
      source: 'oracle',
    });
  } catch (error: any) {
    console.error('[AppRatings API] Error querying DEVICE_CONTROL_MODULE.AppRatings:', error?.message || error);
    return NextResponse.json({
      averageRating: 0,
      totalReviews: 0,
      filteredTotal: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: [],
      page,
      pageSize,
      totalPages: 1,
      source: 'error',
      error: 'Unable to reach DEVICE_CONTROL_MODULE.AppRatings',
    });
  }
}
