"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export type ProfileField = {
  key: string;
  label: string;
  filled: boolean;
  /** Hash fragment to focus the field on the account page, e.g. #phone */
  anchor: string;
};

interface ProfileCompletenessProps {
  fields: ProfileField[];
}

export function ProfileCompleteness({ fields }: ProfileCompletenessProps) {
  const filled = fields.filter((f) => f.filled).length;
  const total = fields.length;
  const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
  const missing = fields.filter((f) => !f.filled);

  if (percent === 100) return null;

  // SVG circular progress
  const size = 80;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const color =
    percent >= 80 ? "text-green-500" : percent >= 50 ? "text-yellow-500" : "text-red-500";

  return (
    <Card className="border border-border bg-card/90">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Completa tu perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5">
          {/* Circular progress */}
          <div className="relative shrink-0">
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                className="stroke-muted"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={`${color} transition-all duration-500`}
                style={{ stroke: "currentColor" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
              {percent}%
            </span>
          </div>

          {/* Missing fields */}
          <div className="flex-1 space-y-1.5">
            <p className="text-sm text-muted-foreground">
              {filled}/{total} campos completados
            </p>
            <div className="space-y-1">
              {missing.map((field) => (
                <Link
                  key={field.key}
                  href={`/dashboard/account?tab=profile&focus=${field.key}`}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-primary transition-colors hover:bg-primary/10"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                  {field.label}
                  <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
