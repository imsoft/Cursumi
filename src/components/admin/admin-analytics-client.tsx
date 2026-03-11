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

export function AdminAnalyticsClient({ revenueByMonth, usersByMonth }: AdminAnalyticsClientProps) {
  const revenueConfig = {
    amount: { label: "Ingresos", color: "oklch(0.541 0.281 293.009)" },
  };

  const usersConfig = {
    users: { label: "Usuarios", color: "oklch(0.606 0.25 292.717)" },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle>Ingresos por mes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <ChartContainer config={revenueConfig} className="min-h-[200px] w-full overflow-hidden">
            <BarChart data={revenueByMonth} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis />
              <RechartsTooltip content={<ChartTooltip content={<ChartTooltipContent />} />} />
              <Bar dataKey="amount" fill={revenueConfig.amount.color} radius={4} isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle>Usuarios nuevos por mes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <ChartContainer config={usersConfig} className="min-h-[200px] w-full overflow-hidden">
            <BarChart data={usersByMonth} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis />
              <RechartsTooltip content={<ChartTooltip content={<ChartTooltipContent />} />} />
              <Bar dataKey="users" fill={usersConfig.users.color} radius={4} isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
