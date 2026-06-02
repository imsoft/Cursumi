import { neon } from '@neondatabase/serverless';

/**
 * Crea una conexión a la base de datos Neon
 * Usa la variable de entorno DATABASE_URL
 * 
 * @example
 * ```ts
 * const sql = getDb();
 * const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
 * ```
 */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL no está definida en las variables de entorno');
  }
  
  return neon(databaseUrl);
}

