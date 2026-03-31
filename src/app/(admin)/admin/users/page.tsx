"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  MailCheck,
  MailX,
  Send,
  CheckCircle2,
} from "lucide-react";

type UserRole = "student" | "instructor" | "admin";
type UserStatus = "active" | "inactive" | "suspended";

interface EnrolledCourse {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  modality: string;
  progress: number;
  status: string;
  enrolledAt: string;
}

interface TeachingCourse {
  courseId: string;
  courseTitle: string;
  modality: string;
  status: string;
  studentsCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  coursesCount?: number;
  enrolledCourses?: EnrolledCourse[];
  teachingCourses?: TeachingCourse[];
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
type VerifyTarget = { id: string; name: string; email: string; action: "verify-email" | "resend-verification" } | null;

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleTarget, setRoleTarget] = useState<RoleTarget>(null);
  const [changingRole, setChangingRole] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<VerifyTarget>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifySuccessId, setVerifySuccessId] = useState<string | null>(null);

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
  }, [users, searchTerm, roleFilter, statusFilter]);

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

  const handleVerifyAction = async () => {
    if (!verifyTarget) return;
    setVerifyLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${verifyTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: verifyTarget.action }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al procesar la acción");
      }
      if (verifyTarget.action === "verify-email") {
        // Actualizar el estado local del usuario
        setUsers((prev) =>
          prev.map((u) => (u.id === verifyTarget.id ? { ...u, emailVerified: true } : u))
        );
        setVerifySuccessId(verifyTarget.id);
        setTimeout(() => setVerifySuccessId(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la acción");
    } finally {
      setVerifyLoading(false);
      setVerifyTarget(null);
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <Input
                label="Buscar usuario"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="grid w-full grid-cols-2 gap-4 sm:w-auto">
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
                const isExpanded = expandedUser === user.id;
                const hasEnrolled = (user.enrolledCourses?.length ?? 0) > 0;
                const hasTeaching = (user.teachingCourses?.length ?? 0) > 0;
                const hasCourses = hasEnrolled || hasTeaching;
                const justVerified = verifySuccessId === user.id;
                return (
                  <div
                    key={user.id}
                    className="rounded-lg border border-border bg-background overflow-hidden"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{user.name}</h3>
                          <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                          {/* Email verification badge */}
                          {user.emailVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-2 py-0.5 text-xs font-medium text-emerald-500">
                              <MailCheck className="h-3 w-3" />
                              Verificado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-600/15 px-2 py-0.5 text-xs font-medium text-amber-500">
                              <MailX className="h-3 w-3" />
                              Sin verificar
                            </span>
                          )}
                          {justVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs font-semibold text-emerald-400 animate-pulse">
                              <CheckCircle2 className="h-3 w-3" /> ¡Verificado!
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span>Registrado: {new Date(user.createdAt).toLocaleDateString("es-MX")}</span>
                          {hasEnrolled && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {user.enrolledCourses!.length} {user.enrolledCourses!.length === 1 ? "taller inscrito" : "talleres inscritos"}
                            </span>
                          )}
                          {hasTeaching && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {user.teachingCourses!.length} {user.teachingCourses!.length === 1 ? "taller como instructor" : "talleres como instructor"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        {hasCourses && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            <span className="ml-1 text-xs">Talleres</span>
                          </Button>
                        )}
                        {/* Verify / Resend email buttons — only for unverified users */}
                        {!user.emailVerified && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                              onClick={() =>
                                setVerifyTarget({
                                  id: user.id,
                                  name: user.name,
                                  email: user.email,
                                  action: "resend-verification",
                                })
                              }
                            >
                              <Send className="mr-1 h-3 w-3" />
                              Reenviar email
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                              onClick={() =>
                                setVerifyTarget({
                                  id: user.id,
                                  name: user.name,
                                  email: user.email,
                                  action: "verify-email",
                                })
                              }
                            >
                              <MailCheck className="mr-1 h-3 w-3" />
                              Verificar ahora
                            </Button>
                          </>
                        )}
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

                    {/* Expanded course details */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-3">
                        {hasEnrolled && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Talleres inscritos
                            </p>
                            <div className="space-y-2">
                              {user.enrolledCourses!.map((ec) => (
                                <div key={ec.enrollmentId} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate">{ec.courseTitle}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Inscrito: {new Date(ec.enrolledAt).toLocaleDateString("es-MX")} · {ec.modality}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3 ml-4 shrink-0">
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-foreground">{ec.progress}%</p>
                                      <p className="text-xs text-muted-foreground">progreso</p>
                                    </div>
                                    <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{ width: `${Math.min(ec.progress, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {hasTeaching && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Talleres como instructor
                            </p>
                            <div className="space-y-2">
                              {user.teachingCourses!.map((tc) => (
                                <div key={tc.courseId} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate">{tc.courseTitle}</p>
                                    <p className="text-xs text-muted-foreground">{tc.modality} · {tc.status}</p>
                                  </div>
                                  <div className="flex items-center gap-1 ml-4 shrink-0">
                                    <Users className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm font-medium">{tc.studentsCount}</span>
                                    <span className="text-xs text-muted-foreground">inscritos</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {!hasCourses && (
                          <p className="text-sm text-muted-foreground">Sin talleres registrados.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation modal for role change */}
      {roleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg max-h-[90svh] overflow-y-auto">
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

      {/* Confirmation modal for email verification actions */}
      {verifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg max-h-[90svh] overflow-y-auto">
            {verifyTarget.action === "verify-email" ? (
              <>
                <h2 className="mb-2 text-lg font-semibold text-foreground">Verificar correo manualmente</h2>
                <p className="mb-2 text-sm text-muted-foreground">
                  Esto marcará el correo de <strong>{verifyTarget.name}</strong> ({verifyTarget.email}) como verificado sin necesidad de que el usuario haga clic en el enlace.
                </p>
                <p className="mb-6 text-xs text-muted-foreground bg-muted/50 rounded-md p-3 border border-border">
                  💡 Usa esta opción cuando el usuario confirma que es dueño del correo pero nunca recibió el email de verificación.
                </p>
              </>
            ) : (
              <>
                <h2 className="mb-2 text-lg font-semibold text-foreground">Reenviar correo de verificación</h2>
                <p className="mb-2 text-sm text-muted-foreground">
                  Se enviará un nuevo enlace de verificación a <strong>{verifyTarget.email}</strong>.
                </p>
                <p className="mb-6 text-xs text-muted-foreground bg-muted/50 rounded-md p-3 border border-border">
                  💡 El enlace anterior quedará invalidado. El nuevo enlace expira en 24 horas.
                </p>
              </>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVerifyTarget(null)}
                disabled={verifyLoading}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleVerifyAction}
                disabled={verifyLoading}
                className={verifyTarget.action === "verify-email" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              >
                {verifyLoading
                  ? "Procesando..."
                  : verifyTarget.action === "verify-email"
                  ? "Verificar ahora"
                  : "Enviar correo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
