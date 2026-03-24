"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Trash2, X } from "lucide-react";

interface Member {
  id: string;
  orgRole: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    enrollments: { progress: number }[];
  };
  teamMemberships: { team: { name: string } }[];
}

interface Invite {
  id: string;
  email: string;
  orgRole: string;
  status: string;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  owner: "Dueño",
  admin: "Admin",
  member: "Empleado",
};

export default function EmployeesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/business/members").then((r) => r.json()),
      fetch("/api/business/invitations").then((r) => r.json()),
    ])
      .then(([mData, iData]) => {
        setMembers(mData.members || []);
        setInvites(iData.invitations || []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    try {
      const res = await fetch("/api/business/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "Error al enviar invitación");
        return;
      }
      setInvites((prev) => [data.invite, ...prev]);
      setInviteEmail("");
      setShowInviteForm(false);
    } catch {
      setInviteError("Error de conexión");
    } finally {
      setInviting(false);
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm("¿Eliminar a este miembro de la organización?")) return;
    const res = await fetch(`/api/business/members/${memberId}`, { method: "DELETE" });
    if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  async function cancelInvite(inviteId: string) {
    await fetch(`/api/business/invitations/${inviteId}`, { method: "DELETE" });
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
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
      <PageHeader
        title="Empleados"
        description="Gestiona los miembros de tu organización"
      />

      <div className="flex gap-3">
        <Button onClick={() => setShowInviteForm(!showInviteForm)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invitar empleado
        </Button>
      </div>

      {showInviteForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[250px]">
                <Input
                  type="email"
                  placeholder="email@empresa.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  label="Email del empleado"
                />
              </div>
              <Button type="submit" disabled={inviting} className="gap-2">
                <Mail className="h-4 w-4" />
                {inviting ? "Enviando..." : "Enviar invitación"}
              </Button>
            </form>
            {inviteError && <p className="mt-2 text-sm text-destructive">{inviteError}</p>}
          </CardContent>
        </Card>
      )}

      {/* Pending invites */}
      {invites.filter((i) => i.status === "pending").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invitaciones pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {invites
                .filter((i) => i.status === "pending")
                .map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{invite.email}</span>
                      <Badge variant="outline">Pendiente</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => cancelInvite(invite.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Miembros ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {members.map((m) => {
              const avgProgress =
                m.user.enrollments.length > 0
                  ? Math.round(m.user.enrollments.reduce((s, e) => s + e.progress, 0) / m.user.enrollments.length)
                  : 0;
              return (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {m.user.name?.[0]?.toUpperCase() || m.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.user.name || m.user.email}</p>
                      <p className="text-xs text-muted-foreground">{m.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {m.teamMemberships.length > 0 && (
                      <div className="hidden sm:flex gap-1">
                        {m.teamMemberships.map((tm) => (
                          <Badge key={tm.team.name} variant="outline" className="text-xs">
                            {tm.team.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {avgProgress}% avance
                    </span>
                    <Badge variant="outline">{roleLabels[m.orgRole] || m.orgRole}</Badge>
                    {m.orgRole !== "owner" && (
                      <Button variant="ghost" size="sm" onClick={() => removeMember(m.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
