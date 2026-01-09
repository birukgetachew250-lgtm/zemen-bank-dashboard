import { AllTransactionsClient } from "@/components/transactions/AllTransactionsClient";
import { Transaction } from "@/types/transaction";
import { systemDb } from "@/lib/system-db";
import { subDays } from "date-fns";

async function getInitialTransactions(): Promise<Transaction[]> {
    try {
        const thirtyDaysAgo = subDays(new Date(), 30);
        const data = await systemDb.transaction.findMany({
            where: {
                timestamp: {
                    gte: thirtyDaysAgo,
                },
            },
            include: {
                customer: {
                    select: { name: true, phone: true }
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 100 // Limit initial load
        });
        
        return data.map((row: any) => ({
            id: row.id,
            timestamp: row.timestamp.toISOString(),
            type: row.type,
            amount: row.amount,
            fee: row.fee,
            status: row.status,
            channel: row.channel,
            from: {
                name: row.customer.name,
                account: row.customer.phone,
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
