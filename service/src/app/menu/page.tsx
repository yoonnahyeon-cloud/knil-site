"use client";

import { useRouter } from "next/navigation";
import {
  Bot,
  ChartColumn,
  Crown,
  Gift,
  Handshake,
  Headphones,
  IdCard,
  Inbox,
  Link2,
  LogOut,
  Megaphone,
  MessageCircleMore,
  Send,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/CreatorPage";
import { Card, Row } from "@/components/ui";
import { displayUrl } from "@/lib/base";
import { signOut } from "@/lib/store";

export default function MenuPage() {
  const router = useRouter();
  return (
    <AppShell>
      {(page) => (
        <main className="px-5 pb-12">
          <section className="flex items-center gap-4 pt-6 pb-4">
            <Avatar name={page.profile.name} src={page.profile.avatar} size={56} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[20px] font-extrabold tracking-tight">{page.profile.name}</p>
              <p className="truncate text-[13px] text-mute">{displayUrl(page.profile.handle)}</p>
            </div>
          </section>

          <Card>
            <Row href="/membership" icon={Crown} tone="amber" label="멤버십" note="무료 플랜" />
            <Row href="/invite" icon={Gift} tone="pink" label="친구 초대" note="함께 쓰면 혜택" />
          </Card>

          <h2 className="mt-8 mb-2 px-1 text-[13px] font-bold text-mute">전체 서비스</h2>
          <Card>
            <Row href="/edit" icon={Link2} tone="purple" label="프로필 링크" />
            <Row href="/stats" icon={ChartColumn} tone="sky" label="통계" />
            <Row href="/chat" icon={MessageCircleMore} tone="ink" label="AI 해외 팬 채팅" note="AI 번역" />
            <Row href="/dm" icon={Send} tone="pink" label="자동 DM · 댓글" note="준비 중" />
            <Row href="/collab/?tab=campaigns" icon={Megaphone} tone="mint" label="브랜드 캠페인" />
            <Row href="/collab/?tab=inbox" icon={Inbox} tone="soft" label="제안함" />
            <Row href="/collab/?tab=portfolio" icon={IdCard} tone="amber" label="협업 프로필" />
            <Row icon={ShoppingBag} label="공동구매" soon />
            <Row icon={Bot} label="AI 콘텐츠 도우미" soon />
          </Card>

          <h2 className="mt-8 mb-2 px-1 text-[13px] font-bold text-mute">계정</h2>
          <Card>
            <Row href="/settings" icon={Settings} label="설정" />
            <Row icon={Headphones} label="고객센터" soon />
            <Row
              icon={LogOut}
              label="로그아웃"
              onClick={async () => {
                await signOut();
                router.replace("/");
              }}
            />
          </Card>
          <p className="mt-6 flex items-center justify-center gap-1 text-[12px] text-mute">
            <Handshake size={13} /> knil.
          </p>
        </main>
      )}
    </AppShell>
  );
}
