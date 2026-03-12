'use client';

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

interface TransactionLog {
  Id: string;
  TransactionId: string;
  CorrelationId: string | null;
  ParentTransactionId: string | null;
  CIFNumber: string | null;
  CustomerName: string | null;
  CustomerCategory: string | null;
  debitAccount: string | null;
  DebitAccountName: string | null;
  DebitBranchCode: string | null;
  DebitCurrency: string | null;
  creditAccount: string | null;
  CreditAccountName: string | null;
  CreditBranchCode: string | null;
  CreditCurrency: string | null;
  CreditBankCode: string | null;
  CreditBankName: string | null;
  TransactionType: string | null;
  ServiceName: string | null;
  Amount: number;
  Currency: string;
  ExchangeRate: number | null;
  CreditAmount: number | null;
  Narration: string | null;
  FeeAmount: number | null;
  VatAmount: number | null;
  TotalCharge: number | null;
  TransactionStatus: string;
  IsApproved: number | null;
  ErrorCode: string | null;
  ErrorMessage: string | null;
  FlexcubeReference: string | null;
  FlexcubeStatus: string | null;
  ExternalReference: string | null;
  ExternalStatus: string | null;
  ExternalResponseCode: string | null;
  RtgsReference: string | null;
  SwitchReference: string | null;
  Channel: string | null;
  DeviceId: string | null;
  IpAddress: string | null;
  SessionId: string | null;
  UserAgent: string | null;
  TransactionDate: string;
  CompletionDate: string | null;
  Comments: string | null;
  InitiatedBy: string | null;
  SourceModule: string;
  InsertDate: string;
  InsertUser: string;
}

const statusColors: Record<string, string> = {
  INITIATED: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REVERSED: "bg-purple-100 text-purple-800",
};

export function TransactionLogsClient() {
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceModuleFilter, setSourceModuleFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (sourceModuleFilter) params.set("sourceModule", sourceModuleFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/transaction-logs?${params.toString()}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setTransactions(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch transaction logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, sourceModuleFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try { return new Date(dateStr).toLocaleString(); } catch { return dateStr; }
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null || amount === undefined) return "-";
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex gap-2 flex-1 min-w-[250px]">
            <Input
              placeholder="Search TxnID, CIF, name, reference..."
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="INITIATED">Initiated</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="REVERSED">Reversed</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Source Module"
            className="w-[150px]"
            value={sourceModuleFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSourceModuleFilter(e.target.value); setPage(1); }}
          />
          <Input type="date" className="w-[150px]" value={dateFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDateFrom(e.target.value); setPage(1); }} />
          <Input type="date" className="w-[150px]" value={dateTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDateTo(e.target.value); setPage(1); }} />
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
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>CIF</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Cur</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No transaction logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <>
                        <TableRow
                          key={tx.Id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedRow(expandedRow === tx.Id ? null : tx.Id)}
                        >
                          <TableCell>
                            {expandedRow === tx.Id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{tx.TransactionId}</TableCell>
                          <TableCell className="font-mono text-xs">{tx.CIFNumber || "-"}</TableCell>
                          <TableCell className="font-medium">{tx.CustomerName || "-"}</TableCell>
                          <TableCell>{tx.TransactionType || tx.ServiceName || "-"}</TableCell>
                          <TableCell className="text-right font-mono">{formatAmount(tx.Amount)}</TableCell>
                          <TableCell>{tx.Currency}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[tx.TransactionStatus] || "bg-gray-100 text-gray-800"}>
                              {tx.TransactionStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{tx.SourceModule}</TableCell>
                          <TableCell className="text-xs">{formatDate(tx.TransactionDate)}</TableCell>
                        </TableRow>
                        {expandedRow === tx.Id && (
                          <TableRow key={`${tx.Id}-detail`}>
                            <TableCell colSpan={10} className="bg-muted/30 p-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                                <DetailField label="Correlation ID" value={tx.CorrelationId} />
                                <DetailField label="Parent Txn ID" value={tx.ParentTransactionId} />
                                <DetailField label="Category" value={tx.CustomerCategory} />
                                <DetailField label="Debit Account" value={tx.debitAccount} />
                                <DetailField label="Debit Name" value={tx.DebitAccountName} />
                                <DetailField label="Debit Branch" value={tx.DebitBranchCode} />
                                <DetailField label="Debit Currency" value={tx.DebitCurrency} />
                                <DetailField label="Credit Account" value={tx.creditAccount} />
                                <DetailField label="Credit Name" value={tx.CreditAccountName} />
                                <DetailField label="Credit Branch" value={tx.CreditBranchCode} />
                                <DetailField label="Credit Currency" value={tx.CreditCurrency} />
                                <DetailField label="Credit Bank" value={tx.CreditBankName} />
                                <DetailField label="Service" value={tx.ServiceName} />
                                <DetailField label="Exchange Rate" value={tx.ExchangeRate != null ? String(tx.ExchangeRate) : null} />
                                <DetailField label="Credit Amount" value={formatAmount(tx.CreditAmount)} />
                                <DetailField label="Narration" value={tx.Narration} />
                                <DetailField label="Fee" value={formatAmount(tx.FeeAmount)} />
                                <DetailField label="VAT" value={formatAmount(tx.VatAmount)} />
                                <DetailField label="Total Charge" value={formatAmount(tx.TotalCharge)} />
                                <DetailField label="Approved" value={tx.IsApproved === 1 ? "Yes" : tx.IsApproved === 0 ? "No" : null} />
                                <DetailField label="Error Code" value={tx.ErrorCode} />
                                <DetailField label="Error Message" value={tx.ErrorMessage} />
                                <DetailField label="Flexcube Ref" value={tx.FlexcubeReference} />
                                <DetailField label="Flexcube Status" value={tx.FlexcubeStatus} />
                                <DetailField label="External Ref" value={tx.ExternalReference} />
                                <DetailField label="External Status" value={tx.ExternalStatus} />
                                <DetailField label="RTGS Ref" value={tx.RtgsReference} />
                                <DetailField label="Switch Ref" value={tx.SwitchReference} />
                                <DetailField label="Channel" value={tx.Channel} />
                                <DetailField label="Device ID" value={tx.DeviceId} />
                                <DetailField label="IP Address" value={tx.IpAddress} />
                                <DetailField label="Session ID" value={tx.SessionId} />
                                <DetailField label="User Agent" value={tx.UserAgent} />
                                <DetailField label="Completed" value={formatDate(tx.CompletionDate)} />
                                <DetailField label="Comments" value={tx.Comments} />
                                <DetailField label="Initiated By" value={tx.InitiatedBy} />
                                <DetailField label="Logged At" value={formatDate(tx.InsertDate)} />
                                <DetailField label="Logged By" value={tx.InsertUser} />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {transactions.length > 0 ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="text-sm">Page {page} of {totalPages || 1}</span>
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

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value || "-"}</span>
    </div>
  );
}
