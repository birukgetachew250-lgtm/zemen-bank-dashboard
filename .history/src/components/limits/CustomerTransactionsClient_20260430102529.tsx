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

interface CustomerTransaction {
  Id: string;
  CIFNumber: string;
  CustomerName: string;
  CustomerCategory: string;
  debitAccount: string | null;
  creditAccount: string | null;
  CreditAccountName: string | null;
  DebitBranchCode: string | null;
  DebitCurrency: string | null;
  CreditBranchCode: string | null;
  CreditCurrency: string | null;
  CreditBankCode: string | null;
  CreditBankName: string | null;
  TransactionTypeName: string | null;
  ServiceName: string | null;
  Amount: number;
  Currency: string;
  ExchangeRate: number | null;
  CreditAmount: number | null;
  TransactionDate: string;
  Narration: string | null;
  FeeAmount: number | null;
  VatAmount: number | null;
  TotalCharge: number | null;
  LimitValidationPassed: number | null;
  LimitValidationMessage: string | null;
  TransactionStatus: string;
  IsApproved: number | null;
  ErrorCode: string | null;
  ErrorMessage: string | null;
  RetryCount: number | null;
  FlexcubeReference: string | null;
  FlexcubeStatus: string | null;
  ExternalReference: string | null;
  ExternalStatus: string | null;
  ExternalResponseCode: string | null;
  ExternalResponseMessage: string | null;
  RtgsReference: string | null;
  SwitchReference: string | null;
  ReconciliationStatus: string | null;
  Channel: string | null;
  IpAddress: string | null;
  CompletionDate: string | null;
  Comments: string | null;
  CreateDate: string;
}

const statusColors: Record<string, string> = {
  INITIATED: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REVERSED: "bg-purple-100 text-purple-800",
};

const NO_LIMIT_CONFIGURED_MESSAGE = "No limit is configured for this transaction.";

function formatLimitValidationMessage(message: string | null) {
  if (!message) return null;
  if (message.trim() === NO_LIMIT_CONFIGURED_MESSAGE) {
    return "Transaction blocked: No limit rule is configured for this service/customer category. Please configure a limit rule before processing.";
  }
  return message;
}

export function CustomerTransactionsClient() {
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/limits/transactions?${params.toString()}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setTransactions(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null || amount === undefined) return "-";
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex gap-2 flex-1 min-w-[250px]">
            <Input
              placeholder="Search CIF, name, reference..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
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
            type="date"
            className="w-[160px]"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            placeholder="From"
          />
          <Input
            type="date"
            className="w-[160px]"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            placeholder="To"
          />
        </div>

        {/* Table */}
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
                    <TableHead>CIF</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No transactions found.
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
                            {expandedRow === tx.Id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{tx.CIFNumber}</TableCell>
                          <TableCell className="font-medium">{tx.CustomerName}</TableCell>
                          <TableCell>{tx.TransactionTypeName || tx.ServiceName || "-"}</TableCell>
                          <TableCell className="text-right font-mono">{formatAmount(tx.Amount)}</TableCell>
                          <TableCell>{tx.Currency}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[tx.TransactionStatus] || "bg-gray-100 text-gray-800"}>
                              {tx.TransactionStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{formatDate(tx.TransactionDate)}</TableCell>
                          <TableCell className="font-mono text-xs">{tx.ExternalReference || tx.FlexcubeReference || "-"}</TableCell>
                        </TableRow>
                        {expandedRow === tx.Id && (
                          <TableRow key={`${tx.Id}-detail`}>
                            <TableCell colSpan={9} className="bg-muted/30 p-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                                <DetailField label="Category" value={tx.CustomerCategory} />
                                <DetailField label="Debit Account" value={tx.debitAccount} />
                                <DetailField label="Debit Branch" value={tx.DebitBranchCode} />
                                <DetailField label="Debit Currency" value={tx.DebitCurrency} />
                                <DetailField label="Credit Account" value={tx.creditAccount} />
                                <DetailField label="Credit Name" value={tx.CreditAccountName} />
                                <DetailField label="Credit Branch" value={tx.CreditBranchCode} />
                                <DetailField label="Credit Currency" value={tx.CreditCurrency} />
                                <DetailField label="Credit Bank" value={tx.CreditBankName} />
                                <DetailField label="Service" value={tx.ServiceName} />
                                <DetailField label="Exchange Rate" value={tx.ExchangeRate ? String(tx.ExchangeRate) : null} />
                                <DetailField label="Credit Amount" value={formatAmount(tx.CreditAmount)} />
                                <DetailField label="Narration" value={tx.Narration} />
                                <DetailField label="Fee" value={formatAmount(tx.FeeAmount)} />
                                <DetailField label="VAT" value={formatAmount(tx.VatAmount)} />
                                <DetailField label="Total Charge" value={formatAmount(tx.TotalCharge)} />
                                <DetailField
                                  label="Limit Passed"
                                  value={tx.LimitValidationPassed === 1 ? "Yes" : tx.LimitValidationPassed === 0 ? "No" : null}
                                />
                                <DetailField label="Limit Message" value={formatLimitValidationMessage(tx.LimitValidationMessage)} />
                                <DetailField label="Approved" value={tx.IsApproved === 1 ? "Yes" : tx.IsApproved === 0 ? "No" : null} />
                                <DetailField label="Error Code" value={tx.ErrorCode} />
                                <DetailField label="Error Message" value={tx.ErrorMessage} />
                                <DetailField label="Retry Count" value={tx.RetryCount != null ? String(tx.RetryCount) : null} />
                                <DetailField label="Flexcube Ref" value={tx.FlexcubeReference} />
                                <DetailField label="Flexcube Status" value={tx.FlexcubeStatus} />
                                <DetailField label="External Ref" value={tx.ExternalReference} />
                                <DetailField label="External Status" value={tx.ExternalStatus} />
                                <DetailField label="External Response" value={tx.ExternalResponseMessage} />
                                <DetailField label="RTGS Ref" value={tx.RtgsReference} />
                                <DetailField label="Switch Ref" value={tx.SwitchReference} />
                                <DetailField label="Reconciliation" value={tx.ReconciliationStatus} />
                                <DetailField label="Channel" value={tx.Channel} />
                                <DetailField label="IP Address" value={tx.IpAddress} />
                                <DetailField label="Completed" value={formatDate(tx.CompletionDate)} />
                                <DetailField label="Comments" value={tx.Comments} />
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
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
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
