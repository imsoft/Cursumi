"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Ingresa un correo válido"),
  subject: z.string().min(1, "El asunto es requerido"),
  reason: z.enum(["soporte", "instructores", "cursos", "otro"]),
  message: z.string().min(1, "El mensaje no puede estar vacío"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const reasonOptions = [
  { value: "soporte", label: "Soporte" },
  { value: "instructores", label: "Instructores" },
  { value: "cursos", label: "Cursos" },
  { value: "otro", label: "Otro" },
];

export const ContactForm = () => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: createZodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      reason: "soporte",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al enviar mensaje");
      }
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-green-300 bg-green-50 p-8 text-center dark:border-green-700 dark:bg-green-950/20">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Mensaje enviado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Te responderemos en menos de 24 horas hábiles.
          </p>
        </div>
        <Button variant="outline" onClick={() => setSent(false)}>
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
      aria-label="Formulario de contacto"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Input
            label="Nombre completo"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div>
          <Input
            label="Correo electrónico"
            type="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>
      <Input
        label="Asunto"
        {...form.register("subject")}
      />
      <Select
        label="Motivo"
        options={reasonOptions}
        {...form.register("reason")}
      />
      <Textarea
        label="Mensaje"
        {...form.register("message")}
      />
      {form.formState.errors.message && (
        <p className="mt-1 text-xs text-destructive">
          {form.formState.errors.message.message}
        </p>
      )}
      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={sending}>
        {sending ? "Enviando..." : "Enviar mensaje"}
      </Button>
    </form>
  );
};
