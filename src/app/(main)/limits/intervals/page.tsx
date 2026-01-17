
import { PeriodIntervalsClient } from "@/components/limits/PeriodIntervalsClient";
import { executeQuery } from "@/lib/oracle-db";

export interface Interval {
    id: string;
    code: string;
    name: string;
    days: number;
}

async function getIntervals(): Promise<Interval[]> {
    try {
        const query = `SELECT "Id", "Code", "Name", "Days" FROM "LIMIT_CHARGE_MODULE"."PeriodIntervals" ORDER BY "Days"`;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        return result.rows.map((row: any) => ({
            id: row.Id,
            code: row.Code,
            name: row.Name,
            days: row.Days,
        }));
    } catch (error) {
        console.error("Failed to fetch intervals:", error);
        return [];
    }
}

export default async function IntervalsPage() {
    const initialItems = await getIntervals();
    return (
        <div className="w-full h-full">
            <PeriodIntervalsClient initialItems={initialItems} />
        </div>
    );
}
