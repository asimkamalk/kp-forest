"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlbumLightboxImage = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
};

type Props = {
  images: AlbumLightboxImage[];
};

export function AlbumMasonryWithLightbox({ images }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    const idx = openIndex;
    setOpenIndex(null);
    if (idx !== null) {
      requestAnimationFrame(() => {
        triggerRefs.current.get(idx)?.focus();
      });
    }
  }, [openIndex]);

  const go = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null || images.length === 0) return current;
        return (current + delta + images.length) % images.length;
      });
    },
    [images.length]
  );

  useEffect(() => {
    if (openIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, go]);

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <ul className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((img, index) => (
          <li key={img.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              ref={(el) => {
                if (el) triggerRefs.current.set(index, el);
                else triggerRefs.current.delete(index);
              }}
              onClick={() => setOpenIndex(index)}
              className="group relative block w-full overflow-hidden rounded-[12px] border border-mist bg-mist text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-resin"
              aria-label={img.caption ? `View: ${img.caption}` : `View image ${index + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                width={800}
                height={600}
                className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </button>
            {img.caption && (
              <p className="mt-2 text-sm text-moss">{img.caption}</p>
            )}
          </li>
        ))}
      </ul>

      {active && openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bark/80 p-4"
          role="presentation"
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e: ReactKeyboardEvent) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p id={titleId} className="truncate text-sm text-paper">
                {active.caption ?? `Image ${openIndex + 1} of ${images.length}`}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-paper text-bark hover:bg-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-resin"
                aria-label="Close lightbox"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <button
                type="button"
                onClick={() => go(-1)}
                className={cn(
                  "absolute left-0 z-10 hidden h-11 rounded-[8px] bg-paper px-3 text-sm font-medium text-bark sm:inline-flex sm:items-center",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-resin"
                )}
                aria-label="Previous image"
              >
                Prev
              </button>
              <div className="relative max-h-[75vh] w-full">
                <Image
                  src={active.url}
                  alt={active.alt}
                  width={1600}
                  height={1200}
                  className="mx-auto max-h-[75vh] w-auto object-contain"
                  sizes="90vw"
                  priority
                />
              </div>
              <button
                type="button"
                onClick={() => go(1)}
                className={cn(
                  "absolute right-0 z-10 hidden h-11 rounded-[8px] bg-paper px-3 text-sm font-medium text-bark sm:inline-flex sm:items-center",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-resin"
                )}
                aria-label="Next image"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
