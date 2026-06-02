import { StatsGrid, StatItem } from "@/components/shared/stats-card";

interface StatsCard {
  title: string;
  value: string | number;
  description: string;
}

interface InstructorStatsProps {
  stats: StatsCard[];
}

export const InstructorStatsCards = ({ stats }: InstructorStatsProps) => {
  const statItems: StatItem[] = stats.map((stat) => ({
    title: stat.title,
    value: stat.value,
    description: stat.description,
  }));

  return <StatsGrid stats={statItems} columns={4} />;
};

