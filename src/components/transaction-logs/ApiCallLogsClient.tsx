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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface ApiCallLog {
  Id: string;
  TransactionId: string;
  CorrelationId: string | null;
  ApiName: string;
  ApiOperation: string | null;
  EndpointUrl: string | null;
  HttpMethod: string | null;
  RequestContentType: string | null;
  RequestHeaders: string | null;
  RequestBody: string | null;
  RequestTimestamp: string;
  ResponseStatusCode: string | null;
  ResponseContentType: string | null;
  ResponseHeaders: string | null;
  ResponseBody: string | null;
  ResponseTimestamp: string | null;
  DurationMs: number;
  IsSuccess: number;
  ErrorCode: string | null;
  ErrorMessage: string | null;
  AttemptNumber: number;
  MaxAttempts: number;
  SourceModule: string;
  InitiatedBy: string | null;
  InsertDate: string;
  InsertUser: string;
}

const methodColors: Record<string, string> = {
  GET: "bg-blue-100 text-blue-800",
  POST: "bg-green-100 text-green-800",
  PUT: "bg-yellow-100 text-yellow-800",
  DELETE: "bg-red-100 text-red-800",
};

export function ApiCallLogsClient() {
  const [logs, setLogs] = useState<ApiCallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [apiNameFilter, setApiNameFilter] = useState("");
  const [successFilter, setSuccessFilter] = useState("");
  const [sourceModuleFilter, setSourceModuleFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [bodyDialog, setBodyDialog] = useState<{ title: string; content: string } | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) params.set("search", search);
      if (apiNameFilter) params.set("apiName", apiNameFilter);
      if (successFilter) params.set("isSuccess", successFilter);
      if (sourceModuleFilter) params.set("sourceModule", sourceModuleFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/transaction-logs/api-calls?${params.toString()}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setLogs(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch API call logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, apiNameFilter, successFilter, sourceModuleFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try { return new Date(dateStr).toLocaleString(); } catch { return dateStr; }
  };

  const formatBody = (body: string | null): string => {
    if (!body) return "";
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  };

  const openBodyViewer = (title: string, content: string | null) => {
    if (!content) return;
    setBodyDialog({ title, content: formatBody(content) });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>API Call Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex gap-2 flex-1 min-w-[250px]">
              <Input
                placeholder="Search TxnID, correlation, URL, error..."
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={apiNameFilter || "ALL"} onValueChange={(v: string) => { setApiNameFilter(v === "ALL" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All APIs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All APIs</SelectItem>
                <SelectItem value="FLEXCUBE">Flexcube</SelectItem>
                <SelectItem value="TELEBIRR">Telebirr</SelectItem>
                <SelectItem value="MPESA">M-Pesa</SelectItem>
                <SelectItem value="OTHER_BANK">Other Bank</SelectItem>
                <SelectItem value="ETHSWITCH">EthSwitch</SelectItem>
              </SelectContent>
            </Select>
            <Select value={successFilter || "ALL"} onValueChange={(v: string) => { setSuccessFilter(v === "ALL" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Results</SelectItem>
                <SelectItem value="true">Success</SelectItem>
                <SelectItem value="false">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Source Module"
              className="w-[140px]"
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
                      <TableHead>API</TableHead>
                      <TableHead>Operation</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No API call logs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <>
                          <TableRow
                            key={log.Id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setExpandedRow(expandedRow === log.Id ? null : log.Id)}
                          >
                            <TableCell>
                              {expandedRow === log.Id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{log.TransactionId}</TableCell>
                            <TableCell className="font-medium">{log.ApiName}</TableCell>
                            <TableCell className="text-xs">{log.ApiOperation || "-"}</TableCell>
                            <TableCell>
                              {log.HttpMethod ? (
                                <Badge className={methodColors[log.HttpMethod] || "bg-gray-100 text-gray-800"}>
                                  {log.HttpMethod}
                                </Badge>
                              ) : "-"}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{log.ResponseStatusCode || "-"}</TableCell>
                            <TableCell className="font-mono text-xs">{log.DurationMs}ms</TableCell>
                            <TableCell>
                              <Badge className={log.IsSuccess === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {log.IsSuccess === 1 ? "Success" : "Failed"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{log.SourceModule}</TableCell>
                            <TableCell className="text-xs">{formatDate(log.RequestTimestamp)}</TableCell>
                          </TableRow>
                          {expandedRow === log.Id && (
                            <TableRow key={`${log.Id}-detail`}>
                              <TableCell colSpan={10} className="bg-muted/30 p-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                                  <DetailField label="Correlation ID" value={log.CorrelationId} />
                                  <DetailField label="Endpoint" value={log.EndpointUrl} />
                                  <DetailField label="Request Content-Type" value={log.RequestContentType} />
                                  <DetailField label="Response Content-Type" value={log.ResponseContentType} />
                                  <DetailField label="Response Time" value={formatDate(log.ResponseTimestamp)} />
                                  <DetailField label="Error Code" value={log.ErrorCode} />
                                  <DetailField label="Error Message" value={log.ErrorMessage} />
                                  <DetailField label="Attempt" value={`${log.AttemptNumber} / ${log.MaxAttempts}`} />
                                  <DetailField label="Initiated By" value={log.InitiatedBy} />
                                  <DetailField label="Logged At" value={formatDate(log.InsertDate)} />
                                  <DetailField label="Logged By" value={log.InsertUser} />
                                </div>
                                <div className="flex gap-2 mt-4">
                                  {log.RequestHeaders && (
                                    <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); openBodyViewer("Request Headers", log.RequestHeaders); }}>
                                      <Eye className="h-3 w-3 mr-1" /> Req Headers
                                    </Button>
                                  )}
                                  {log.RequestBody && (
                                    <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); openBodyViewer("Request Body", log.RequestBody); }}>
                                      <Eye className="h-3 w-3 mr-1" /> Req Body
                                    </Button>
                                  )}
                                  {log.ResponseHeaders && (
                                    <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); openBodyViewer("Response Headers", log.ResponseHeaders); }}>
                                      <Eye className="h-3 w-3 mr-1" /> Res Headers
                                    </Button>
                                  )}
                                  {log.ResponseBody && (
                                    <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); openBodyViewer("Response Body", log.ResponseBody); }}>
                                      <Eye className="h-3 w-3 mr-1" /> Res Body
                                    </Button>
                                  )}
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
                  Showing {logs.length > 0 ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, total)} of {total}
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

      {/* Body Viewer Dialog */}
      <Dialog open={!!bodyDialog} onOpenChange={(open: boolean) => !open && setBodyDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{bodyDialog?.title}</DialogTitle>
          </DialogHeader>
          <pre className="bg-muted rounded-md p-4 overflow-auto max-h-[60vh] text-xs font-mono whitespace-pre-wrap break-all">
            {bodyDialog?.content}
          </pre>
        </DialogContent>
      </Dialog>
    </>
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
