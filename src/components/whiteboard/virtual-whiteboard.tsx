"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Eraser,
  Maximize2,
  Minimize2,
  Pencil,
  Redo2,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLORS = [
  "#0f172a",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

const MAX_UNDO = 30;
const DEFAULT_LINE = 4;

type Tool = "pen" | "eraser";

export function VirtualWhiteboard({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const undoRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE);
  const [ready, setReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);

  const getCanvasSize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return null;
    const rect = wrap.getBoundingClientRect();
    // Usar el rect real del contenedor (evita lienzo más ancho que el viewport)
    const w = Math.max(280, Math.floor(rect.width));
    const h = Math.max(200, Math.floor(rect.height));
    return { w, h };
  }, []);

  const snapshot = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return null;
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  const applySnapshot = useCallback((data: ImageData | null) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || !data) return;
    ctx.putImageData(data, 0, 0);
  }, []);

  const resizeAndInit = useCallback(() => {
    const canvas = canvasRef.current;
    const size = getCanvasSize();
    if (!canvas || !size) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.floor(size.w * dpr);
    canvas.height = Math.floor(size.h * dpr);
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.w, size.h);
    ctxRef.current = ctx;
    const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoRef.current = [initial];
    redoRef.current = [];
    setReady(true);
  }, [getCanvasSize]);

  useEffect(() => {
    resizeAndInit();
    const ro = new ResizeObserver(() => resizeAndInit());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [resizeAndInit]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = document.fullscreenElement === rootRef.current;
      setIsFullscreen(active);
      requestAnimationFrame(() => resizeAndInit());
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [resizeAndInit]);

  const toggleFullscreen = useCallback(async () => {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* Safari / permisos */
    }
  }, []);

  const commitStroke = useCallback(() => {
    const snap = snapshot();
    if (!snap) return;
    undoRef.current.push(snap);
    if (undoRef.current.length > MAX_UNDO) undoRef.current.shift();
    redoRef.current = [];
  }, [snapshot]);

  const coords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const me = e as React.MouseEvent;
    return { x: me.clientX - rect.left, y: me.clientY - rect.top };
  };

  const start = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = coords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }
    ctx.lineWidth = tool === "eraser" ? lineWidth * 3 : lineWidth;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = coords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.closePath();
      ctx.globalCompositeOperation = "source-over";
    }
    commitStroke();
  };

  const clearAll = () => {
    const ctx = ctxRef.current;
    const size = getCanvasSize();
    if (!ctx || !size) return;
    const before = snapshot();
    if (before) {
      undoRef.current.push(before);
      if (undoRef.current.length > MAX_UNDO) undoRef.current.shift();
      redoRef.current = [];
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.w, size.h);
    const after = snapshot();
    if (after) {
      undoRef.current.push(after);
      if (undoRef.current.length > MAX_UNDO) undoRef.current.shift();
    }
  };

  const undo = () => {
    if (undoRef.current.length <= 1) return;
    const current = undoRef.current.pop();
    if (current) redoRef.current.push(current);
    const prev = undoRef.current[undoRef.current.length - 1];
    applySnapshot(prev);
  };

  const redo = () => {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(next);
    applySnapshot(next);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `pizarron-cursumi-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex min-w-0 max-w-full flex-col gap-4",
        isFullscreen &&
          "box-border flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col overflow-hidden bg-background p-3 md:p-4",
        className,
      )}
    >
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 overflow-x-auto rounded-xl border border-border bg-card p-3 shadow-sm [-webkit-overflow-scrolling:touch]">
        <div className="flex flex-wrap items-center gap-1 border-r border-border pr-3">
          <Button
            type="button"
            variant={tool === "pen" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("pen")}
            title="Lápiz"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={tool === "eraser" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("eraser")}
            title="Borrador"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-r border-border pr-3">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              disabled={tool === "eraser"}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition ring-offset-2 ring-offset-background",
                color === c && tool === "pen" ? "ring-2 ring-primary" : "border-border",
              )}
              style={{ backgroundColor: c }}
              onClick={() => {
                setTool("pen");
                setColor(c);
              }}
            />
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Grosor
          <input
            type="range"
            min={1}
            max={24}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-24 accent-primary md:w-32"
          />
          <span className="w-6 tabular-nums">{lineWidth}</span>
        </label>

        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={undo} title="Deshacer">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={redo} title="Rehacer">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={clearAll} title="Vaciar pizarrón">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={exportPng} disabled={!ready}>
            <Download className="mr-2 h-4 w-4" />
            PNG
          </Button>
        </div>
      </div>

      <div
        ref={wrapRef}
        className={cn(
          "relative w-full min-w-0 max-w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30",
          isFullscreen ? "min-h-0 flex-1" : "h-[min(56vh,520px)] min-h-[260px]",
        )}
      >
        <canvas
          ref={canvasRef}
          className="touch-none block max-w-full cursor-crosshair bg-white"
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={end}
        />
        {!ready && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Preparando lienzo…
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Funciona con ratón y tactil. Usa <strong className="font-medium text-foreground">PNG</strong> para guardar o
        compartir la imagen en videollamadas y presentaciones.
      </p>
    </div>
  );
}
