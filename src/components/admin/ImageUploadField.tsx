"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREVIEW_SIZE = 280;
const OUTPUT_SIZE = 1200;
const OUTPUT_TYPE = "image/webp";
const OUTPUT_QUALITY = 0.9;
const CENTER_SNAP_THRESHOLD = 3;
const PAN_OUTSIDE_MARGIN = PREVIEW_SIZE * 0.45;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.01;

type Point = { x: number; y: number };
type ImageSize = { width: number; height: number };

type ImageUploadFieldProps = {
  name: string;
  inputClassName: string;
  accept?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clampPan(pan: Point, zoom: number, imageSize: ImageSize | null): Point {
  if (!imageSize) return { x: 0, y: 0 };

  const scale =
    Math.max(PREVIEW_SIZE / imageSize.width, PREVIEW_SIZE / imageSize.height) * zoom;
  const maxX = Math.max(0, (imageSize.width * scale - PREVIEW_SIZE) / 2);
  const maxY = Math.max(0, (imageSize.height * scale - PREVIEW_SIZE) / 2);

  return {
    x: clamp(pan.x, -(maxX + PAN_OUTSIDE_MARGIN), maxX + PAN_OUTSIDE_MARGIN),
    y: clamp(pan.y, -(maxY + PAN_OUTSIDE_MARGIN), maxY + PAN_OUTSIDE_MARGIN),
  };
}

function snapPanToCenter(pan: Point): Point {
  return {
    x: Math.abs(pan.x) <= CENTER_SNAP_THRESHOLD ? 0 : pan.x,
    y: Math.abs(pan.y) <= CENTER_SNAP_THRESHOLD ? 0 : pan.y,
  };
}

function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  size: number,
  zoom: number,
  pan: Point,
) {
  const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight) * zoom;
  const panScale = size / PREVIEW_SIZE;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (size - width) / 2 + pan.x * panScale;
  const y = (size - height) / 2 + pan.y * panScale;

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(image, x, y, width, height);
}

function drawGuides(ctx: CanvasRenderingContext2D, size: number) {
  ctx.save();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);

  for (const position of [size / 3, (size * 2) / 3]) {
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(size, position);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(249, 115, 22, 0.9)";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();

  ctx.restore();
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("No se pudo preparar la imagen."));
        }
      },
      OUTPUT_TYPE,
      OUTPUT_QUALITY,
    );
  });
}

function outputFileName(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "imagen";
  return `${base}.webp`;
}

