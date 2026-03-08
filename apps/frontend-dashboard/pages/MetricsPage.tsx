import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiKeyDTO } from "@repo/shared";
import { useApiKeys } from "hooks/useApiKeys";
import { useAggregateMetrics, useMetrics } from "hooks/useMetrics";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Read CSS variables at runtime so they work inside SVG
function getCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return val || fallback;
}

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "var(--color-foreground)",
  },
};

interface KeyMetricsPanelProps {
  apiKey: ApiKeyDTO;
  days: number;
}

const KeyMetricsPanel = ({ apiKey, days }: KeyMetricsPanelProps) => {
  const { data, isLoading } = useMetrics(apiKey.id, days);
  const [colors, setColors] = useState({
    primary: "#6366f1",
    muted: "#94a3b8",
    grid: "#e2e8f0",
  });

  useEffect(() => {
    setColors({
      primary: getCssVar("--color-primary", "#6366f1"),
      muted: getCssVar("--color-muted-foreground", "#94a3b8"),
      grid: getCssVar("--color-border", "#e2e8f0"),
    });
  }, []);

  if (isLoading) return <Skeleton className="h-48 w-full mt-4" />;
  if (!data) return null;

  const chartData = data.daily.map((day) => ({
    date: day.date.slice(5),
    tokensIn: day.tokensIn,
    tokensOut: day.tokensOut,
    requests: day.requests,
  }));

  const SUMMARY_STATS = [
    { label: "Total Requests", value: data.totalRequests },
    { label: "Tokens In", value: data.totalTokensIn },
    { label: "Tokens Out", value: data.totalTokensOut },
  ];

  return (
    <div className="pt-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {SUMMARY_STATS.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-lg font-bold font-mono leading-none text-foreground">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div style={{ width: "100%", height: "160px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: colors.muted, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: colors.muted }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip {...tooltipStyle} />
            <Bar
              dataKey="requests"
              fill={colors.primary}
              radius={[3, 3, 0, 0]}
              minPointSize={3}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MetricsPage = () => {
  const [days, setDays] = useState(30);
  const { data: keys = [] } = useApiKeys();
  const { data: aggregate, isLoading } = useAggregateMetrics(days);
  const [expandedKey, setExpandedKey] = useState<number | null>(null);

  // Resolve CSS variables into actual color values for use inside SVG
  const [colors, setColors] = useState({
    primary: "#6366f1",
    chart2: "#22c55e",
    muted: "#94a3b8",
    grid: "#e2e8f0",
  });

  useEffect(() => {
    setColors({
      primary: getCssVar("--color-primary", "#6366f1"),
      chart2: getCssVar("--color-chart-2", "#22c55e"),
      muted: getCssVar("--color-muted-foreground", "#94a3b8"),
      grid: getCssVar("--color-border", "#e2e8f0"),
    });
  }, []);

  const activeKeys = keys.filter((key) => !key.disabled && !key.deleted);

  const aggregateChart = (aggregate?.daily ?? []).map((day) => ({
    date: day.date.slice(5),
    tokensIn: day.tokensIn,
    tokensOut: day.tokensOut,
    requests: day.requests,
  }));

  const SUMMARY_STATS = [
    { label: "Total Requests", value: aggregate?.totalRequests ?? 0 },
    { label: "Total Tokens In", value: aggregate?.totalTokensIn ?? 0 },
    { label: "Total Tokens Out", value: aggregate?.totalTokensOut ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metrics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Token usage and request volume across all keys
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {[7, 14, 30, 60].map((day) => (
            <button
              key={day}
              onClick={() => setDays(day)}
              className={`rounded px-3 py-1.5 font-mono text-xs transition-colors ${
                days === day
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {day}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {SUMMARY_STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-8 w-28" />
              ) : (
                <p className="mt-1 font-mono text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Area chart */}
      <Card>
        <CardHeader>
          <CardTitle>Token Usage — {days} Days</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : aggregateChart.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              No data available for this period
            </div>
          ) : (
            <div style={{ width: "100%", height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={aggregateChart}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.chart2} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.chart2} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: colors.muted, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: colors.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="tokensIn"
                    name="Tokens In"
                    stroke={colors.primary}
                    fill="url(#inGrad)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: colors.primary, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokensOut"
                    name="Tokens Out"
                    stroke={colors.chart2}
                    fill="url(#outGrad)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: colors.chart2, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-key breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Per-Key Breakdown
        </h2>
        {activeKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active keys found.</p>
        ) : (
          activeKeys.map((key) => (
            <Card key={key.id}>
              <button
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() =>
                  setExpandedKey(expandedKey === key.id ? null : key.id)
                }
              >
                <span className="font-semibold">{key.name}</span>
                {expandedKey === key.id ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>
              {expandedKey === key.id && (
                <CardContent className="border-t border-border pt-0">
                  <KeyMetricsPanel apiKey={key} days={days} />
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MetricsPage;