
import { TransactionTypesClient } from "@/components/limits/TransactionTypesClient";
import { executeQuery } from "@/lib/oracle-db";

export interface TransactionType {
    id: string;
    code: string;
    name: string;
    description: string;
}

async function getTransactionTypes(): Promise<TransactionType[]> {
    try {
        const query = `SELECT "Id", "Code", "Name", "Description" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" ORDER BY "Name"`;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        return result.rows.map((row: any) => ({
            id: row.Id,
            code: row.Code,
            name: row.Name,
            description: row.Description,
        }));
    } catch (error) {
        console.error("Failed to fetch transaction types:", error);
        return [];
    }
}

export default async function TransactionTypesPage() {
    const initialItems = await getTransactionTypes();
    return (
        <div className="w-full h-full">
            <TransactionTypesClient initialItems={initialItems} />
        </div>
    );
}
