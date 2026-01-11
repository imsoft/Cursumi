"use client";

import { StatsGrid, StatItem } from "@/components/shared/stats-card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
}

interface StudentStatsCardsProps {
  stats: StatCardProps[];
}

export const StudentStatsCards = ({ stats }: StudentStatsCardsProps) => {
  const statItems: StatItem[] = stats.map((stat) => ({
    title: stat.title,
    value: stat.value,
    subtitle: stat.subtitle,
  }));

  return <StatsGrid stats={statItems} columns={4} />;
};

