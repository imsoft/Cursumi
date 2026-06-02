-- ─── Full-text search (PostgreSQL nativo, sin infraestructura extra) ───────────
--
-- Habilitamos pg_trgm para búsqueda trigrama (ILIKE acelerado con GIN) y
-- añadimos un índice tsvector para búsqueda semántica en español.
--
-- El índice GIN de tsvector permite:
--   WHERE to_tsvector('spanish', title || ' ' || description) @@ plainto_tsquery('spanish', ?)
-- con orden por ts_rank (relevancia), sin escanear la tabla completa.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice GIN trigrama: acelera ILIKE y búsqueda por similitud en título
CREATE INDEX IF NOT EXISTS "Course_title_trgm_idx"
  ON "Course" USING gin(title gin_trgm_ops);

-- Índice GIN tsvector: búsqueda semántica en español (stemming + stopwords)
CREATE INDEX IF NOT EXISTS "Course_fts_idx"
  ON "Course" USING gin(
    to_tsvector('spanish',
      coalesce(title, '') || ' ' || coalesce(description, '')
    )
  );

-- ─── Analytics de aprendizaje ──────────────────────────────────────────────────
--
-- Índices que aceleran las queries del dashboard de analytics del instructor:
--   - Agrupaciones por lessonId para calcular tasa de completitud por lección
--   - Joins entre LessonProgress y Lesson para el funnel de abandono

-- Índice en completedAt para poder ordenar y agrupar por fecha
CREATE INDEX IF NOT EXISTS "LessonProgress_completedAt_idx"
  ON "LessonProgress"("completedAt");

-- Índice compuesto lessonId + enrollmentId para joins rápidos en analytics
CREATE INDEX IF NOT EXISTS "LessonProgress_lessonId_enrollmentId_idx"
  ON "LessonProgress"("lessonId", "enrollmentId");
