import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiKeys } from "hooks/useApiKeys";
import { useAuth } from "hooks/useAuth";
import { useAggregateMetrics } from "hooks/useMetrics";
import { Activity, Key, Plus, TrendingUp, Zap } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  CartesianGrid,
  AreaChart,
} from "recharts";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  loading?: boolean;
  highlight?: boolean;
}
const StatCard = ({
  label,
  value,
  icon: Icon,
  loading = false,
  highlight = false,
}: StatCardProps) => {
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`flex size-10 items-center justify-center rounded-lg ${highlight ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            {loading ? (
              <Skeleton className="mt-1 h-7 w-24" />
            ) : (
              <p className="font-mono text-2xl font-bold tracking-tight">
                {value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomToolTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-lg">
      <p className="mb-2 font-mono text-muted-foreground">{label}</p>
      <p className="flex justify-between gap-4">
        <span className="text-muted-foreground">Requests</span>
        <strong className="font-mono text-foreground">
          {payload[0].value ?? 0}
        </strong>
      </p>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data: keys = [], isLoading: keysLoading } = useApiKeys();
  const { data: metrics, isLoading: metricsLoading } = useAggregateMetrics();

  const activeKeys = keys.filter((key) => !key.disabled && !key.deleted).length;
  const dailyMetrics = metrics?.daily ?? [];
  const last14Days = dailyMetrics.slice(-14);
  const chartData = last14Days.map((day) => ({
    date: day.date.slice(-5),
    requests: day.requests,
  }));
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting},{" "}
            <span className="text-primary">{user?.email?.split("@")[0]}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your API usage and manage keys
          </p>
        </div>
        <Link to={"/keys"}>
          <Button>
            <Plus className="mr-1 size-4" />
            New Api Key
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={(metrics?.totalRequests ?? 0).toLocaleString()}
          icon={Activity}
          loading={metricsLoading}
          highlight
        />
        <StatCard
          label="Active Keys"
          value={activeKeys}
          icon={Key}
          loading={keysLoading}
        />
        <StatCard
          label="Tokens In"
          value={(metrics?.totalTokensIn ?? 0).toLocaleString()}
          icon={Zap}
          loading={metricsLoading}
        />
        <StatCard
          label="Tokens Out"
          value={(metrics?.totalTokensOut ?? 0).toLocaleString()}
          icon={TrendingUp}
          loading={metricsLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Requests - Last 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <Skeleton />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 11,
                    fill: "var(--color-muted-foreground)",
                    fontFamily: "DM Mono, monospace",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomToolTip />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#reqGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
