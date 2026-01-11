import { type FieldErrorsImpl, type Resolver } from "react-hook-form";
import { z } from "zod";

/**
 * Crea un resolver personalizado para react-hook-form compatible con Zod v4
 * Esto resuelve la incompatibilidad entre zod v4 y @hookform/resolvers
 */
export function createZodResolver<T extends z.ZodTypeAny>(
  schema: T
): Resolver<any> {
  return async (values: any) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const flattened = result.error.flatten();
    const fieldErrors: FieldErrorsImpl<any> = {};
    
    Object.entries(flattened.fieldErrors).forEach(([field, errors]) => {
      const errorArray = errors as string[] | undefined;
      const message = errorArray?.[0];
      if (message) {
        fieldErrors[field] = {
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
          fieldErrors[field] = {
            type: "manual",
            message: issue.message,
          };
        }
      });
    }

    return {
      values: {},
      errors: fieldErrors,
    };
  };
}

