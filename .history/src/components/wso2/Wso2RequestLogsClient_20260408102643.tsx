"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, RefreshCw, GitFork, FileText, X } from "lucide-react";
import RequestFlowDiagram, { FlowNode } from "./RequestFlowDiagram";
import { cn } from "@/lib/utils";

interface LogEntry {
  ID: string;
  REQUEST_ID: string;
  PARENT_REQUEST_ID: string | null;
  SERVICE_NAME: string;
  DEPTH_LEVEL: number;
  HTTP_METHOD: string | null;
  ENDPOINT_URL: string | null;
  HTTP_STATUS_CODE: number | null;
  RESPONSE_PAYLOAD: string | null;
  REQUEST_PAYLOAD: string | null;
  WSO2_STATUS: string | null;
  ERROR_CODE: string | null;
  STATUS: string;
  EXECUTION_TIME_MS: number | null;
  INITIATED_BY: string | null;
  REMARKS: string | null;
  CREATED_DATE: string;
  UPDATED_DATE: string;
  CREATED_BY: string;
  [key: string]: any;
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  const variant =
    s === "SUCCESS" || s === "COMPLETED" ? "default" :
    s === "FAILED" || s === "ERROR" ? "destructive" :
    s === "PENDING" || s === "IN_PROGRESS" ? "secondary" : "outline";
  return <Badge variant={variant}>{status}</Badge>;
}

function formatDate(d: string | null) {
  if (!d) return "-";
  try { return new Date(d).toLocaleString(); } catch { return d; }
}

