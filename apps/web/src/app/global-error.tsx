"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error.message, error.digest);
  }, [error]);

  return (
    <html lang="es">
      <body className="antialiased">
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
            Error inesperado
          </h1>
          <p style={{ color: "#6b7280", textAlign: "center", maxWidth: "28rem", margin: 0 }}>
            Ocurrió un error grave. Por favor recarga la página o inténtalo más tarde.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre
              style={{
                background: "#f3f4f6",
                padding: "0.75rem",
                borderRadius: "0.375rem",
                fontSize: "0.75rem",
                maxWidth: "42rem",
                overflow: "auto",
                color: "#374151",
              }}
            >
              {error.message}
            </pre>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.25rem",
              background: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
