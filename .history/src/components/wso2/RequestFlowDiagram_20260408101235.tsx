"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlowNode {
  ID: string;
  REQUEST_ID: string;
  PARENT_REQUEST_ID: string | null;
  SERVICE_NAME: string;
  HTTP_METHOD: string | null;
  ENDPOINT_URL: string | null;
  HTTP_STATUS_CODE: number | null;
  STATUS: string;
  WSO2_STATUS: string | null;
  ERROR_CODE: string | null;
  EXECUTION_TIME_MS: number | null;
  INITIATED_BY: string | null;
  REMARKS: string | null;
  CREATED_DATE: string;
  DEPTH_LEVEL: number;
  TREE_LEVEL?: number;
  [key: string]: any;
}

interface RequestFlowDiagramProps {
  nodes: FlowNode[];
  onNodeClick: (node: FlowNode) => void;
  selectedNodeId?: string | null;
}

function getStatusIcon(status: string) {
  const s = (status || "").toUpperCase();
  if (s === "SUCCESS" || s === "COMPLETED") return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
  if (s === "FAILED" || s === "ERROR") return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
  if (s === "PENDING" || s === "IN_PROGRESS") return <Clock className="h-4 w-4 text-yellow-500 shrink-0" />;
  return <AlertCircle className="h-4 w-4 text-gray-400 shrink-0" />;
}

function getStatusBadgeVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  const s = (status || "").toUpperCase();
  if (s === "SUCCESS" || s === "COMPLETED") return "default";
  if (s === "FAILED" || s === "ERROR") return "destructive";
  if (s === "PENDING" || s === "IN_PROGRESS") return "secondary";
  return "outline";
}

function getHttpStatusColor(code: number | null) {
  if (!code) return "text-muted-foreground";
  if (code >= 200 && code < 300) return "text-green-600 dark:text-green-400";
  if (code >= 400 && code < 500) return "text-yellow-600 dark:text-yellow-400";
  if (code >= 500) return "text-red-600 dark:text-red-400";
  return "text-muted-foreground";
}

// Build a tree structure from flat array
function buildTree(nodes: FlowNode[]): Map<string | null, FlowNode[]> {
  const map = new Map<string | null, FlowNode[]>();
  for (const node of nodes) {
    const parent = node.PARENT_REQUEST_ID ?? null;
    if (!map.has(parent)) map.set(parent, []);
    map.get(parent)!.push(node);
  }
  // Sort children by CREATED_DATE
  for (const [, children] of map) {
    children.sort((a, b) => {
      const da = a.CREATED_DATE ? new Date(a.CREATED_DATE).getTime() : 0;
      const db = b.CREATED_DATE ? new Date(b.CREATED_DATE).getTime() : 0;
      return da - db;
    });
  }
  return map;
}

interface TreeNodeProps {
  node: FlowNode;
  childMap: Map<string | null, FlowNode[]>;
  depth: number;
  onNodeClick: (node: FlowNode) => void;
  selectedNodeId?: string | null;
  isLast: boolean;
}

function TreeNode({ node, childMap, depth, onNodeClick, selectedNodeId, isLast }: TreeNodeProps) {
  const children = childMap.get(node.REQUEST_ID) || [];
  const isFailed = ["FAILED", "ERROR"].includes((node.STATUS || "").toUpperCase());
  const isSelected = selectedNodeId === node.ID;

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-0">
        {/* Vertical/horizontal connector lines */}
        {depth > 0 && (
          <div className="flex items-start shrink-0" style={{ width: `${depth * 24}px` }}>
            {Array.from({ length: depth }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-6 shrink-0",
                  i === depth - 1
                    ? isLast
                      ? "border-l-2 border-b-2 border-border rounded-bl-sm h-5 mt-0 self-start"
                      : "border-l-2 border-b-2 border-border h-5 mt-0 self-start rounded-bl-sm"
                    : "border-l-2 border-border h-full self-stretch"
                )}
              />
            ))}
          </div>
        )}

        {/* Node card */}
        <button
          onClick={() => onNodeClick(node)}
          className={cn(
            "flex-1 text-left rounded-lg border px-3 py-2 mb-1 transition-all hover:shadow-md",
            isFailed
              ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40"
              : "border-border bg-card hover:bg-accent/40",
            isSelected && "ring-2 ring-primary ring-offset-1"
          )}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusIcon(node.STATUS)}
            <span className="font-medium text-sm">{node.SERVICE_NAME}</span>
            {node.HTTP_METHOD && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">{node.HTTP_METHOD}</Badge>
            )}
            <Badge variant={getStatusBadgeVariant(node.STATUS)} className="text-xs px-1.5 py-0">
              {node.STATUS}
            </Badge>
            {node.HTTP_STATUS_CODE && (
              <span className={cn("text-xs font-mono", getHttpStatusColor(node.HTTP_STATUS_CODE))}>
                HTTP {node.HTTP_STATUS_CODE}
              </span>
            )}
            {node.EXECUTION_TIME_MS != null && (
              <span className="text-xs text-muted-foreground ml-auto">{node.EXECUTION_TIME_MS} ms</span>
            )}
          </div>
          {node.ENDPOINT_URL && (
            <div className="mt-1 text-xs text-muted-foreground truncate max-w-xs">{node.ENDPOINT_URL}</div>
          )}
          {isFailed && node.ERROR_CODE && (
            <div className="mt-1 text-xs text-red-600 dark:text-red-400">Error: {node.ERROR_CODE}</div>
          )}
          {isFailed && node.REMARKS && (
            <div className="mt-0.5 text-xs text-red-500 dark:text-red-300 line-clamp-2">{node.REMARKS}</div>
          )}
          {children.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <ChevronRight className="h-3 w-3" />
              <span>{children.length} sub-request{children.length > 1 ? "s" : ""}</span>
            </div>
          )}
        </button>
      </div>

      {/* Render children */}
      {children.map((child, idx) => (
        <TreeNode
          key={child.ID}
          node={child}
          childMap={childMap}
          depth={depth + 1}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          isLast={idx === children.length - 1}
        />
      ))}
    </div>
  );
}

export default function RequestFlowDiagram({ nodes, onNodeClick, selectedNodeId }: RequestFlowDiagramProps) {
  const childMap = buildTree(nodes);

  // Root nodes: those with PARENT_REQUEST_ID = null or not present in any node's REQUEST_ID
  const allRequestIds = new Set(nodes.map((n) => n.REQUEST_ID));
  const roots = nodes.filter((n) => !n.PARENT_REQUEST_ID || !allRequestIds.has(n.PARENT_REQUEST_ID));

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No flow data available
      </div>
    );
  }

  return (
    <div className="overflow-auto p-2">
      {roots.map((root, idx) => (
        <TreeNode
          key={root.ID}
          node={root}
          childMap={childMap}
          depth={0}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
          isLast={idx === roots.length - 1}
        />
      ))}
    </div>
  );
}