function JsonViewer({ content }: { content: string | null }) {
  if (!content) return <span className="text-muted-foreground text-sm">—</span>;
  try {
    const parsed = JSON.parse(content);
    return (
      <pre className="bg-muted rounded-md p-3 text-xs overflow-auto max-h-64 whitespace-pre-wrap break-all">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  } catch {
    return (
      <pre className="bg-muted rounded-md p-3 text-xs overflow-auto max-h-64 whitespace-pre-wrap break-all">
        {content}
      </pre>
    );
  }
}

export default function Wso2RequestLogsClient() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterService, setFilterService] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Detail dialog
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [detailTab, setDetailTab] = useState("details");

  // Flow dialog
  const [flowLog, setFlowLog] = useState<LogEntry | null>(null);
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [flowLoading, setFlowLoading] = useState(false);
  const [flowSelectedNode, setFlowSelectedNode] = useState<FlowNode | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "ALL") params.set("status", filterStatus);
      if (filterService) params.set("service", filterService);
      if (filterFrom) params.set("from", filterFrom);
      if (filterTo) params.set("to", filterTo);
      params.set("limit", "200");
      const res = await fetch(`/api/wso2/request-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error", description: "Failed to fetch request logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterService, filterFrom, filterTo, toast]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const openFlow = async (log: LogEntry) => {
    setFlowLog(log);
    setFlowNodes([]);
    setFlowSelectedNode(null);
    setFlowLoading(true);
    try {
      const res = await fetch(`/api/wso2/request-logs/${log.ID}/flow`);
      if (!res.ok) throw new Error("Failed to load flow");
      const data = await res.json();
      setFlowNodes(data.nodes || []);
    } catch {
      toast({ title: "Error", description: "Could not load request flow", variant: "destructive" });
    } finally {
      setFlowLoading(false);
    }
  };

  const filteredLogs = search
    ? logs.filter((l) =>
        [l.SERVICE_NAME, l.REQUEST_ID, l.STATUS, l.ERROR_CODE, l.INITIATED_BY]
          .some((v) => v && String(v).toLowerCase().includes(search.toLowerCase()))
      )
    : logs;

  // Unique service names for filter dropdown
  const serviceNames = Array.from(new Set(logs.map((l) => l.SERVICE_NAME).filter(Boolean)));

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">WSO2 Request Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px]">
              <Label className="text-xs mb-1 block">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <Label className="text-xs mb-1 block">Service</Label>
              <Select value={filterService || "ALL"} onValueChange={(v: string) => setFilterService(v === "ALL" ? "" : v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Services</SelectItem>
                  {serviceNames.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <Label className="text-xs mb-1 block">From Date</Label>
              <Input type="date" value={filterFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterFrom(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <Label className="text-xs mb-1 block">To Date</Label>
              <Input type="date" value={filterTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterTo(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="flex-1 min-w-[180px]">
              <Label className="text-xs mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-sm"
                  placeholder="Service, Request ID…"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Button size="sm" onClick={fetchLogs} variant="outline" className="h-8">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>HTTP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error Code</TableHead>
                    <TableHead>Exec (ms)</TableHead>
                    <TableHead>Depth</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        No request logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => {
                      const isFailed = ["FAILED", "ERROR"].includes((log.STATUS || "").toUpperCase());
                      return (
                        <TableRow
                          key={log.ID}
                          className={cn(isFailed && "bg-red-50/60 dark:bg-red-950/20")}
                        >
                          <TableCell className="font-medium">{log.SERVICE_NAME}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">{log.REQUEST_ID}</TableCell>
                          <TableCell>{log.HTTP_METHOD ? <Badge variant="outline" className="text-xs">{log.HTTP_METHOD}</Badge> : "—"}</TableCell>
                          <TableCell className={cn("font-mono text-sm", log.HTTP_STATUS_CODE && log.HTTP_STATUS_CODE >= 400 ? "text-red-500" : "text-green-600")}>
                            {log.HTTP_STATUS_CODE || "—"}
                          </TableCell>
                          <TableCell><StatusBadge status={log.STATUS} /></TableCell>
                          <TableCell className="text-red-500 text-xs">{log.ERROR_CODE || "—"}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{log.EXECUTION_TIME_MS ?? "—"}</TableCell>
                          <TableCell className="text-center">{log.DEPTH_LEVEL}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(log.CREATED_DATE)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => { setSelectedLog(log); setDetailTab("details"); }}
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn("h-7 px-2", isFailed && "text-red-500 hover:text-red-600")}
                                onClick={() => openFlow(log)}
                                title="View request flow"
                              >
                                <GitFork className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Request Detail</span>
                <StatusBadge status={selectedLog.STATUS} />
              </DialogTitle>
            </DialogHeader>
            <Tabs value={detailTab} onValueChange={setDetailTab}>
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="request">Request Payload</TabsTrigger>
                <TabsTrigger value="response">Response Payload</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {[
                    ["ID", selectedLog.ID],
                    ["Request ID", selectedLog.REQUEST_ID],
                    ["Parent Request ID", selectedLog.PARENT_REQUEST_ID || "—"],
                    ["Service Name", selectedLog.SERVICE_NAME],
                    ["HTTP Method", selectedLog.HTTP_METHOD || "—"],
                    ["Endpoint URL", selectedLog.ENDPOINT_URL || "—"],
                    ["HTTP Status", selectedLog.HTTP_STATUS_CODE || "—"],
                    ["Status", selectedLog.STATUS],
                    ["WSO2 Status", selectedLog.WSO2_STATUS || "—"],
                    ["Error Code", selectedLog.ERROR_CODE || "—"],
                    ["Execution (ms)", selectedLog.EXECUTION_TIME_MS ?? "—"],
                    ["Depth Level", selectedLog.DEPTH_LEVEL],
                    ["Initiated By", selectedLog.INITIATED_BY || "—"],
                    ["Created By", selectedLog.CREATED_BY],
                    ["Created Date", formatDate(selectedLog.CREATED_DATE)],
                    ["Updated Date", formatDate(selectedLog.UPDATED_DATE)],
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <span className="text-muted-foreground text-xs">{label}</span>
                      <div className="font-medium break-all">{String(value)}</div>
                    </div>
                  ))}
                </div>
                {selectedLog.REMARKS && (
                  <div>
                    <span className="text-muted-foreground text-xs">Remarks</span>
                    <div className="mt-1 text-sm bg-muted rounded p-2">{selectedLog.REMARKS}</div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="request" className="mt-2">
                <JsonViewer content={selectedLog.REQUEST_PAYLOAD} />
              </TabsContent>
              <TabsContent value="response" className="mt-2">
                <JsonViewer content={selectedLog.RESPONSE_PAYLOAD} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Flow Diagram Dialog */}
      {flowLog && (
        <Dialog open={!!flowLog} onOpenChange={() => { setFlowLog(null); setFlowSelectedNode(null); }}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col gap-0 p-0">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-semibold">Request Flow</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Service: <span className="font-medium">{flowLog.SERVICE_NAME}</span>
                  {" · "}Request ID: <span className="font-mono text-xs">{flowLog.REQUEST_ID}</span>
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFlowLog(null); setFlowSelectedNode(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className={cn("flex flex-1 overflow-hidden", flowSelectedNode ? "divide-x" : "")}>
              {/* Flow tree */}
              <div className={cn("overflow-auto p-4", flowSelectedNode ? "w-1/2" : "w-full")}>
                {flowLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <RequestFlowDiagram
                    nodes={flowNodes as FlowNode[]}
                    onNodeClick={(n) => setFlowSelectedNode(n)}
                    selectedNodeId={flowSelectedNode?.ID}
                  />
                )}
              </div>

              {/* Node detail panel */}
              {flowSelectedNode && (
                <div className="w-1/2 overflow-auto p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Node Details</h3>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setFlowSelectedNode(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-y-2 text-sm">
                    {[
                      ["Service", flowSelectedNode.SERVICE_NAME],
                      ["Status", flowSelectedNode.STATUS],
                      ["HTTP Method", flowSelectedNode.HTTP_METHOD || "—"],
                      ["HTTP Status", flowSelectedNode.HTTP_STATUS_CODE || "—"],
                      ["Endpoint", flowSelectedNode.ENDPOINT_URL || "—"],
                      ["Error Code", flowSelectedNode.ERROR_CODE || "—"],
                      ["Execution (ms)", flowSelectedNode.EXECUTION_TIME_MS ?? "—"],
                      ["Depth", flowSelectedNode.DEPTH_LEVEL],
                      ["Initiated By", flowSelectedNode.INITIATED_BY || "—"],
                      ["Created", formatDate(flowSelectedNode.CREATED_DATE)],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="flex gap-2">
                        <span className="text-muted-foreground min-w-[90px] shrink-0 text-xs">{label}</span>
                        <span className="font-medium text-xs break-all">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                  {flowSelectedNode.REMARKS && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                      <div className="text-xs bg-muted rounded p-2">{flowSelectedNode.REMARKS}</div>
                    </div>
                  )}
                  {flowSelectedNode.REQUEST_PAYLOAD && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Request Payload</p>
                      <JsonViewer content={flowSelectedNode.REQUEST_PAYLOAD} />
                    </div>
                  )}
                  {flowSelectedNode.RESPONSE_PAYLOAD && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Response Payload</p>
                      <JsonViewer content={flowSelectedNode.RESPONSE_PAYLOAD} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
