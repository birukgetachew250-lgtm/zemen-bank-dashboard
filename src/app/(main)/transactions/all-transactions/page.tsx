
import { AllTransactionsClient } from "@/components/transactions/AllTransactionsClient";
import { Transaction } from "@/types/transaction";
import { db } from "@/lib/db";
import { subDays } from "date-fns";

async function getInitialTransactions(): Promise<Transaction[]> {
    try {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        const data = db.prepare(`
            SELECT 
                t.id, 
                t.timestamp,
                t.type,
                t.amount,
                t.fee,
                t.status,
                t.channel,
                c.name as from_customer_name,
                c.phone as from_customer_phone,
                t.to_account
            FROM transactions t
            JOIN customers c ON t.customerId = c.id
            WHERE t.timestamp >= ?
            ORDER BY t.timestamp DESC
        `).all(thirtyDaysAgo);
        
        return data.map((row: any) => ({
            id: row.id,
            timestamp: row.timestamp,
            type: row.type,
            amount: row.amount,
            fee: row.fee,
            status: row.status,
            channel: row.channel,
            from: {
                name: row.from_customer_name,
                account: row.from_customer_phone,
            },
            to: {
                name: "Receiver Name", // Mocked for now
                account: row.to_account
            }
        }));

    } catch (error) {
        console.error("Failed to fetch initial transactions:", error);
        return [];
    }
}


export default async function AllTransactionsPage() {
    const initialTransactions = await getInitialTransactions();
    return (
        <div className="w-full h-full">
            <AllTransactionsClient initialTransactions={initialTransactions} />
        </div>
    );
}



    