import { VirtualWhiteboard } from "@/components/whiteboard/virtual-whiteboard";

export const metadata = {
  title: "Pizarrón virtual | Cursumi Admin",
  description: "Lienzo para dibujar y compartir en reuniones o presentaciones.",
};

export default function AdminWhiteboardPage() {
  return (
    <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col gap-4 overflow-hidden">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pizarrón virtual</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mismo lienzo que el de instructores: dibuja, borra y descarga PNG cuando lo necesites.
        </p>
      </div>
      <VirtualWhiteboard />
    </div>
  );
}
