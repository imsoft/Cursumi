/** Aviso visible solo en pantalla: los márgenes con fecha/URL los añade el navegador al imprimir. */
export function CertificatePdfHint() {
  return (
    <div
      role="note"
      className="print:hidden rounded-lg border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900/80 dark:bg-amber-950/40"
    >
      <p className="font-medium text-foreground">PDF limpio (sin fecha ni URL en los bordes)</p>
      <p className="mt-1.5 leading-relaxed text-muted-foreground">
        Esa información no forma parte del certificado: la inserta el navegador al guardar PDF. En el diálogo de
        impresión, desactiva{" "}
        <span className="font-semibold text-foreground">«Encabezados y pies de página»</span>{" "}
        (Chrome/Edge: <span className="whitespace-nowrap">Más ajustes</span> → desmarcar; Safari: quita encabezados
        y pies). Así desaparecen la fecha, el título de la pestaña, la URL y el número de página.
      </p>
    </div>
  );
}
