import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("next/cache", () => ({ unstable_cache: <T,>(fn: T) => fn }));

const { Hero } = await import("@/components/hero");
const { buildHomeStats } = await import("@/lib/public-stats");

describe("Hero — contadores", () => {
  it("con datos en cero no renderiza ningún número", () => {
    render(
      <Hero stats={buildHomeStats({ studentsCount: 0, instructorsCount: 0, reviewsCount: 0, averageRating: null })} />,
    );
    const section = screen.getByTestId("hero-stats");
    expect(section.textContent).not.toMatch(/\d/);
    expect(screen.getByText("Pago único, acceso de por vida")).toBeTruthy();
    expect(screen.getByText("Instructores verificados")).toBeTruthy();
    expect(screen.getByText("Curso en video o por evento")).toBeTruthy();
    expect(screen.queryByText(/Calificación/)).toBeNull();
  });

  it("arriba del umbral renderiza los valores reales", () => {
    render(
      <Hero stats={buildHomeStats({ studentsCount: 250, instructorsCount: 12, reviewsCount: 40, averageRating: 4.8 })} />,
    );
    const section = screen.getByTestId("hero-stats");
    expect(section.textContent).toContain("250+");
    expect(section.textContent).toContain("12+");
    expect(section.textContent).toContain("4.8");
    expect(section.textContent).not.toMatch(/(^|\D)0\+/);
    expect(screen.queryByText("Instructores verificados")).toBeNull();
  });
});
