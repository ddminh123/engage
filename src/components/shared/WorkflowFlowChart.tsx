"use client";

import * as React from "react";
import dagre from "dagre";
import { useApprovalStatuses } from "@/features/settings/hooks/useApprovalStatuses";
import type { ApprovalWorkflowTransition } from "@/features/settings/types";

// ── Constants ──

const NODE_H = 36;
const NODE_PAD_X = 24;
const CHAR_WIDTH = 7;
const EDGE_LABEL_FONT = 10;
const EDGE_LABEL_CHAR_W = 5.5;
const NODE_FONT = 11;
const GRAPH_PADDING = 24;
const HIGHLIGHT_STROKE_W = 3;

// ── Layout Hook ──

interface GraphNode {
  key: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  textColor: string;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  points: { x: number; y: number }[];
  labelX: number;
  labelY: number;
  isBack: boolean;
}

function useGraphLayout(transitions: ApprovalWorkflowTransition[]) {
  const { data: statuses = [] } = useApprovalStatuses();

  return React.useMemo(() => {
    const statusMap = new Map<string, { label: string; color: string }>();
    for (const s of statuses)
      statusMap.set(s.key, { label: s.label, color: s.color });
    const sLabel = (key: string) => statusMap.get(key)?.label ?? key;

    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: "LR",
      nodesep: 50,
      ranksep: 90,
      edgesep: 25,
      marginx: GRAPH_PADDING,
      marginy: GRAPH_PADDING,
    });
    g.setDefaultEdgeLabel(() => ({}));

    const stateSet = new Set<string>();
    for (const t of transitions) {
      stateSet.add(t.fromStatus);
      stateSet.add(t.toStatus);
    }

    // BFS ordering to detect back-edges
    const fromStates = new Set(transitions.map((t) => t.fromStatus));
    const toStates = new Set(transitions.map((t) => t.toStatus));
    const allStates = Array.from(stateSet);
    const startStates = allStates.filter(
      (s) => fromStates.has(s) && !toStates.has(s),
    );
    const bfsOrder: string[] = [];
    const bfsVisited = new Set<string>();
    const bfsQueue = startStates.length > 0 ? [...startStates] : [allStates[0]];
    while (bfsQueue.length > 0) {
      const cur = bfsQueue.shift()!;
      if (bfsVisited.has(cur)) continue;
      bfsVisited.add(cur);
      bfsOrder.push(cur);
      for (const t of transitions) {
        if (t.fromStatus === cur && !bfsVisited.has(t.toStatus))
          bfsQueue.push(t.toStatus);
      }
    }
    for (const s of allStates) if (!bfsVisited.has(s)) bfsOrder.push(s);
    const bfsIndex = new Map(bfsOrder.map((s, i) => [s, i]));

    // Add nodes — dynamic width based on label length
    for (const key of stateSet) {
      const label = sLabel(key);
      const w = Math.max(90, label.length * CHAR_WIDTH + NODE_PAD_X * 2);
      g.setNode(key, { label, width: w, height: NODE_H });
    }

    // Add edges with label dimensions so dagre routes around them
    for (const t of transitions) {
      const isBack =
        (bfsIndex.get(t.fromStatus) ?? 0) >= (bfsIndex.get(t.toStatus) ?? 0);
      const labelW = t.actionLabel.length * EDGE_LABEL_CHAR_W + 8;
      g.setEdge(t.fromStatus, t.toStatus, {
        label: t.actionLabel,
        id: t.id,
        width: labelW,
        height: 14,
        labelpos: "c",
        ...(isBack ? { minlen: 2 } : {}),
      });
    }

    dagre.layout(g);

    const nodes: GraphNode[] = Array.from(stateSet).map((key) => {
      const n = g.node(key);
      const hex = statusMap.get(key)?.color ?? "#94a3b8";
      const r = parseInt(hex.slice(1, 3), 16);
      const gv = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return {
        key,
        label: sLabel(key),
        x: n.x,
        y: n.y,
        w: n.width,
        h: NODE_H,
        fill: `rgba(${r},${gv},${b},0.12)`,
        stroke: `rgba(${r},${gv},${b},0.45)`,
        textColor: hex,
      };
    });

    const edges: GraphEdge[] = g.edges().map((e) => {
      const edgeData = g.edge(e);
      const pts: { x: number; y: number }[] = edgeData.points ?? [];
      const isBack = (bfsIndex.get(e.v) ?? 0) >= (bfsIndex.get(e.w) ?? 0);
      return {
        id: edgeData.id as string,
        from: e.v,
        to: e.w,
        label: edgeData.label as string,
        points: pts,
        labelX: edgeData.x as number,
        labelY: edgeData.y as number,
        isBack,
      };
    });

    const graph = g.graph();
    const width = (graph.width ?? 400) + 2;
    const height = (graph.height ?? 200) + 2;

    return { nodes, edges, width, height };
  }, [transitions, statuses]);
}

