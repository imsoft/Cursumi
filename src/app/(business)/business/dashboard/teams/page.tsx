"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, BookOpenCheck, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface Team {
  id: string;
  name: string;
  description: string | null;
  _count: { members: number; courseAccess: number };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/business/teams")
      .then((r) => r.json())
      .then((d) => setTeams(d.teams || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/business/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setTeams((prev) => [...prev, { ...data.team, _count: { members: 0, courseAccess: 0 } }]);
        setNewName("");
        setShowForm(false);
      }
    } finally {
      setCreating(false);
    }
  }

  async function deleteTeam(id: string) {
    if (!confirm("¿Eliminar este equipo?")) return;
    const res = await fetch(`/api/business/teams/${id}`, { method: "DELETE" });
    if (res.ok) setTeams((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Equipos" description="Organiza a tus empleados en equipos" />

      <div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear equipo
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="flex items-end gap-3">
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="Nombre del equipo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  label="Nombre"
                />
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? "Creando..." : "Crear"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tienes equipos aún"
          description="Crea tu primer equipo para organizar a tus colaboradores"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => deleteTeam(team.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {team.description && (
                  <p className="text-sm text-muted-foreground">{team.description}</p>
                )}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {team._count.members} miembros
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpenCheck className="h-4 w-4" />
                    {team._count.courseAccess} cursos
                  </span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/business/dashboard/teams/${team.id}`}>Administrar</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
