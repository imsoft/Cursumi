"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

  const onSubmit = (values: ContactFormValues) => {
    console.log("Enviar mensaje", values);
    form.reset();
  };

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
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Enviar mensaje
      </Button>
    </form>
  );
};

