
import { CustomerCategoriesClient } from "@/components/limits/CustomerCategoriesClient";
import { executeQuery } from "@/lib/oracle-db";

export interface Category {
    id: string;
    code: string;
    name: string;
    description: string;
}

async function getCategories(): Promise<Category[]> {
    try {
        const query = `SELECT "Id", "Code", "Name", "Description" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" ORDER BY "Name"`;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        return result.rows.map((row: any) => ({
            id: row.Id,
            code: row.Code,
            name: row.Name,
            description: row.Description,
        }));
    } catch (error) {
        console.error("Failed to fetch customer categories:", error);
        return [];
    }
}

export default async function CustomerCategoriesPage() {
    const initialItems = await getCategories();
    return (
        <div className="w-full h-full">
            <CustomerCategoriesClient initialItems={initialItems} />
        </div>
    );
}
