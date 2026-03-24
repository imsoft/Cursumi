import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";

export default async function OrgMaterialsPage() {
  const session = await getCachedSession();
  if (!session) redirect("/login");

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    select: {
      organization: {
        select: {
          name: true,
          materials: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              description: true,
              fileUrl: true,
              fileType: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!membership) redirect("/dashboard");

  const { name: orgName, materials } = membership.organization;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Materiales"
        description={`Recursos compartidos por ${orgName}`}
      />

      {materials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Tu empresa aún no ha compartido materiales.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-start gap-3 pt-6">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm hover:underline line-clamp-1"
                  >
                    {m.name}
                  </a>
                  {m.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {m.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground uppercase">
                    {m.fileType || "archivo"}
                  </p>
                </div>
                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-md p-1.5 hover:bg-muted"
                >
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
