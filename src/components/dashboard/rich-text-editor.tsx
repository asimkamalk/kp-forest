"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Bold, Heading2, Italic, List, ListOrdered, Type } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  dir?: "ltr" | "rtl";
  label?: string;
};

export function RichTextEditor({ value, onChange, error, dir = "ltr" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const skipSync = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || skipSync.current) {
      skipSync.current = false;
      return;
    }
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    skipSync.current = true;
    onChange(ref.current?.innerHTML ?? "");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-t-[8px] border border-b-0 border-mist bg-mist/30 p-1.5">
        <ToolbarButton label="Bold" onClick={() => exec("bold")}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => exec("italic")}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Paragraph" onClick={() => exec("formatBlock", "p")}>
          <Type className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Heading" onClick={() => exec("formatBlock", "h2")}>
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <div
        ref={ref}
        role="textbox"
        aria-multiline
        contentEditable
        dir={dir}
        suppressContentEditableWarning
        className={cn(
          "min-h-[220px] rounded-b-[8px] border bg-paper px-3 py-2.5 text-sm leading-relaxed text-bark outline-none prose prose-sm max-w-none focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30",
          error ? "border-resin" : "border-mist"
        )}
        onInput={() => {
          skipSync.current = true;
          onChange(ref.current?.innerHTML ?? "");
        }}
      />
      {error && (
        <p className="mt-1.5 text-sm text-resin" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-bark hover:bg-paper"
    >
      {children}
    </button>
  );
}
