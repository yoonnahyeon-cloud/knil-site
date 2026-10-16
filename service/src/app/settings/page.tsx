"use client";

import { useRouter } from "next/navigation";
import { AtSign, LogOut, Settings, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, IconTile, PageTitle } from "@/components/ui";
import { signOut } from "@/lib/store";

export default function SettingsPage() {
  const router = useRouter();
  return (
    <AppShell>
      {(page) => (
        <main className="px-5 pb-10">
          <PageTitle icon={Settings}>설정</PageTitle>
          <Card>
            <dl>
              <div className="flex items-center gap-3 py-2.5">
                <IconTile icon={AtSign} tone="soft" size={34} />
                <dt className="flex-1 text-mute">주소</dt>
                <dd className="font-bold">knil.kr/@{page.profile.handle}</dd>
              </div>
              <div className="flex items-center gap-3 py-2.5">
                <IconTile icon={UserRound} tone="gray" size={34} />
                <dt className="flex-1 text-mute">이름</dt>
                <dd className="font-bold">{page.profile.name}</dd>
              </div>
            </dl>
          </Card>
          <button
            onClick={async () => {
              await signOut();
              router.replace("/");
            }}
            className="btn-ghost mt-6 w-full gap-1.5 border-rule"
          >
            <LogOut size={17} /> 로그아웃
          </button>
        </main>
      )}
    </AppShell>
  );
}