// ── Path Helper ──

function pointsToPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const [start, ...rest] = pts;
  let d = `M ${start.x} ${start.y}`;
  if (rest.length === 1) {
    d += ` L ${rest[0].x} ${rest[0].y}`;
  } else {
    for (let i = 0; i < rest.length; i++) {
      const p = rest[i];
      if (i === 0) {
        const mid = { x: (start.x + p.x) / 2, y: (start.y + p.y) / 2 };
        d += ` Q ${start.x} ${start.y} ${mid.x} ${mid.y}`;
      }
      if (i < rest.length - 1) {
        const next = rest[i + 1];
        const mid = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
        d += ` Q ${p.x} ${p.y} ${mid.x} ${mid.y}`;
      } else {
        d += ` L ${p.x} ${p.y}`;
      }
    }
  }
  return d;
}

// ── Component ──

interface WorkflowFlowChartProps {
  transitions: ApprovalWorkflowTransition[];
  highlightStatus?: string | null;
  showLabel?: boolean;
}

export function WorkflowFlowChart({
  transitions,
  highlightStatus,
  showLabel = true,
}: WorkflowFlowChartProps) {
  const { nodes, edges, width, height } = useGraphLayout(transitions);

  if (nodes.length === 0) return null;

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-2 max-w-full overflow-hidden">
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          Sơ đồ trạng thái
        </span>
      )}
      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
        >
          <defs>
            <marker
              id="fc-arrow"
              viewBox="0 0 10 6"
              refX="9"
              refY="3"
              markerWidth="8"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 3 L 0 6 Z" fill="#94a3b8" />
            </marker>
            <marker
              id="fc-arrow-back"
              viewBox="0 0 10 6"
              refX="9"
              refY="3"
              markerWidth="8"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 3 L 0 6 Z" fill="#f97316" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge) => {
            const pathD = pointsToPath(edge.points);
            const lx = edge.labelX;
            const ly = edge.labelY;
            const labelW = edge.label.length * EDGE_LABEL_CHAR_W + 6;

            return (
              <g key={edge.id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={edge.isBack ? "#f97316" : "#94a3b8"}
                  strokeWidth={1.5}
                  strokeDasharray={edge.isBack ? "5 3" : undefined}
                  markerEnd={
                    edge.isBack ? "url(#fc-arrow-back)" : "url(#fc-arrow)"
                  }
                />
                {edge.label && (
                  <>
                    <rect
                      x={lx - labelW / 2}
                      y={ly - 7}
                      width={labelW}
                      height={14}
                      rx={3}
                      fill="white"
                      fillOpacity={0.9}
                    />
                    <text
                      x={lx}
                      y={ly + 3}
                      textAnchor="middle"
                      fontSize={EDGE_LABEL_FONT}
                      fill={edge.isBack ? "#f97316" : "#64748b"}
                      className="select-none"
                    >
                      {edge.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isHighlighted = highlightStatus === node.key;
            return (
              <g key={node.key}>
                {isHighlighted && (
                  <rect
                    x={node.x - node.w / 2 - 3}
                    y={node.y - node.h / 2 - 3}
                    width={node.w + 6}
                    height={node.h + 6}
                    rx={11}
                    ry={11}
                    fill="none"
                    stroke={node.textColor}
                    strokeWidth={HIGHLIGHT_STROKE_W}
                    strokeDasharray="6 3"
                    opacity={0.6}
                  />
                )}
                <rect
                  x={node.x - node.w / 2}
                  y={node.y - node.h / 2}
                  width={node.w}
                  height={node.h}
                  rx={8}
                  ry={8}
                  fill={isHighlighted ? node.stroke : node.fill}
                  stroke={node.stroke}
                  strokeWidth={isHighlighted ? 2 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={NODE_FONT}
                  fontWeight={isHighlighted ? 700 : 500}
                  fill={node.textColor}
                  className="select-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
