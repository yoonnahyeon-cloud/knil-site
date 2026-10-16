"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { signOut } from "@/lib/store";

export default function SettingsPage() {
  const router = useRouter();
  return (
    <AppShell>
      {(page) => (
        <main className="px-5 pb-10">
          <h1 className="pt-6 text-[22px] font-bold tracking-tight">설정</h1>
          <dl className="mt-5 border-t border-ink">
            <div className="flex justify-between border-b border-rule py-4">
              <dt className="text-mute">주소</dt>
              <dd className="font-semibold">knil.com/@{page.profile.handle}</dd>
            </div>
            <div className="flex justify-between border-b border-rule py-4">
              <dt className="text-mute">이름</dt>
              <dd className="font-semibold">{page.profile.name}</dd>
            </div>
          </dl>
          <button
            onClick={() => {
              signOut();
              router.replace("/");
            }}
            className="btn-ghost mt-8 w-full"
          >
            로그아웃
          </button>
        </main>
      )}
    </AppShell>
  );
}
