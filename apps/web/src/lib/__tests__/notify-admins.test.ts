import { describe, it, expect, vi, beforeEach } from "vitest";

type Created = { userId: string; type: string; title: string; body: string; link: string | null };
const created: Created[] = [];
let admins: { id: string }[] = [];
let failFind = false;

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(async () => {
        if (failFind) throw new Error("BD caída");
        return admins;
      }),
    },
    notification: {
      create: vi.fn(async ({ data }: { data: Created }) => {
        created.push(data);
        return data;
      }),
    },
  },
}));
vi.mock("@/lib/web-push", () => ({ sendPushToUser: vi.fn(async () => {}) }));
vi.mock("@/lib/expo-push", () => ({ sendExpoPushToUser: vi.fn(async () => {}) }));

const { notifyAdmins } = await import("@/lib/notification-helpers");

describe("notifyAdmins", () => {
  beforeEach(() => {
    created.length = 0;
    admins = [{ id: "admin-1" }];
    failFind = false;
  });

  it("avisa al administrador con su enlace", async () => {
    await notifyAdmins({
      type: "instructor_application",
      title: "Nueva solicitud de instructor",
      body: "Alguien quiere impartir cursos.",
      link: "/admin/instructor-applications",
    });

    expect(created).toHaveLength(1);
    expect(created[0].userId).toBe("admin-1");
    expect(created[0].type).toBe("instructor_application");
    expect(created[0].link).toBe("/admin/instructor-applications");
  });

  it("avisa a TODOS los administradores, no solo al primero", async () => {
    admins = [{ id: "admin-1" }, { id: "admin-2" }, { id: "admin-3" }];
    await notifyAdmins({ type: "x", title: "t", body: "b" });
    expect(created.map((c) => c.userId).sort()).toEqual(["admin-1", "admin-2", "admin-3"]);
  });

  it("sin administradores no falla ni crea nada", async () => {
    admins = [];
    await expect(notifyAdmins({ type: "x", title: "t", body: "b" })).resolves.toBeUndefined();
    expect(created).toHaveLength(0);
  });

  it("si la BD falla, no lanza: el aviso al admin nunca tumba la acción del usuario", async () => {
    failFind = true;
    await expect(notifyAdmins({ type: "x", title: "t", body: "b" })).resolves.toBeUndefined();
    expect(created).toHaveLength(0);
  });
});
