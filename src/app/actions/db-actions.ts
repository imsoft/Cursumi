"use server";

import { getDb } from "@/lib/db";

/**
 * Server Action de ejemplo: Obtener la versión de PostgreSQL
 */
export async function getPostgresVersion() {
  try {
    const sql = getDb();
    const response = await sql`SELECT version()`;
    return { success: true, version: response[0]?.version || "Unknown" };
  } catch (error) {
    console.error("Error al obtener versión de PostgreSQL:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    };
  }
}

/**
 * Server Action de ejemplo: Crear una tabla de prueba
 */
export async function createTestTable() {
  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS test_comments (
        id SERIAL PRIMARY KEY,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return { success: true, message: "Tabla creada exitosamente" };
  } catch (error) {
    console.error("Error al crear tabla:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    };
  }
}

/**
 * Server Action de ejemplo: Insertar un comentario
 */
export async function insertComment(comment: string) {
  try {
    const sql = getDb();
    const result = await sql`
      INSERT INTO test_comments (comment) 
      VALUES (${comment})
      RETURNING id, comment, created_at
    `;
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error al insertar comentario:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    };
  }
}

/**
 * Server Action de ejemplo: Obtener todos los comentarios
 */
export async function getComments() {
  try {
    const sql = getDb();
    const result = await sql`
      SELECT id, comment, created_at 
      FROM test_comments 
      ORDER BY created_at DESC
    `;
    return { success: true, data: result };
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido",
      data: []
    };
  }
}

