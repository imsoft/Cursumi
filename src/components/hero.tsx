"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";
import type { PublicStats } from "@/lib/public-stats";

interface HeroProps {
  stats: PublicStats;
}

export const Hero = ({ stats }: HeroProps) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      id="hero"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[500px] flex-col items-center justify-center px-4 py-16 text-center"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Plataforma de formación presencial y online
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="mb-6 text-5xl font-bold tracking-tight md:text-7xl"
      >
        El conocimiento que
        <br />
        <span className="bg-linear-to-r from-primary via-violet-500 to-purple-400 bg-clip-text text-transparent">
          cambia carreras
        </span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mb-8 max-w-2xl text-lg text-muted-foreground"
      >
        Instructores verificados. Cursos virtuales y presenciales.
        Certificados que los empleadores reconocen.
      </motion.p>

      <motion.div variants={itemVariants} className="flex gap-4">
        <Link href="/courses">
          <Button size="lg" className="gap-2">
            Explorar cursos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/how-it-works">
          <Button size="lg" variant="outline">
            Cómo funciona
          </Button>
        </Link>
      </motion.div>

      {(stats.studentsCount > 0 || stats.instructorsCount > 0 || stats.citiesCount > 0) && (
        <motion.div
          variants={itemVariants}
          className="mt-12 flex items-center gap-8 text-sm text-muted-foreground"
        >
          {stats.studentsCount > 0 && (
            <>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.studentsCount.toLocaleString()}
                </div>
                <div>Estudiantes</div>
              </div>
              <div className="h-8 w-px bg-border" />
            </>
          )}
          {stats.instructorsCount > 0 && (
            <>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.instructorsCount.toLocaleString()}
                </div>
                <div>Instructores</div>
              </div>
              <div className="h-8 w-px bg-border" />
            </>
          )}
          {stats.averageRating != null && (
            <div>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
                {stats.averageRating % 1 === 0
                  ? stats.averageRating
                  : stats.averageRating.toFixed(1)}
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <div>Valoración media</div>
            </div>
          )}
        </motion.div>
      )}
    </motion.section>
  );
};
