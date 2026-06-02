import { ApiError } from "@/lib/api-helpers";
import { getUserRole } from "@/lib/user-service";
import { resolveOrgAdmin } from "@/lib/org-service";

/** Instructor/admin o administrador de organización (subida de materials). */
export async function authorizeCloudinaryUploader(userId: string) {
  const role = await getUserRole(userId);
  if (role === "instructor" || role === "admin") return;
  try {
    await resolveOrgAdmin(userId);
  } catch {
    throw new ApiError(403, "No autorizado");
  }
}
