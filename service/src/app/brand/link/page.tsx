"use client";

import { AppShell } from "@/components/AppShell";
import { Editor } from "@/components/Editor";

// The brand's own page (a clinic's booking page, say), edited like a creator's.
export default function BrandLinkPage() {
  return <AppShell wide>{(page) => <Editor page={page} />}</AppShell>;
}
