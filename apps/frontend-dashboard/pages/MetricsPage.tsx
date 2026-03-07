import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiKeyDTO } from "@repo/shared";
import { useApiKeys } from "hooks/useApiKeys";
import { useAggregateMetrics, useMetrics } from "hooks/useMetrics";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import React, { useState } from "react";
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

const CHART_STYLE = {
  grid: "var(--color-border)",
  muted: "var(--color-muted-foreground)",
  primary: "var(--color-primary)",
  chart2: "var(--color-chart-2)",
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "var(--color-foreground)",
  },
};

interface KeyMatricsPanelProps {
  apiKey: ApiKeyDTO;
  days: number;
}
const KeyMetricsPanel = ({ apiKey, days }: KeyMatricsPanelProps) => {
  const { data, isLoading } = useMetrics(apiKey.id, days);

  if (isLoading) return <Skeleton className="h-48 w-full mt-4" />;
  if (!data) return null;

  const dailyData = data.daily;

  const chartData = dailyData.map((day) => ({
    date: day.date.slice(5),
    tokensIn: day.tokensIn,
    tokensOut: day.tokensOut,
    requests: day.requests,
  }));

  const SUMMARY_STATS = [
    {
      label: "Total Requests",
      value: data.totalRequests,
    },
    {
      label: "Total Tokens In",
      value: data.totalTokensIn,
    },
    {
      label: "Total Tokens Out",
      value: data.totalTokensOut,
    },
  ];

  return (
    <div>
      <div>
        {SUMMARY_STATS.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-secondary/50 p-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p className="text-sm font-semibold leading-none text-foreground">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
          <XAxis
            dataKey="date"
            tick={{
              fontSize: 10,
              fill: CHART_STYLE.muted,
              fontFamily: "DM Mono, monospace",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: CHART_STYLE.muted }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip {...tooltipStyle} />
          <Bar
            dataKey="requests"
            fill={CHART_STYLE.primary}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const MetricsPage = () => {
  const [days, setDays] = useState(30);
  const { data: keys = [], isLoading: keysLoading } = useApiKeys();
  const { data: aggregate, isLoading } = useAggregateMetrics(days);
  const [expandedKey, setExpandedKey] = useState<number | null>(null);

  const activeKeys = keys.filter((key) => !key.disabled && !key.deleted);

  const daily = aggregate?.daily ?? [];
  const aggregateChart = daily.map((day) => ({
    date: day.date.slice(5),
    tokensIn: day.tokensIn,
    tokensOut: day.tokensOut,
    requests: day.requests,
  }));

  const SUMMARY_STATS = [
    {
      label: "Total Requests",
      value: aggregate?.totalRequests ?? 0,
    },
    {
      label: "Total Tokens In",
      value: aggregate?.totalTokensIn ?? 0,
    },
    {
      label: "Total Tokens Out",
      value: aggregate?.totalTokensOut ?? 0,
    },
  ];
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
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
              className={`rounded px-3 py-1.5 font-mono text-xs transition-colors ${days === day ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              {day}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {SUMMARY_STATS.map((stat) => (
          <Card>
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

      <Card>
        <CardHeader>
          <CardTitle>Token Usage - {days} Days</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={aggregateChart}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_STYLE.primary}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_STYLE.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_STYLE.chart2}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_STYLE.chart2}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_STYLE.grid}
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 11,
                    fill: CHART_STYLE.muted,
                    fontFamily: "DM Mono, monospace",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: CHART_STYLE.muted }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="tokensIn"
                  name="Tokens In"
                  stroke={CHART_STYLE.primary}
                  fill="url(#inGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="tokensOut"
                  name="Tokens Out"
                  stroke={CHART_STYLE.chart2}
                  fill="url(#outGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
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
