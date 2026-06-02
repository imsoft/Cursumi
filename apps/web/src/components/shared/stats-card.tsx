"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LucideIcon,
  Users,
  BookOpenCheck,
  TrendingUp,
  DollarSign,
  BarChart3,
  Wallet,
  CreditCard,
  Receipt,
  GraduationCap,
  BookOpen,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  BookOpenCheck,
  TrendingUp,
  DollarSign,
  BarChart3,
  Wallet,
  CreditCard,
  Receipt,
  GraduationCap,
  BookOpen,
  Award,
};

export interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  subtitle?: string;
  /** Use from client components */
  icon?: LucideIcon;
  /** Use from server components (serializable); e.g. "Users", "DollarSign" */
  iconName?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface StatsCardProps {
  stat: StatItem;
  className?: string;
}

export const StatsCard = ({ stat, className }: StatsCardProps) => {
  const Icon = stat.icon ?? (stat.iconName ? ICON_MAP[stat.iconName] : undefined);

  return (
    <Card className={cn("border border-border bg-card/90", className)}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0 pb-2",
        !Icon && "px-4 pt-4"
      )}>
        <CardTitle className={cn(
          "font-medium text-muted-foreground",
          Icon ? "text-sm" : "text-lg font-semibold"
        )}>
          {stat.title}
        </CardTitle>
        {Icon && (
          <Icon className={cn("h-4 w-4", stat.iconColor || "text-muted-foreground")} />
        )}
      </CardHeader>
      <CardContent className={Icon ? "" : "px-4 pb-4 pt-0"}>
        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
        {stat.description && (
          <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
        )}
        {stat.subtitle && (
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-1">
            {stat.subtitle}
          </p>
        )}
        {stat.trend && (
          <p className={cn(
            "text-xs mt-1",
            stat.trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {stat.trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const StatsGrid = ({ stats, columns = 4, className }: StatsGridProps) => {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {stats.map((stat) => (
        <StatsCard key={stat.title} stat={stat} />
      ))}
    </div>
  );
};

