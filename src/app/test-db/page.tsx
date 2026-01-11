import { getDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestDbForm } from "@/components/test-db-form";

/**
 * Server Component de ejemplo: Obtener versión de PostgreSQL
 */
async function PostgresVersion() {
  try {
    const sql = getDb();
    const response = await sql`SELECT version()`;
    const version = response[0]?.version || "Unknown";
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Versión de PostgreSQL (Server Component)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm">{version}</p>
        </CardContent>
      </Card>
    );
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error de conexión</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Error desconocido"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Asegúrate de tener configurada la variable DATABASE_URL en tu archivo .env.local
          </p>
        </CardContent>
      </Card>
    );
  }
}

export default async function TestDbPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Prueba de conexión Neon</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Esta página demuestra cómo conectar Next.js con Neon PostgreSQL
        </p>
      </div>

      <PostgresVersion />

      <TestDbForm />
    </div>
  );
}

