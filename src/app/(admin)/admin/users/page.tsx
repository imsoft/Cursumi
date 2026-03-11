"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Users, UserPlus, ShieldCheck } from "lucide-react";

type UserRole = "student" | "instructor" | "admin";
type UserStatus = "active" | "inactive" | "suspended";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  coursesCount?: number;
}

const roleOptions = [
  { value: "all", label: "Todos" },
  { value: "student", label: "Estudiantes" },
  { value: "instructor", label: "Instructores" },
  { value: "admin", label: "Administradores" },
];

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "suspended", label: "Suspendidos" },
];

const getRoleBadge = (role: UserRole) => {
  const variants: Record<UserRole, "default" | "outline"> = {
    student: "outline",
    instructor: "default",
    admin: "default",
  };
  const labels: Record<UserRole, string> = {
    student: "Estudiante",
    instructor: "Instructor",
    admin: "Admin",
  };
  return { variant: variants[role], label: labels[role] };
};

const getStatusBadge = (status: UserStatus) => {
  const colors: Record<UserStatus, string> = {
    active: "bg-green-600 hover:bg-green-700",
    inactive: "bg-gray-600 hover:bg-gray-700",
    suspended: "bg-red-600 hover:bg-red-700",
  };
  const labels: Record<UserStatus, string> = {
    active: "Activo",
    inactive: "Inactivo",
    suspended: "Suspendido",
  };
  return { color: colors[status], label: labels[status] };
};

type RoleTarget = { id: string; name: string; newRole: UserRole } | null;

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleTarget, setRoleTarget] = useState<RoleTarget>(null);
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("No pudimos cargar usuarios");
        }
        const data = (await res.json()) as Omit<User, "status">[];
        const withStatus = data.map((u) => ({ ...u, status: "active" as UserStatus }));
        setUsers(withStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const searchLower = searchTerm.trim().toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      })
      .filter((user) => {
        if (roleFilter === "all") return true;
        return user.role === roleFilter;
      })
      .filter((user) => {
        if (statusFilter === "all") return true;
        return user.status === statusFilter;
      });
  }, [searchTerm, roleFilter, statusFilter]);

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setChangingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${roleTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleTarget.newRole }),
      });
      if (!res.ok) throw new Error("No se pudo cambiar el rol");
      setUsers((prev) =>
        prev.map((u) => (u.id === roleTarget.id ? { ...u, role: roleTarget.newRole } : u))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar el rol");
    } finally {
      setChangingRole(false);
      setRoleTarget(null);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm.trim() !== "" || roleFilter !== "all" || statusFilter !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Administra usuarios de la plataforma"
        action={{
          label: "Nuevo usuario",
          href: "/admin/users/new",
          variant: "default",
          icon: <UserPlus className="mr-2 h-4 w-4" />,
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card className="border border-border bg-card/90">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <Input
                label="Buscar usuario"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="grid w-full gap-4 md:w-auto md:grid-cols-2">
              <Select
                label="Rol"
                options={roleOptions}
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              />
              <Select
                label="Estado"
                options={statusOptions}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              />
            </div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                disabled={!hasActiveFilters}
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border border-border bg-card/90">
          <CardContent className="py-12 text-center text-muted-foreground">Cargando usuarios...</CardContent>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="Ningún usuario coincide"
          description="Ajusta los filtros de búsqueda."
          icon={Users}
          secondaryAction={
            hasActiveFilters
              ? {
                  label: "Limpiar filtros",
                  onClick: handleClearFilters,
                  variant: "outline",
                }
              : undefined
          }
        />
      ) : (
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>
              Usuarios ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const statusBadge = getStatusBadge(user.status);
                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{user.name}</h3>
                        <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>Registrado: {user.createdAt}</span>
                        {user.coursesCount !== undefined && (
                          <span>{user.coursesCount} cursos</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.role !== "instructor" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setRoleTarget({
                              id: user.id,
                              name: user.name,
                              newRole: "instructor",
                            })
                          }
                        >
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          Hacer instructor
                        </Button>
                      )}
                      {user.role !== "student" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setRoleTarget({
                              id: user.id,
                              name: user.name,
                              newRole: "student",
                            })
                          }
                        >
                          Hacer estudiante
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Confirmation modal for role change */}
      {roleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold text-foreground">Cambiar rol</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              ¿Estás seguro de que deseas cambiar el rol de{" "}
              <strong>{roleTarget.name}</strong> a{" "}
              <strong>
                {roleTarget.newRole === "instructor" ? "Instructor" : "Estudiante"}
              </strong>
              ? Esta acción puede afectar el acceso a la plataforma.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRoleTarget(null)}
                disabled={changingRole}
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={handleRoleChange} disabled={changingRole}>
                {changingRole ? "Cambiando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
