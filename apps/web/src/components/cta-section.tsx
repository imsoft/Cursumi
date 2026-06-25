"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8">
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 text-center shadow-xl"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        {/* Decorative gradient accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 right-1/4 h-40 w-64 rounded-full bg-violet-500/10 blur-3xl"
        />

        <div className="relative flex flex-col items-center gap-6">
          {/* Icon */}
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-inner"
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.45, type: "spring", stiffness: 200 }}
          >
            <Sparkles className="h-7 w-7 text-primary" aria-hidden />
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" as const }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              ¿Listo para el siguiente paso?
            </p>
            <h2 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
              Lanza tu próximo curso con Cursumi
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Publica tu curso en video o por evento y deja que nuestro equipo te
              acompañe en la promoción, logística y certificación.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" as const }}
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 font-semibold shadow-lg"
              >
                Empezar ahora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="font-semibold"
              >
                Hablar con un asesor
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
