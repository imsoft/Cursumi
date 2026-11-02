"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Infinity as InfinityIcon, PlayCircle, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";
import { Fragment } from "react";
import type { HomeStatItem } from "@/lib/public-stats";

interface HeroProps {
  /** Ya calculado en el servidor con `buildHomeStats` (umbrales incluidos). */
  stats: HomeStatItem[];
}

const CLAIM_ICONS = {
  students: InfinityIcon,
  instructors: BadgeCheck,
  rating: PlayCircle,
} as const;

/**
 * Sin animación de conteo: el valor final va en el HTML del servidor. El
 * contador animado arrancaba en 0, así que crawlers, previsualizaciones y
 * cualquiera con JS lento veían "0+".
 */
function HeroStat({ item }: { item: HomeStatItem }) {
  if (item.kind === "claim") {
    const Icon = CLAIM_ICONS[item.key];
    return (
      <div data-testid="hero-stat" className="flex max-w-36 flex-col items-center gap-1.5">
        <Icon className="h-6 w-6 text-primary" aria-hidden />
        <div className="font-medium leading-tight text-foreground">{item.label}</div>
      </div>
    );
  }
  return (
    <div data-testid="hero-stat">
      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
        {item.value}
        {item.kind === "rating" && <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden />}
      </div>
      <div>{item.label}</div>
    </div>
  );
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
      className="relative flex min-h-125 flex-col items-center justify-center overflow-hidden px-4 py-16 text-center"
    >
      {/* Floating background orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-primary/8 blur-3xl"
        animate={{ y: [0, -24, 0], x: [0, 12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[8%] top-[20%] h-56 w-56 rounded-full bg-violet-500/7 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -16, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[10%] left-[30%] h-48 w-48 rounded-full bg-purple-400/6 blur-3xl"
        animate={{ y: [0, 16, 0], x: [0, -8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <motion.div variants={itemVariants} className="mb-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Aprende a tu ritmo o en vivo
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
        Instructores verificados. Cursos en video y eventos en vivo.
        Certificados que los empleadores reconocen.
      </motion.p>

      <motion.div variants={itemVariants} className="flex gap-4">
        <Link href="/courses">
          <Button size="lg" className="gap-2 rounded-full">
            Explorar cursos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/how-it-works">
          <Button size="lg" variant="outline" className="rounded-full">
            Cómo funciona
          </Button>
        </Link>
      </motion.div>

      {stats.length > 0 && (
        <motion.div
          variants={itemVariants}
          data-testid="hero-stats"
          className="mt-12 flex items-center gap-6 text-sm text-muted-foreground sm:gap-8"
        >
          {stats.map((item, idx) => (
            <Fragment key={item.key}>
              {idx > 0 && <div className="h-8 w-px shrink-0 bg-border" />}
              <HeroStat item={item} />
            </Fragment>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
};
