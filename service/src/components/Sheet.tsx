"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// Full-height bottom sheet used for every edit form.
export function Sheet({
  title,
  onClose,
  onSave,
  aside,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  // On a computer, sit on the left so the phone preview stays visible.
  aside?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-ink/40 backdrop-blur-[2px] lg:items-center lg:justify-center lg:p-8 ${aside ? "lg:items-start lg:pl-[calc(248px+40px)]" : ""}`} onClick={onClose}>
      <div
        className="mx-auto mt-[max(16px,env(safe-area-inset-top))] flex w-full max-w-[480px] flex-1 flex-col overflow-hidden rounded-t-[28px] bg-white lg:mx-0 lg:mt-0 lg:max-h-[86dvh] lg:flex-none lg:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex h-14 shrink-0 items-center justify-between px-4">
          {onSave ? (
            <button onClick={onClose} className="h-10 px-2 text-mute">
              취소
            </button>
          ) : (
            // Visitors see some sheets, so no words here.
            <button onClick={onClose} aria-label="close" className="grid size-9 place-items-center rounded-full bg-surface">
              <X size={18} />
            </button>
          )}
          <span className="font-bold">{title}</span>
          {onSave ? (
            <button onClick={onSave} className="h-9 rounded-xl bg-ink px-4 text-[14px] font-bold text-white">
              저장
            </button>
          ) : (
            <span className="w-9" />
          )}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-[max(32px,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-[13px] font-semibold text-ink/70">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className="field resize-none" />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="field"
          {...(type === "url" ? { autoCapitalize: "none", autoCorrect: "off", inputMode: "url" as const } : {})}
        />
      )}
    </label>
  );
}
