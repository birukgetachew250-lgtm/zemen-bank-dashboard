"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface MiniAppTransaction {
  TransactionId: string;
  MiniAppName: string | null;
  UserId: string;
  Amount: number;
  Currency: string;
  Status: number;
  TransactionType: string | null;
  Reference: string | null;
  ExternalReference: string | null;
  Description: string | null;
  CreateDate: string;
  UpdateDate: string | null;
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  1: { label: "Success", color: "bg-green-100 text-green-800" },
  2: { label: "Failed", color: "bg-red-100 text-red-800" },
  3: { label: "Reversed", color: "bg-purple-100 text-purple-800" },
};

export default function MiniAppTransactionsClient() {
  const [data, setData] = useState<MiniAppTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const totalPages = Math.ceil(total / limit) || 1;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/app-control/mini-app-transactions?${params.toString()}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setData(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to fetch mini app transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => { setPage(1); setSearch(searchInput); };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleString(); } catch { return d; }
  };

  const formatAmount = (a: number | null) => {
    if (a === null || a === undefined) return "-";
    return a.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mini App Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex gap-2 flex-1 min-w-[250px]">
            <Input
              placeholder="Search user, reference, description..."
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select value={statusFilter || "ALL"} onValueChange={(v) => { setStatusFilter(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="0">Pending</SelectItem>
              <SelectItem value="1">Success</SelectItem>
              <SelectItem value="2">Failed</SelectItem>
              <SelectItem value="3">Reversed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mini App</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((tx) => {
                      const s = statusMap[tx.Status] || { label: String(tx.Status), color: "bg-gray-100 text-gray-800" };
                      return (
                        <TableRow key={tx.TransactionId}>
                          <TableCell className="font-medium">{tx.MiniAppName || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{tx.UserId}</TableCell>
                          <TableCell>{tx.TransactionType || "-"}</TableCell>
                          <TableCell className="text-right font-mono">{formatAmount(tx.Amount)}</TableCell>
                          <TableCell>{tx.Currency}</TableCell>
                          <TableCell><Badge className={s.color}>{s.label}</Badge></TableCell>
                          <TableCell className="font-mono text-xs">{tx.Reference || tx.ExternalReference || "-"}</TableCell>
                          <TableCell className="text-xs">{formatDate(tx.CreateDate)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {data.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="text-sm">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
