import { VirtualWhiteboard } from "@/components/whiteboard/virtual-whiteboard";

export const metadata = {
  title: "Pizarrón virtual | Cursumi Instructor",
  description: "Lienzo para dibujar y compartir en clase o reuniones.",
};

export default function InstructorWhiteboardPage() {
  return (
    <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col gap-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pizarrón virtual</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dibuja en pantalla y exporta la imagen para compartirla en videollamadas, proyeccion o material de apoyo.
        </p>
      </div>
      <VirtualWhiteboard />
    </div>
  );
}