export function ImageUploadField({
  name,
  inputClassName,
  accept = "image/jpeg,image/png,image/webp",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const selectedFileRef = useRef<File | null>(null);
  const preparedRef = useRef(false);
  const dragStartRef = useRef<{ pointer: Point; pan: Point } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [showGuides, setShowGuides] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resetEdit = useCallback(() => {
    preparedRef.current = false;
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!imageUrl) {
      imageRef.current = null;
      return;
    }

    const image = new Image();
    image.onload = () => {
      const nextSize = { width: image.naturalWidth, height: image.naturalHeight };
      imageRef.current = image;
      setImageSize(nextSize);
      setPan((current) => clampPan(current, 1, nextSize));
    };
    image.onerror = () => setError("No se pudo leer la imagen seleccionada.");
    image.src = imageUrl;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [imageUrl]);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawImage(ctx, image, PREVIEW_SIZE, zoom, clampPan(pan, zoom, imageSize));
    if (showGuides) drawGuides(ctx, PREVIEW_SIZE);
  }, [imageSize, pan, showGuides, zoom]);

  useEffect(() => {
    const input = inputRef.current;
    const form = input?.form;
    if (!input || !form) return;

    const prepareAndSubmit = async (event: SubmitEvent) => {
      if (preparedRef.current || !selectedFileRef.current) return;
      if (!imageRef.current) {
        event.preventDefault();
        setError("La imagen todavia se esta preparando.");
        return;
      }

      event.preventDefault();
      setError(null);

      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = OUTPUT_SIZE;
      outputCanvas.height = OUTPUT_SIZE;
      const ctx = outputCanvas.getContext("2d");
      if (!ctx) {
        setError("No se pudo preparar la imagen.");
        return;
      }

      drawImage(
        ctx,
        imageRef.current,
        OUTPUT_SIZE,
        zoom,
        clampPan(pan, zoom, imageSize),
      );

      try {
        const blob = await canvasToBlob(outputCanvas);
        const file = new File([blob], outputFileName(selectedFileRef.current.name), {
          type: OUTPUT_TYPE,
        });
        const transfer = new DataTransfer();
        transfer.items.add(file);
        input.files = transfer.files;
        preparedRef.current = true;
        if (event.submitter instanceof HTMLElement) {
          form.requestSubmit(event.submitter);
        } else {
          form.requestSubmit();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo preparar la imagen.");
      }
    };

    form.addEventListener("submit", prepareAndSubmit);
    return () => form.removeEventListener("submit", prepareAndSubmit);
  }, [imageSize, pan, zoom]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        className={inputClassName}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0] ?? null;
          selectedFileRef.current = file;
          setError(null);
          resetEdit();

          if (!file) {
            setImageSize(null);
            setImageUrl((current) => {
              if (current) URL.revokeObjectURL(current);
              return null;
            });
            return;
          }

          setImageSize(null);
          const nextUrl = URL.createObjectURL(file);
          setImageUrl((current) => {
            if (current) URL.revokeObjectURL(current);
            return nextUrl;
          });
        }}
      />

      {imageUrl && (
        <div
          className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-3"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <canvas
              ref={canvasRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              className="aspect-square w-full max-w-[280px] rounded-lg bg-neutral-900 object-cover cursor-move touch-none"
              title="Mover encuadre"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                dragStartRef.current = {
                  pointer: { x: event.clientX, y: event.clientY },
                  pan,
                };
              }}
              onPointerMove={(event) => {
                const start = dragStartRef.current;
                if (!start) return;
                event.preventDefault();
                event.stopPropagation();
                const movedPan = {
                  x: start.pan.x + event.clientX - start.pointer.x,
                  y: start.pan.y + event.clientY - start.pointer.y,
                };
                const nextPan = snapPanToCenter(
                  clampPan(movedPan, zoom, imageSize),
                );
                preparedRef.current = false;
                setPan(nextPan);
              }}
              onPointerUp={(event) => {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.releasePointerCapture(event.pointerId);
                dragStartRef.current = null;
              }}
              onPointerCancel={() => {
                dragStartRef.current = null;
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />

            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wider text-neutral-400">
                  <span>Zoom</span>
                  <span>{zoom.toFixed(2)}x</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="h-8 w-8 rounded-md border border-neutral-800 hover:bg-neutral-900 text-sm text-neutral-200"
                    onClick={() => {
                      const nextZoom = clamp(zoom - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);
                      preparedRef.current = false;
                      setZoom(nextZoom);
                      setPan((current) => clampPan(current, nextZoom, imageSize));
                    }}
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={ZOOM_STEP}
                    value={zoom}
                    className="w-full accent-orange-500"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    onChange={(event) => {
                      const nextZoom = Number(event.currentTarget.value);
                      preparedRef.current = false;
                      setZoom(nextZoom);
                      setPan((current) => clampPan(current, nextZoom, imageSize));
                    }}
                  />
                  <button
                    type="button"
                    className="h-8 w-8 rounded-md border border-neutral-800 hover:bg-neutral-900 text-sm text-neutral-200"
                    onClick={() => {
                      const nextZoom = clamp(zoom + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);
                      preparedRef.current = false;
                      setZoom(nextZoom);
                      setPan((current) => clampPan(current, nextZoom, imageSize));
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={showGuides}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  onChange={(event) => {
                    setShowGuides(event.currentTarget.checked);
                  }}
                />
                Mostrar guias de centrado
              </label>

              <button
                type="button"
                className="px-3 py-1.5 rounded-md border border-neutral-800 hover:bg-neutral-900 text-xs text-neutral-200"
                onClick={resetEdit}
              >
                Restablecer encuadre
              </button>

              <p className="text-xs text-neutral-500">
                Salida: WebP cuadrado de 1200 px.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
