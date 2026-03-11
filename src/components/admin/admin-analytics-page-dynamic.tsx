"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analíticas" description="Métricas y estadísticas de la plataforma" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border bg-card/90">
            <CardHeader>
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
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
    </div>
  );
}

const AdminAnalyticsPageClient = dynamic(
  () =>
    import("./admin-analytics-page-client").then((m) => ({
      default: m.AdminAnalyticsPageClient,
    })),
  { ssr: false, loading: () => <AnalyticsLoading /> }
);

export function AdminAnalyticsPageDynamic() {
  return <AdminAnalyticsPageClient />;
}
