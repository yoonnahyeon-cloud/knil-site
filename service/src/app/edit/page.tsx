"use client";

import { AppShell } from "@/components/AppShell";
import { Editor } from "@/components/Editor";

export default function EditPage() {
  return <AppShell wide>{(page) => <Editor page={page} />}</AppShell>;
}
