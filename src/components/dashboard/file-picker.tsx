"use client";

import { useEffect, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { formatFileSize } from "@/lib/validators/download";
import { cn } from "@/lib/utils";

const ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type Props = {
  value?: string | null;
  fileSize?: number | null;
  onChange: (url: string | null, sizeBytes: number | null) => void;
  label?: string;
};

export function FilePicker({
  value,
  fileSize = null,
  onChange,
  label = "Upload document",
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [size, setSize] = useState<number | null>(fileSize ?? null);

  useEffect(() => {
    setSize(fileSize ?? null);
  }, [fileSize]);

  const onUpload = async (file: File) => {
    setError(null);
    setPending(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: {
          url: string;
          id: string;
          sizeBytes: number;
          fileName: string;
        };
      };
      if (!json.ok || !json.data) {
        setError(json.error ?? "Upload failed");
        return;
      }
      setFileName(json.data.fileName);
      setSize(json.data.sizeBytes);
      onChange(json.data.url, json.data.sizeBytes);
    } catch {
      setError("Upload failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-mist bg-mist/30 px-4 py-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-deodar" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-sm text-bark">{fileName ?? value}</p>
            <p className="mt-0.5 font-mono text-xs text-moss">
              {formatFileSize(size)} ·{" "}
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-deodar underline-offset-2 hover:underline"
              >
                Open file
              </a>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-[12px] border border-dashed border-mist bg-mist/40 px-4 py-8 text-moss">
          <FileText className="h-8 w-8" aria-hidden />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <label
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-2 rounded-[8px] border border-mist px-3 text-sm text-bark hover:bg-mist/50",
            pending && "pointer-events-none opacity-60"
          )}
        >
          <Upload className="h-4 w-4" aria-hidden />
          {pending ? "Uploading…" : label}
          <input
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
              e.target.value = "";
            }}
          />
        </label>

        {value && (
          <button
            type="button"
            className="h-9 rounded-[8px] px-3 text-sm text-moss hover:text-resin"
            onClick={() => {
              setFileName(null);
              setSize(null);
              onChange(null, null);
            }}
          >
            Remove
          </button>
        )}
      </div>

      <p className="text-xs text-moss">PDF, DOC, DOCX, XLS or XLSX · max 20MB</p>
      {error && (
        <p className="text-sm text-resin" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
