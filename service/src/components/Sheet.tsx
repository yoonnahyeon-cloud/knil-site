"use client";

import { useEffect } from "react";

// Full-height bottom sheet used for every edit form.
export function Sheet({
  title,
  onClose,
  onSave,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave?: () => void;
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
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/40" onClick={onClose}>
      <div
        className="mx-auto mt-[max(16px,env(safe-area-inset-top))] flex w-full max-w-[480px] flex-1 flex-col overflow-hidden bg-paper"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-rule px-4">
          <button onClick={onClose} className="h-10 px-2 text-mute">
            취소
          </button>
          <span className="font-semibold">{title}</span>
          {onSave ? (
            <button onClick={onSave} className="h-10 px-2 font-semibold text-signal">
              저장
            </button>
          ) : (
            <span className="w-12" />
          )}
        </header>
        <div className="flex-1 overflow-y-auto px-5 pt-2 pb-[max(32px,env(safe-area-inset-bottom))]">{children}</div>
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
      <span className="text-[13px] text-mute">{label}</span>
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
