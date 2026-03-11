"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const AdminAnalyticsClient = dynamic(
  () =>
    import("./admin-analytics-client").then((m) => ({ default: m.AdminAnalyticsClient })),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] w-full animate-pulse rounded bg-muted/50" />
          </CardContent>
        </Card>
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] w-full animate-pulse rounded bg-muted/50" />
          </CardContent>
        </Card>
      </div>
    ),
  }
);

type MonthSeries = { month: string; amount: number };
type UsersSeries = { month: string; users: number };

interface Props {
  revenueByMonth: MonthSeries[];
  usersByMonth: UsersSeries[];
}

export function AdminAnalyticsChartsLazy({ revenueByMonth, usersByMonth }: Props) {
  return (
    <AdminAnalyticsClient
      revenueByMonth={revenueByMonth}
      usersByMonth={usersByMonth}
    />
  );
}
