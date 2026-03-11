"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type MonthSeries = { month: string; amount: number };
type UsersSeries = { month: string; users: number };

interface AdminAnalyticsClientProps {
  revenueByMonth: MonthSeries[];
  usersByMonth: UsersSeries[];
}

const chartWrapperClass = "min-h-[200px] h-[200px] w-full overflow-hidden";

function ChartOrEmpty({
  data,
  dataKey,
  config,
  title,
  emptyMessage = "No hay datos para mostrar",
}: {
  data: { month: string; [k: string]: string | number }[];
  dataKey: string;
  config: Record<string, { label: string; color: string }>;
  title: string;
  emptyMessage?: string;
}) {
  const hasData = data.length > 0 && data.some((d) => Number(d[dataKey]) > 0);

  if (!hasData) {
    return (
      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[200px] items-center justify-center rounded-md bg-muted/30">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card/90">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className={chartWrapperClass}>
          <ChartContainer config={config} className="h-full w-full">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis />
              <RechartsTooltip content={<ChartTooltip content={<ChartTooltipContent />} />} />
              <Bar dataKey={dataKey} fill={config[dataKey].color} radius={4} isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminAnalyticsClient({ revenueByMonth, usersByMonth }: AdminAnalyticsClientProps) {
  const revenueConfig = {
    amount: { label: "Ingresos", color: "oklch(0.541 0.281 293.009)" },
  };

  const usersConfig = {
    users: { label: "Usuarios", color: "oklch(0.606 0.25 292.717)" },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartOrEmpty
        data={revenueByMonth}
        dataKey="amount"
        config={revenueConfig}
        title="Ingresos por mes"
      />
      <ChartOrEmpty
        data={usersByMonth}
        dataKey="users"
        config={usersConfig}
        title="Usuarios nuevos por mes"
      />
    </div>
  );
}
