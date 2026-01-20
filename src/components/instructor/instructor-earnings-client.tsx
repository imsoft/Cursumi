"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import type { InstructorEarnings } from "@/lib/instructor-service";

interface InstructorEarningsClientProps {
  earnings: InstructorEarnings;
}

export function InstructorEarningsClient({ earnings }: InstructorEarningsClientProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Ingresos generados</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualiza tus ganancias y transacciones en Cursumi
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total ganado" value={formatMXN(earnings.total)} hint="Desde el inicio" />
        <StatCard title="Este mes" value={formatMXN(earnings.thisMonth)} hint="Ingresos del mes" />
        <StatCard title="Inscripciones" value={earnings.enrollments.toString()} hint="Total de alumnos" />
        <StatCard title="Cursos" value={earnings.courses.toString()} hint="Publicados" />
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Ingresos por mes</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earnings.monthly.map((item) => {
                  const maxAmount = Math.max(...earnings.monthly.map((e) => e.amount), 1);
                  const percentage = (item.amount / maxAmount) * 100;

                  return (
                    <div key={item.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{item.month}</span>
                        <span className="font-semibold text-foreground">
                          {formatMXN(item.amount)}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2 rounded-full" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge variant="outline">{hint}</Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function formatMXN(amount: number) {
  return amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });
}
