-- Tipos de lección para test/minijuego como lección normal (además del modelo legacy en CourseSection).
ALTER TYPE "LessonType" ADD VALUE IF NOT EXISTS 'section_quiz';
ALTER TYPE "LessonType" ADD VALUE IF NOT EXISTS 'section_minigame';
