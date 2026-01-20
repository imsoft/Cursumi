import { type FieldErrors, type Resolver } from "react-hook-form";
import { z } from "zod";

type FormValues<T extends z.ZodTypeAny> = z.infer<T> & Record<string, unknown>;

/**
 * Crea un resolver personalizado para react-hook-form compatible con Zod v4
 * Esto resuelve la incompatibilidad entre zod v4 y @hookform/resolvers
 */
export function createZodResolver<T extends z.ZodTypeAny>(
  schema: T
): Resolver<FormValues<T>> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data as FormValues<T>,
        errors: {} as Record<string, never>,
      };
    }

    const flattened = result.error.flatten();
    const fieldErrors: FieldErrors<FormValues<T>> = {};
    
    Object.entries(flattened.fieldErrors).forEach(([field, errors]) => {
      const errorArray = errors as string[] | undefined;
      const message = errorArray?.[0];
      if (message) {
        (fieldErrors as Record<string, any>)[field] = {
          type: "manual",
          message,
        };
      }
    });

    // Manejar errores de refine
    if (result.error.issues) {
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          const field = String(issue.path[0]);
          (fieldErrors as Record<string, any>)[field] = {
            type: "manual",
            message: issue.message,
          };
        }
      });
    }

    return {
      values: {} as Record<string, never>,
      errors: fieldErrors,
    };
  };
}
