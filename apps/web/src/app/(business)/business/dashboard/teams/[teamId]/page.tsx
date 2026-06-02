"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Trash2, Plus } from "lucide-react";

interface TeamMember {
  id: string;
  member: {
    id: string;
    user: { id: string; name: string | null; email: string };
  };
}

interface TeamCourse {
  course: { id: string; title: string; imageUrl: string | null };
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  members: TeamMember[];
  courseAccess: TeamCourse[];
}

export default function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/business/teams/${teamId}`)
      .then((r) => r.json())
      .then((d) => setTeam(d.team))
      .finally(() => setLoading(false));
  }, [teamId]);

  async function removeMember(memberId: string) {
    const res = await fetch(`/api/business/teams/${teamId}/members/${memberId}`, {
      method: "DELETE",
    });
    if (res.ok && team) {
      setTeam({
        ...team,
        members: team.members.filter((m) => m.member.id !== memberId),
      });
    }
  }

  if (loading || !team) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/business/dashboard/teams">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={team.name} description={team.description || "Equipo"} />
      </div>

      {/* Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Miembros ({team.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {team.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este equipo no tiene miembros. Agrega miembros desde la sección de empleados.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {team.members.map((tm) => (
                <div key={tm.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {tm.member.user.name || tm.member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{tm.member.user.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeMember(tm.member.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courses assigned to team */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cursos asignados ({team.courseAccess.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {team.courseAccess.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay cursos asignados a este equipo.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {team.courseAccess.map((tc) => (
                <Badge key={tc.course.id} variant="outline">
                  {tc.course.title}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
