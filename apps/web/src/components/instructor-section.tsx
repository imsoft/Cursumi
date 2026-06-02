"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Shield } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    text: "Promoción en campañas enfocadas a estudiantes activos",
  },
  {
    icon: BarChart3,
    text: "Panel de instructor con métricas en tiempo real",
  },
  {
    icon: Shield,
    text: "Soporte completo en la logística de cursos presenciales",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariant: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export const InstructorSection = () => {
  return (
    <section id="instructores" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-violet-700 p-8 shadow-2xl shadow-primary/25 md:p-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-white/6 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-2xl"
        />

        <div className="relative grid gap-10 md:grid-cols-[1.3fr_0.7fr]">
          {/* Left content */}
          <div className="space-y-6">
            <motion.p
              className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              Para instructores
            </motion.p>
            <motion.h2
              className="text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              Publica tu curso y llega a los estudiantes que lo necesitan
            </motion.h2>
            <motion.p
              className="text-base leading-relaxed text-white/80"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Con Cursumi accedes a estudiantes que buscan formación de calidad,
              tanto en línea como presencial. Te acompañamos desde la publicación
              hasta la entrega del certificado.
            </motion.p>
            <motion.ul
              className="space-y-4"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.li key={item.text} variants={itemVariant} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <Icon className="h-3.5 w-3.5 text-white" aria-hidden />
                    </div>
                    <span className="text-sm leading-relaxed text-white/90">
                      {item.text}
                    </span>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>

          {/* Right CTA */}
          <motion.div
            className="flex flex-col items-start justify-center gap-4"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.55, ease: "easeOut" }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/50">
              ¿Listo para impactar?
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold shadow-lg"
              >
                Convertirme en instructor
              </Button>
            </Link>
            <p className="max-w-xs text-sm text-white/65">
              Te contactamos en menos de 24h y te guiamos con precios, logística
              y validación.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
