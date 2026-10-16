"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/CreatorPage";
import { Row } from "@/components/ui";
import { displayUrl } from "@/lib/base";
import { signOut } from "@/lib/store";

export default function MenuPage() {
  const router = useRouter();
  return (
    <AppShell>
      {(page) => (
        <main className="px-5 pb-12">
          <section className="flex items-center gap-4 pt-6 pb-2">
            <Avatar name={page.profile.name} src={page.profile.avatar} size={52} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[20px] font-bold tracking-tight">{page.profile.name}</p>
              <p className="truncate text-[14px] text-mute">{displayUrl(page.profile.handle)}</p>
            </div>
          </section>

          <div className="mt-4 border-t border-ink">
            <Row href="/membership" label="멤버십" note="무료 플랜" />
            <Row href="/invite" label="친구 초대" note="함께 쓰면 혜택" />
          </div>

          <h2 className="mt-10 mb-1 text-[13px] text-mute">전체 서비스</h2>
          <div className="border-t border-ink">
            <Row href="/edit" label="프로필 링크" />
            <Row href="/stats" label="통계" />
            <Row href="/dm" label="자동 DM · 댓글" note="준비 중" />
            <Row href="/collab/?tab=campaigns" label="브랜드 캠페인" />
            <Row href="/collab/?tab=inbox" label="제안함" />
            <Row href="/collab/?tab=portfolio" label="협업 프로필" />
            <Row label="공동구매" soon />
            <Row label="AI 콘텐츠 도우미" soon />
          </div>

          <h2 className="mt-10 mb-1 text-[13px] text-mute">계정</h2>
          <div className="border-t border-ink">
            <Row href="/settings" label="설정" />
            <Row label="고객센터" soon />
            <button
              onClick={async () => {
                await signOut();
                router.replace("/");
              }}
              className="w-full border-b border-rule py-4 text-left text-[16px] text-mute"
            >
              로그아웃
            </button>
          </div>
        </main>
      )}
    </AppShell>
  );
}
