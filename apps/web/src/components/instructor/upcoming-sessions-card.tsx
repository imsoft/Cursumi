import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingSession } from "@/components/instructor/types";

interface UpcomingSessionsCardProps {
  sessions: UpcomingSession[];
}

export const UpcomingSessionsCard = ({ sessions }: UpcomingSessionsCardProps) => {
  return (
    <Card className="border border-border bg-card/90">
      <CardHeader>
        <CardTitle className="text-lg">Próximas sesiones</CardTitle>
        <p className="text-sm text-muted-foreground font-normal mt-1">
          Sesiones programadas de tus cursos
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-xl border border-border/60 bg-background/60 p-3">
            <p className="text-sm font-semibold text-foreground">{session.courseTitle}</p>
            <p className="text-xs text-muted-foreground">
              {session.dateTime} · {session.modality}
            </p>
            {session.city && (
              <p className="text-xs text-muted-foreground">Ciudad: {session.city}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

