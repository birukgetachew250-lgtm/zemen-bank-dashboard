"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  RefreshCw,
  GitFork,
  FileText,
  X,
  CalendarClock,
  FileCode2,
  Copy,
  Check,
  Filter,
  Sparkles,
  ArrowDownUp,
} from "lucide-react";
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

const MAX_WINDOW_DAYS = 15;

function getDateNDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  const variant =
    s === "SUCCESS" || s === "COMPLETED" || s === "OK"
      ? "default"
      : s === "FAILED" || s === "ERROR" || s === "FAILURE" || s === "TIMEOUT"
      ? "destructive"
      : s === "PENDING" || s === "IN_PROGRESS" || s === "PROCESSING"
      ? "secondary"
      : "outline";
  return <Badge variant={variant}>{status || "UNKNOWN"}</Badge>;
}

function formatDate(d: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

/** Highlights all case-insensitive occurrences of `highlightTerm` inside `text` */
function HighlightedText({
  text,
  highlightTerm,
}: {
  text: string;
  highlightTerm?: string;
}) {
  if (!highlightTerm || !highlightTerm.trim()) {
    return <>{text}</>;
  }
  const term = highlightTerm.trim();
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            className="rounded bg-amber-400/80 px-0.5 font-bold text-slate-950 dark:bg-amber-400 dark:text-slate-950"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

/** Extracts a short snippet around the first occurrence of `term` inside `payload` */
function extractPayloadSnippet(
  payload: string | null | undefined,
  term: string,
  radius = 75
): string | null {
  if (!payload || !term.trim()) return null;
  const cleanPayload = payload.replace(/\s+/g, " ");
  const idx = cleanPayload.toLowerCase().indexOf(term.trim().toLowerCase());
  if (idx === -1) return null;
  const start = Math.max(0, idx - radius);
  const end = Math.min(cleanPayload.length, idx + term.length + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < cleanPayload.length ? "…" : "";
  return `${prefix}${cleanPayload.slice(start, end)}${suffix}`;
}

function JsonViewer({
  content,
  initialHighlight = "",
}: {
  content: string | null;
  initialHighlight?: string;
}) {
  const [innerSearch, setInnerSearch] = useState(initialHighlight);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInnerSearch(initialHighlight);
  }, [initialHighlight]);

  if (!content) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  let formatted = content;
  try {
    const parsed = JSON.parse(content);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    formatted = content;
  }

  const matchCount = useMemo(() => {
    if (!innerSearch.trim()) return 0;
    const escaped = innerSearch.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = formatted.match(new RegExp(escaped, "gi"));
    return matches ? matches.length : 0;
  }, [formatted, innerSearch]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={innerSearch}
            onChange={(e) => setInnerSearch(e.target.value)}
            placeholder="Find inside this JSON payload…"
            className="h-7 pl-8 pr-20 text-xs font-mono"
          />
          {innerSearch.trim() && (
            <span className="absolute right-2 top-1.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              {matchCount} {matchCount === 1 ? "match" : "matches"}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy Payload
            </>
          )}
        </Button>
      </div>
      <pre className="bg-muted/80 border border-border/70 rounded-lg p-3 text-xs font-mono overflow-auto max-h-96 whitespace-pre-wrap break-all leading-relaxed">
        <HighlightedText text={formatted} highlightTerm={innerSearch} />
      </pre>
    </div>
  );
}

export default function Wso2RequestLogsClient() {
  const { toast } = useToast();
  const minAllowedDate = useMemo(() => getDateNDaysAgo(MAX_WINDOW_DAYS), []);
  const todayDate = useMemo(() => getTodayDateString(), []);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [allServices, setAllServices] = useState<string[]>([]);
  const [dbStatuses, setDbStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Primary & Payload Search states
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchScope, setSearchScope] = useState<
    "all" | "payloads" | "request" | "response" | "metadata"
  >("all");
  const [requestBodyFilter, setRequestBodyFilter] = useState("");
  const [debouncedReqBody, setDebouncedReqBody] = useState("");
  const [responseBodyFilter, setResponseBodyFilter] = useState("");
  const [debouncedResBody, setDebouncedResBody] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterService, setFilterService] = useState("ALL");
  const [filterMethod, setFilterMethod] = useState("ALL");
  const [filterFrom, setFilterFrom] = useState(() => getDateNDaysAgo(MAX_WINDOW_DAYS));
  const [filterTo, setFilterTo] = useState("");
  const [limit, setLimit] = useState("200");
  const [activePreset, setActivePreset] = useState<number | null>(15);

  // Detail dialog
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [detailTab, setDetailTab] = useState("details");
  const [detailHighlight, setDetailHighlight] = useState("");

  // Flow dialog
  const [flowLog, setFlowLog] = useState<LogEntry | null>(null);
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [flowLoading, setFlowLoading] = useState(false);
  const [flowSelectedNode, setFlowSelectedNode] = useState<FlowNode | null>(null);

  // Debounce search inputs so typing triggers server-side Oracle CLOB search smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedReqBody(requestBodyFilter.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [requestBodyFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResBody(responseBodyFilter.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [responseBodyFilter]);

  // Load distinct services and statuses from DB (last 15 days + configured services)
  useEffect(() => {
    let active = true;
    fetch("/api/wso2/request-logs?metaOnly=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.services)) {
          setAllServices(data.services);
        }
        if (Array.isArray(data.statuses)) {
          setDbStatuses(
            data.statuses.map((s: any) => String(s.status || "").toUpperCase()).filter(Boolean)
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "ALL") params.set("status", filterStatus);
      if (filterService && filterService !== "ALL") params.set("service", filterService);
      if (filterMethod && filterMethod !== "ALL") params.set("method", filterMethod);
      if (filterFrom) params.set("from", filterFrom < minAllowedDate ? minAllowedDate : filterFrom);
      if (filterTo) params.set("to", filterTo);
      if (debouncedSearch) {
        params.set("q", debouncedSearch);
        params.set("scope", searchScope);
      }
      if (debouncedReqBody) params.set("requestBody", debouncedReqBody);
      if (debouncedResBody) params.set("responseBody", debouncedResBody);
      params.set("limit", limit);

      const res = await fetch(`/api/wso2/request-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch request logs");
      const data = await res.json();
      const rows: LogEntry[] = Array.isArray(data) ? data : data.logs || [];
      setLogs(rows);

      // Merge any newly discovered service names into the persistent dropdown list
      setAllServices((prev) => {
        const merged = new Set(prev);
        for (const row of rows) {
          if (row.SERVICE_NAME) merged.add(String(row.SERVICE_NAME).trim());
        }
        return Array.from(merged).sort((a, b) => a.localeCompare(b));
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch WSO2 request logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    filterStatus,
    filterService,
    filterMethod,
    filterFrom,
    filterTo,
    debouncedSearch,
    searchScope,
    debouncedReqBody,
    debouncedResBody,
    limit,
    minAllowedDate,
    toast,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const applyDatePreset = (days: number) => {
    setActivePreset(days);
    if (days === 0) {
      setFilterFrom(todayDate);
      setFilterTo(todayDate);
    } else {
      const clampedDays = Math.min(days, MAX_WINDOW_DAYS);
      setFilterFrom(getDateNDaysAgo(clampedDays));
      setFilterTo("");
    }
  };

  const resetAllFilters = () => {
    setFilterStatus("ALL");
    setFilterService("ALL");
    setFilterMethod("ALL");
    setFilterFrom(minAllowedDate);
    setFilterTo("");
    setActivePreset(15);
    setSearchInput("");
    setDebouncedSearch("");
    setSearchScope("all");
    setRequestBodyFilter("");
    setDebouncedReqBody("");
    setResponseBodyFilter("");
    setDebouncedResBody("");
  };

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
      toast({
        title: "Error",
        description: "Could not load request flow",
        variant: "destructive",
      });
    } finally {
      setFlowLoading(false);
    }
  };

  // Instant client-side refinement on top of server results (so while typing before 350ms debounce, results filter immediately)
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      // Status check
      if (filterStatus && filterStatus !== "ALL") {
        const rowStatus = String(l.STATUS || "").trim().toUpperCase();
        const target = filterStatus.toUpperCase();
        if (target === "SUCCESS") {
          if (!["SUCCESS", "COMPLETED", "OK", "200"].includes(rowStatus)) return false;
        } else if (target === "FAILED") {
          const isErrCode = l.HTTP_STATUS_CODE && Number(l.HTTP_STATUS_CODE) >= 400;
          if (
            !["FAILED", "ERROR", "FAILURE", "TIMEOUT", "REJECTED"].includes(rowStatus) &&
            !isErrCode
          ) {
            return false;
          }
        } else if (target === "PENDING") {
          if (!["PENDING", "IN_PROGRESS", "PROCESSING", "INITIATED"].includes(rowStatus))
            return false;
        } else if (rowStatus !== target) {
          return false;
        }
      }

      // Service check
      if (filterService && filterService !== "ALL") {
        if (
          String(l.SERVICE_NAME || "").trim().toLowerCase() !==
          filterService.trim().toLowerCase()
        ) {
          return false;
        }
      }

      // HTTP Method check
      if (filterMethod && filterMethod !== "ALL") {
        if (String(l.HTTP_METHOD || "").trim().toUpperCase() !== filterMethod.toUpperCase()) {
          return false;
        }
      }

      // Dedicated Request Body check
      if (requestBodyFilter.trim()) {
        const term = requestBodyFilter.trim().toLowerCase();
        if (!String(l.REQUEST_PAYLOAD || "").toLowerCase().includes(term)) {
          return false;
        }
      }

      // Dedicated Response Body check
      if (responseBodyFilter.trim()) {
        const term = responseBodyFilter.trim().toLowerCase();
        if (!String(l.RESPONSE_PAYLOAD || "").toLowerCase().includes(term)) {
          return false;
        }
      }

      // Main search input check according to selected scope
      if (searchInput.trim()) {
        const q = searchInput.trim().toLowerCase();
        const inReq = String(l.REQUEST_PAYLOAD || "").toLowerCase().includes(q);
        const inRes = String(l.RESPONSE_PAYLOAD || "").toLowerCase().includes(q);
        const inMeta = [
          l.SERVICE_NAME,
          l.REQUEST_ID,
          l.PARENT_REQUEST_ID,
          l.STATUS,
          l.WSO2_STATUS,
          l.ERROR_CODE,
          l.INITIATED_BY,
          l.ENDPOINT_URL,
          l.REMARKS,
          l.HTTP_STATUS_CODE,
        ].some((v) => v !== null && v !== undefined && String(v).toLowerCase().includes(q));

        if (searchScope === "request") return inReq;
        if (searchScope === "response") return inRes;
        if (searchScope === "payloads") return inReq || inRes;
        if (searchScope === "metadata") return inMeta;
        return inMeta || inReq || inRes;
      }

      return true;
    });
  }, [
    logs,
    filterStatus,
    filterService,
    filterMethod,
    requestBodyFilter,
    responseBodyFilter,
    searchInput,
    searchScope,
  ]);

  const activeHighlightTerm = useMemo(() => {
    return (
      searchInput.trim() ||
      requestBodyFilter.trim() ||
      responseBodyFilter.trim() ||
      ""
    );
  }, [searchInput, requestBodyFilter, responseBodyFilter]);

  const hasActiveFilters =
    filterStatus !== "ALL" ||
    filterService !== "ALL" ||
    filterMethod !== "ALL" ||
    Boolean(searchInput.trim()) ||
    Boolean(requestBodyFilter.trim()) ||
    Boolean(responseBodyFilter.trim()) ||
    Boolean(filterTo);

  return (
    <div className="space-y-4">
      {/* Filter & Deep Payload Search Card */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">WSO2 Request Logs &amp; Deep Payload Search</CardTitle>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                >
                  <CalendarClock className="mr-1 h-3.5 w-3.5" />
                  Last {MAX_WINDOW_DAYS} Days Window
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Automatically restricted to the last {MAX_WINDOW_DAYS} days to keep queries fast under heavy transaction volume. Search directly inside Request &amp; Response JSON bodies or filter by service and status.
              </CardDescription>
            </div>

            {/* Quick Date Window Presets (within 15-day cap) */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "Today", days: 0 },
                { label: "Last 3D", days: 3 },
                { label: "Last 7D", days: 7 },
                { label: "Last 15D (Max)", days: 15 },
              ].map((preset) => (
                <Button
                  key={preset.days}
                  type="button"
                  size="sm"
                  variant={activePreset === preset.days ? "default" : "outline"}
                  className="h-7 px-2.5 text-xs"
                  onClick={() => applyDatePreset(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Primary Deep Search Row (Searches Oracle CLOBs + Metadata) */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 rounded-xl border border-primary/20 bg-muted/30 p-3">
            <div className="lg:col-span-5">
              <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Deep Search (Request Body, Response Body, CIF, Account, Phone, Request ID)
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 pr-8 h-9 text-sm bg-background"
                  placeholder="Type CIF, account no, phone, FT ref, error text, or JSON key/value…"
                  value={searchInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setDebouncedSearch(searchInput.trim());
                    }
                  }}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setDebouncedSearch("");
                    }}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              <Label className="text-xs font-semibold mb-1.5 block">Search Scope</Label>
              <Select
                value={searchScope}
                onValueChange={(v: any) => setSearchScope(v)}
              >
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Search Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everywhere (Headers + Request &amp; Response Body)</SelectItem>
                  <SelectItem value="payloads">Request &amp; Response Body Only</SelectItem>
                  <SelectItem value="request">Request Body Only (REQUEST_PAYLOAD)</SelectItem>
                  <SelectItem value="response">Response Body Only (RESPONSE_PAYLOAD)</SelectItem>
                  <SelectItem value="metadata">Metadata Only (ID, Service, URL, Error)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                <FileCode2 className="h-3.5 w-3.5 text-sky-500" />
                In Request Body
              </Label>
              <Input
                className="h-9 text-xs font-mono bg-background"
                placeholder='e.g. "0048533" or "amount"'
                value={requestBodyFilter}
                onChange={(e) => setRequestBodyFilter(e.target.value)}
              />
            </div>

            <div className="lg:col-span-2">
              <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                <FileCode2 className="h-3.5 w-3.5 text-amber-500" />
                In Response Body
              </Label>
              <Input
                className="h-9 text-xs font-mono bg-background"
                placeholder='e.g. "responseCode" or error'
                value={responseBodyFilter}
                onChange={(e) => setResponseBodyFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Standard Attribute Filters Row */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[150px]">
              <Label className="text-xs mb-1 block">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="SUCCESS">Success / Completed</SelectItem>
                  <SelectItem value="PENDING">Pending / In Progress</SelectItem>
                  <SelectItem value="FAILED">Failed / Error</SelectItem>
                  {dbStatuses
                    .filter(
                      (s) =>
                        !["SUCCESS", "PENDING", "FAILED"].includes(s)
                    )
                    .map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs mb-1 block">
                Service ({allServices.length} available)
              </Label>
              <Select
                value={filterService || "ALL"}
                onValueChange={(v: string) => setFilterService(v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Services</SelectItem>
                  {allServices.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[120px]">
              <Label className="text-xs mb-1 block">HTTP Method</Label>
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Methods</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[135px]">
              <Label className="text-xs mb-1 block">From Date (Max 15d)</Label>
              <Input
                type="date"
                min={minAllowedDate}
                max={todayDate}
                value={filterFrom}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value;
                  setActivePreset(null);
                  setFilterFrom(val && val < minAllowedDate ? minAllowedDate : val);
                }}
                className="h-8 text-sm"
              />
            </div>

            <div className="flex-1 min-w-[135px]">
              <Label className="text-xs mb-1 block">To Date</Label>
              <Input
                type="date"
                min={minAllowedDate}
                max={todayDate}
                value={filterTo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setActivePreset(null);
                  setFilterTo(e.target.value);
                }}
                className="h-8 text-sm"
              />
            </div>

            <div className="w-[110px]">
              <Label className="text-xs mb-1 block">Max Rows</Label>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 rows</SelectItem>
                  <SelectItem value="200">200 rows</SelectItem>
                  <SelectItem value="500">500 rows</SelectItem>
                  <SelectItem value="1000">1000 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetAllFilters}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              )}
              <Button size="sm" onClick={fetchLogs} variant="outline" className="h-8">
                <RefreshCw className={cn("h-3.5 w-3.5 mr-1", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Active Results Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground border-t border-border/50">
            <div>
              Showing <span className="font-bold text-foreground">{filteredLogs.length}</span>{" "}
              matching request logs (from {filterFrom || minAllowedDate} to {filterTo || "now"})
            </div>
            {activeHighlightTerm && (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <Filter className="h-3.5 w-3.5" />
                Highlighting payload matches for:{" "}
                <code className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono font-bold">
                  {activeHighlightTerm}
                </code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                Searching WSO2 request logs (last {MAX_WINDOW_DAYS} days)…
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service &amp; Endpoint</TableHead>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>HTTP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error / Remarks</TableHead>
                    {activeHighlightTerm && (
                      <TableHead className="min-w-[260px]">Payload Match Preview</TableHead>
                    )}
                    <TableHead className="text-right">Exec (ms)</TableHead>
                    <TableHead className="text-center">Depth</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={activeHighlightTerm ? 11 : 10}
                        className="text-center text-muted-foreground py-12"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            No WSO2 request logs matched your criteria in the last {MAX_WINDOW_DAYS} days
                          </p>
                          <p className="text-xs">
                            Try clearing filters or adjusting your Request/Response body search term.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => {
                      const isFailed =
                        ["FAILED", "ERROR", "FAILURE", "TIMEOUT"].includes(
                          (log.STATUS || "").toUpperCase()
                        ) || Boolean(log.HTTP_STATUS_CODE && log.HTTP_STATUS_CODE >= 400);

                      const reqSnippet = activeHighlightTerm
                        ? extractPayloadSnippet(
                            log.REQUEST_PAYLOAD,
                            requestBodyFilter.trim() || searchInput.trim()
                          )
                        : null;
                      const resSnippet = activeHighlightTerm
                        ? extractPayloadSnippet(
                            log.RESPONSE_PAYLOAD,
                            responseBodyFilter.trim() || searchInput.trim()
                          )
                        : null;

                      return (
                        <TableRow
                          key={log.ID}
                          className={cn(isFailed && "bg-red-50/60 dark:bg-red-950/20")}
                        >
                          <TableCell className="max-w-[220px]">
                            <div className="font-medium truncate" title={log.SERVICE_NAME}>
                              <HighlightedText
                                text={log.SERVICE_NAME || "—"}
                                highlightTerm={searchInput}
                              />
                            </div>
                            {log.ENDPOINT_URL && (
                              <div
                                className="font-mono text-[11px] text-muted-foreground truncate"
                                title={log.ENDPOINT_URL}
                              >
                                <HighlightedText
                                  text={log.ENDPOINT_URL}
                                  highlightTerm={searchInput}
                                />
                              </div>
                            )}
                          </TableCell>
                          <TableCell
                            className="font-mono text-xs text-muted-foreground max-w-[140px] truncate"
                            title={log.REQUEST_ID}
                          >
                            <HighlightedText
                              text={log.REQUEST_ID || "—"}
                              highlightTerm={searchInput}
                            />
                          </TableCell>
                          <TableCell>
                            {log.HTTP_METHOD ? (
                              <Badge variant="outline" className="text-xs">
                                {log.HTTP_METHOD}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "font-mono text-sm font-semibold",
                              log.HTTP_STATUS_CODE && log.HTTP_STATUS_CODE >= 400
                                ? "text-red-500"
                                : "text-green-600"
                            )}
                          >
                            {log.HTTP_STATUS_CODE || "—"}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={log.STATUS} />
                          </TableCell>
                          <TableCell className="max-w-[160px]">
                            {log.ERROR_CODE ? (
                              <span className="text-red-500 text-xs font-medium block truncate">
                                <HighlightedText
                                  text={log.ERROR_CODE}
                                  highlightTerm={searchInput}
                                />
                              </span>
                            ) : null}
                            {log.REMARKS ? (
                              <span
                                className="text-muted-foreground text-[11px] block truncate"
                                title={log.REMARKS}
                              >
                                <HighlightedText
                                  text={log.REMARKS}
                                  highlightTerm={searchInput}
                                />
                              </span>
                            ) : !log.ERROR_CODE ? (
                              "—"
                            ) : null}
                          </TableCell>

                          {activeHighlightTerm && (
                            <TableCell className="max-w-[320px]">
                              <div className="space-y-1">
                                {reqSnippet && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedLog(log);
                                      setDetailTab("request");
                                      setDetailHighlight(
                                        requestBodyFilter.trim() || searchInput.trim()
                                      );
                                    }}
                                    className="block w-full text-left rounded border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[11px] font-mono hover:bg-sky-500/20 transition-colors"
                                  >
                                    <span className="font-sans font-bold text-sky-600 dark:text-sky-400 mr-1">
                                      [Req Body]:
                                    </span>
                                    <HighlightedText
                                      text={reqSnippet}
                                      highlightTerm={
                                        requestBodyFilter.trim() || searchInput.trim()
                                      }
                                    />
                                  </button>
                                )}
                                {resSnippet && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedLog(log);
                                      setDetailTab("response");
                                      setDetailHighlight(
                                        responseBodyFilter.trim() || searchInput.trim()
                                      );
                                    }}
                                    className="block w-full text-left rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-mono hover:bg-amber-500/20 transition-colors"
                                  >
                                    <span className="font-sans font-bold text-amber-600 dark:text-amber-400 mr-1">
                                      [Res Body]:
                                    </span>
                                    <HighlightedText
                                      text={resSnippet}
                                      highlightTerm={
                                        responseBodyFilter.trim() || searchInput.trim()
                                      }
                                    />
                                  </button>
                                )}
                                {!reqSnippet && !resSnippet && (
                                  <span className="text-[11px] text-muted-foreground">
                                    Matched in header/metadata
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          )}

                          <TableCell className="text-right font-mono text-xs">
                            {log.EXECUTION_TIME_MS ?? "—"}
                          </TableCell>
                          <TableCell className="text-center">{log.DEPTH_LEVEL}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(log.CREATED_DATE)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                title="View Details & JSON Payloads"
                                onClick={() => {
                                  setSelectedLog(log);
                                  if (reqSnippet) {
                                    setDetailTab("request");
                                    setDetailHighlight(
                                      requestBodyFilter.trim() || searchInput.trim()
                                    );
                                  } else if (resSnippet) {
                                    setDetailTab("response");
                                    setDetailHighlight(
                                      responseBodyFilter.trim() || searchInput.trim()
                                    );
                                  } else {
                                    setDetailTab("details");
                                    setDetailHighlight(activeHighlightTerm);
                                  }
                                }}
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                  "h-7 px-2",
                                  isFailed && "text-red-500 hover:text-red-600"
                                )}
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
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Request Detail — {selectedLog.SERVICE_NAME}</span>
                <StatusBadge status={selectedLog.STATUS} />
              </DialogTitle>
            </DialogHeader>
            <Tabs value={detailTab} onValueChange={setDetailTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Metadata &amp; Timing</TabsTrigger>
                <TabsTrigger value="request">
                  Request Body {selectedLog.REQUEST_PAYLOAD ? "" : "(Empty)"}
                </TabsTrigger>
                <TabsTrigger value="response">
                  Response Body {selectedLog.RESPONSE_PAYLOAD ? "" : "(Empty)"}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
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
                    <div className="mt-1 text-sm bg-muted rounded p-2">
                      {selectedLog.REMARKS}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="request" className="mt-3">
                <JsonViewer
                  content={selectedLog.REQUEST_PAYLOAD}
                  initialHighlight={
                    requestBodyFilter.trim() || detailHighlight || searchInput.trim()
                  }
                />
              </TabsContent>
              <TabsContent value="response" className="mt-3">
                <JsonViewer
                  content={selectedLog.RESPONSE_PAYLOAD}
                  initialHighlight={
                    responseBodyFilter.trim() || detailHighlight || searchInput.trim()
                  }
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Flow Diagram Dialog */}
      {flowLog && (
        <Dialog
          open={!!flowLog}
          onOpenChange={() => {
            setFlowLog(null);
            setFlowSelectedNode(null);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col gap-0 p-0">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-semibold">Request Flow</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Service: <span className="font-medium">{flowLog.SERVICE_NAME}</span>
                  {" · "}Request ID:{" "}
                  <span className="font-mono text-xs">{flowLog.REQUEST_ID}</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFlowLog(null);
                  setFlowSelectedNode(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div
              className={cn(
                "flex flex-1 overflow-hidden",
                flowSelectedNode ? "divide-x" : ""
              )}
            >
              {/* Flow tree */}
              <div
                className={cn(
                  "overflow-auto p-4",
                  flowSelectedNode ? "w-1/2" : "w-full"
                )}
              >
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setFlowSelectedNode(null)}
                    >
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
                        <span className="text-muted-foreground min-w-[90px] shrink-0 text-xs">
                          {label}
                        </span>
                        <span className="font-medium text-xs break-all">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {flowSelectedNode.REMARKS && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                      <div className="text-xs bg-muted rounded p-2">
                        {flowSelectedNode.REMARKS}
                      </div>
                    </div>
                  )}
                  {flowSelectedNode.REQUEST_PAYLOAD && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Request Payload
                      </p>
                      <JsonViewer
                        content={flowSelectedNode.REQUEST_PAYLOAD}
                        initialHighlight={activeHighlightTerm}
                      />
                    </div>
                  )}
                  {flowSelectedNode.RESPONSE_PAYLOAD && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Response Payload
                      </p>
                      <JsonViewer
                        content={flowSelectedNode.RESPONSE_PAYLOAD}
                        initialHighlight={activeHighlightTerm}
                      />
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
