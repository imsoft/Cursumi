"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Download,
  Search,
  Calculator,
  Calendar,
  Sparkles,
  Receipt,
  PieChart,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import type { InstructorEarnings } from "@/lib/instructor-service";

interface InstructorEarningsClientProps {
  earnings: InstructorEarnings;
}

export function InstructorEarningsClient({ earnings }: InstructorEarningsClientProps) {
  const [timeframe, setTimeframe] = useState<"6m" | "12m">("6m");
  const [courseSearch, setCourseSearch] = useState("");
  const [txSearch, setTxSearch] = useState("");

  // Calculator State
  const [calcPrice, setCalcPrice] = useState<number>(499);
  const [calcStudents, setCalcStudents] = useState<number>(25);

  const monthlySeries = timeframe === "6m" ? earnings.monthly : earnings.monthly12;
  const maxMonthlyAmount = Math.max(...monthlySeries.map((m) => m.amount), 1);

  // Filtered Course Breakdown
  const filteredCourses = earnings.courseBreakdown.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // Filtered Transactions
  const filteredTx = earnings.recentTransactions.filter(
    (tx) =>
      tx.studentName.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.courseTitle.toLowerCase().includes(txSearch.toLowerCase())
  );

  // Calculator computations
  const projectedGross = calcPrice * calcStudents;
  const projectedFee = Math.round(projectedGross * 0.15);
  const projectedNet = Math.round(projectedGross * 0.85);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ["ID Transaccion", "Fecha", "Estudiante", "Curso", "Monto Bruto (MXN)", "Ganancia Neta (85% MXN)"];
    const rows = earnings.recentTransactions.map((tx) => [
      tx.id,
      new Date(tx.createdAt).toLocaleDateString("es-MX"),
      `"${tx.studentName.replace(/"/g, '""')}"`,
      `"${tx.courseTitle.replace(/"/g, '""')}"`,
      tx.amount,
      tx.netAmount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_ingresos_cursumi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Panel Financiero e Ingresos
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 gap-1 text-[11px] font-medium tracking-normal">
              <Sparkles className="h-3 w-3" /> Actualizado
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Resumen de ventas, ganancias netas (85%), desglose por curso y flujo de transferencias bancarias.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 shadow-xs">
            <Download className="h-4 w-4" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Net Earnings */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ganancia Neta Acumulada
              </CardTitle>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {formatMXN(earnings.totalNet)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-medium tracking-normal">
                  85% Neto
                </Badge>
                <span>Bruto: {formatMXN(earnings.totalGross)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI 2: This Month */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ingresos Este Mes
              </CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {formatMXN(earnings.thisMonthNet)}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {earnings.monthOverMonthGrowth >= 0 ? (
                  <span className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                    +{earnings.monthOverMonthGrowth}% vs mes ant.
                  </span>
                ) : (
                  <span className="flex items-center font-medium text-rose-600 dark:text-rose-400">
                    <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
                    {earnings.monthOverMonthGrowth}% vs mes ant.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI 3: Total Enrollments */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Inscripciones Totales
              </CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {earnings.enrollments}
              </div>
              <p className="text-xs text-muted-foreground">
                Promedias <strong className="text-foreground">{formatMXN(earnings.averageRevenuePerStudent)}</strong> neto por alumno
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI 4: Active Courses */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cursos Publicados
              </CardTitle>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <BookOpen className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {earnings.courses}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {earnings.courseBreakdown.length > 0
                  ? `Más rentable: ${earnings.courseBreakdown[0].title.slice(0, 18)}...`
                  : "Listo para publicar más contenido"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Tabs Section */}
      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 md:grid-cols-4 w-full h-auto">
          <TabsTrigger value="monthly" className="rounded-lg gap-2 py-2 text-xs md:text-sm">
            <PieChart className="h-4 w-4" />
            <span>Rendimiento Mensual</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="rounded-lg gap-2 py-2 text-xs md:text-sm">
            <BookOpen className="h-4 w-4" />
            <span>Ingresos por Curso</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg gap-2 py-2 text-xs md:text-sm">
            <Receipt className="h-4 w-4" />
            <span>Transacciones</span>
          </TabsTrigger>
          <TabsTrigger value="simulator" className="rounded-lg gap-2 py-2 text-xs md:text-sm">
            <Calculator className="h-4 w-4" />
            <span>Simulador Proyección</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Monthly Analytics Chart */}
        <TabsContent value="monthly" className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg font-bold">Histórico de Ventas e Ingresos</CardTitle>
                <CardDescription>
                  Comparativa visual de ingresos brutos y netos a lo largo del tiempo.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border border-border/50">
                <Button
                  variant={timeframe === "6m" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTimeframe("6m")}
                  className="h-7 text-xs font-medium"
                >
                  6 Meses
                </Button>
                <Button
                  variant={timeframe === "12m" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTimeframe("12m")}
                  className="h-7 text-xs font-medium"
                >
                  12 Meses
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Legend & Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block" />
                    <span className="font-medium text-foreground">Ganancia Neta (85%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-primary/30 inline-block" />
                    <span className="text-muted-foreground">Venta Bruta Total</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>Total en periodo: <strong className="text-foreground">{formatMXN(monthlySeries.reduce((acc, m) => acc + m.netAmount, 0))}</strong></span>
                </div>
              </div>

              {/* Animated Custom SVG Bar Chart */}
              <div className="h-64 w-full pt-4 relative flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-border/60">
                {monthlySeries.map((item, idx) => {
                  const grossHeightPct = (item.amount / maxMonthlyAmount) * 100;
                  const netHeightPct = (item.netAmount / maxMonthlyAmount) * 100;

                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-3 p-2.5 rounded-xl bg-popover text-popover-foreground shadow-lg border border-border/60 text-xs z-20 pointer-events-none whitespace-nowrap min-w-36 space-y-1">
                        <p className="font-semibold text-center border-b border-border/40 pb-1">{item.month}</p>
                        <div className="flex justify-between gap-3 text-emerald-600 dark:text-emerald-400">
                          <span>Ganancia Neta:</span>
                          <span className="font-bold">{formatMXN(item.netAmount)}</span>
                        </div>
                        <div className="flex justify-between gap-3 text-muted-foreground">
                          <span>Venta Bruta:</span>
                          <span>{formatMXN(item.amount)}</span>
                        </div>
                        <div className="flex justify-between gap-3 text-muted-foreground">
                          <span>Inscripciones:</span>
                          <span>{item.enrollments} alumnos</span>
                        </div>
                      </div>

                      {/* Bar Graphic Stack */}
                      <div className="w-full max-w-[48px] bg-muted/30 rounded-t-lg relative overflow-hidden h-full flex items-end justify-center">
                        {/* Gross Height Background */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${grossHeightPct}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          className="w-full bg-primary/20 dark:bg-primary/30 rounded-t-md absolute bottom-0"
                        />
                        {/* Net Height Foreground */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${netHeightPct}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 + 0.1 }}
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 dark:from-emerald-700 dark:to-emerald-500 rounded-t-md absolute bottom-0 group-hover:brightness-110 transition-all"
                        />
                      </div>

                      {/* Month Label */}
                      <span className="mt-3 text-xs font-medium text-muted-foreground capitalize group-hover:text-foreground transition-colors">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Explanatory Note */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Las transferencias netas se procesan automáticamente hacia tu cuenta Stripe Connect registrada cada 7 días o según tu calendario de depósitos.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Course Breakdown */}
        <TabsContent value="courses" className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg font-bold">Rendimiento por Curso</CardTitle>
                <CardDescription>
                  Revisa cuáles cursos han generado mayor número de ventas y contribución financiera.
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar curso..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </CardHeader>

            <CardContent>
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-3">
                  <BookOpen className="h-10 w-10 mx-auto opacity-30" />
                  <p className="text-sm">No se encontraron cursos con ventas registradas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCourses.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className="p-4 rounded-xl bg-card border border-border/60 hover:border-primary/30 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0 overflow-hidden">
                            {course.imageUrl ? (
                              <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover" />
                            ) : (
                              course.title.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm truncate">{course.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span>Precio: {formatMXN(course.price)}</span>
                              <span>•</span>
                              <span>{course.enrollmentsCount} estudiantes</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:justify-end shrink-0">
                          <div className="text-left sm:text-right">
                            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                              {formatMXN(course.netRevenue)}
                            </div>
                            <span className="text-xs text-muted-foreground">Bruto: {formatMXN(course.grossRevenue)}</span>
                          </div>

                          <Badge variant="outline" className="font-semibold text-xs px-2.5 py-1 tracking-normal border-border bg-muted/40">
                            {course.sharePercentage}% del total
                          </Badge>
                        </div>
                      </div>

                      {/* Percentage Share Visual Bar */}
                      <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.sharePercentage}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="bg-emerald-500 h-full rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Transactions */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg font-bold">Historial de Ventas Recientes</CardTitle>
                <CardDescription>
                  Registro detallado de los últimos alumnos inscritos y el desglose de su pago.
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar estudiante o curso..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </CardHeader>

            <CardContent>
              {filteredTx.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-3">
                  <Receipt className="h-10 w-10 mx-auto opacity-30" />
                  <p className="text-sm">No hay transacciones recientes que coincidan con la búsqueda.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {filteredTx.map((tx) => (
                    <div key={tx.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
                          {tx.studentImage ? (
                            <img src={tx.studentImage} alt={tx.studentName} className="h-full w-full object-cover" />
                          ) : (
                            tx.studentName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{tx.studentName}</p>
                          <p className="text-xs text-muted-foreground truncate">{tx.courseTitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(tx.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm block">
                            +{formatMXN(tx.netAmount)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">Bruto {formatMXN(tx.amount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Revenue Simulator */}
        <TabsContent value="simulator" className="space-y-6">
          <Card className="shadow-xs border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold">Simulador de Proyección de Ganancias</CardTitle>
                <Badge variant="outline" className="text-xs border-primary/30 text-primary tracking-normal">Calculadora</Badge>
              </div>
              <CardDescription>
                Proyecta cuánto ganarás al publicar un nuevo curso o lanzar una campaña de inscripciones.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Input Controls */}
                <div className="space-y-6 bg-muted/30 p-5 rounded-2xl border border-border/50">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <label className="font-medium text-foreground">Precio del Curso (MXN)</label>
                      <span className="font-bold text-primary text-base">{formatMXN(calcPrice)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={3000}
                      step={50}
                      value={calcPrice}
                      onChange={(e) => setCalcPrice(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Gratis ($0)</span>
                      <span>$1,500</span>
                      <span>$3,000</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <label className="font-medium text-foreground">Meta de Alumnos por Mes</label>
                      <span className="font-bold text-primary text-base">{calcStudents} alumnos</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={500}
                      step={5}
                      value={calcStudents}
                      onChange={(e) => setCalcStudents(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>1 alumno</span>
                      <span>250 alumnos</span>
                      <span>500 alumnos</span>
                    </div>
                  </div>
                </div>

                {/* Calculation Output Card */}
                <div className="bg-gradient-to-br from-card via-card to-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 shadow-xs flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      Resultado Estimado Mensual
                    </span>

                    <div className="space-y-1">
                      <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatMXN(projectedNet)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tu ganancia neta estimada enviada a tu cuenta bancaria (85%).
                      </p>
                    </div>

                    <div className="divide-y divide-border/40 text-xs space-y-2 pt-2">
                      <div className="flex justify-between pt-2">
                        <span className="text-muted-foreground">Venta Bruta Total:</span>
                        <span className="font-medium text-foreground">{formatMXN(projectedGross)}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-muted-foreground">Comisión Plataforma Cursumi (15%):</span>
                        <span className="font-medium text-rose-500">-{formatMXN(projectedFee)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Sin costos fijos ni mensualidades escondidas.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatMXN(amount: number) {
  return amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });
}
