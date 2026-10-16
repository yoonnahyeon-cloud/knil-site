"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Sheet } from "@/components/Sheet";
import { PageTitle, SectionHead, Soon } from "@/components/ui";
import { displayUrl } from "@/lib/base";

type Template = { key: string; title: string; when: string; keyword: string; message: string; link: string };

const TEMPLATES: Template[] = [
  {
    key: "info",
    title: "제품 정보 보내기",
    when: "릴스 속 제품이 궁금한 팔로워에게",
    keyword: "정보",
    message: "요청하신 제품 정보예요. 아래 링크에서 확인해 보세요!",
    link: "/look",
  },
  {
    key: "event",
    title: "댓글 이벤트",
    when: "댓글을 단 모두에게 참여 안내와 쿠폰을",
    keyword: "참여",
    message: "이벤트 참여 고마워요! 쿠폰과 참여 방법을 보내드려요.",
    link: "/event",
  },
  {
    key: "review",
    title: "구매 인증 감사",
    when: "구매 완료 댓글에 감사 인사와 후기 링크를",
    keyword: "구매완료",
    message: "구매해 주셔서 감사해요. 후기를 남겨주시면 다음 공동구매 소식을 먼저 알려드릴게요.",
    link: "/review",
  },
  { key: "custom", title: "직접 만들기", when: "키워드, 메시지, 링크를 내 마음대로", keyword: "", message: "", link: "" },
];

export default function DmPage() {
  return <AppShell>{(page) => <Dm handle={page.profile.handle} />}</AppShell>;
}

function Dm({ handle }: { handle: string }) {
  const [open, setOpen] = useState<Template | null>(null);

  return (
    <main className="px-5 pb-12">
      <PageTitle sub="Instagram 프로페셔널 계정을 연결하면 켤 수 있어요.">
        자동 DM <Soon className="align-middle" />
      </PageTitle>

      <Conversation handle={handle} />

      <SectionHead title="템플릿으로 시작하기" />
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => (
          <button key={t.key} onClick={() => setOpen(t)} className="flex min-h-28 flex-col justify-between border border-rule bg-white p-4 text-left">
            <span className="text-[16px] font-bold tracking-tight">{t.title}</span>
            <span className="mt-2 text-[13px] leading-snug text-mute">{t.when}</span>
          </button>
        ))}
      </div>

      <SectionHead title="이렇게 동작해요" />
      <ol className="border-t border-ink">
        {[
          ["키워드 정하기", "게시물이나 릴스마다 댓글 키워드를 정해요."],
          ["자동 답장", "키워드로 댓글을 단 팔로워에게 DM과 링크가 바로 가요."],
          ["반응 확인", "콘텐츠별 댓글 수, 발송 수, 링크 클릭을 통계에서 봐요."],
        ].map(([k, v], i) => (
          <li key={k} className="flex gap-4 border-b border-rule py-4">
            <span className="font-display text-[15px] font-bold text-mute">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="font-semibold">{k}</p>
              <p className="text-[14px] text-mute">{v}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-[12px] leading-relaxed text-mute">
        Meta 공식 API로만 동작해요. 댓글을 남긴 사람에게만, 댓글 하나에 한 번, 댓글 작성 후 7일 안에 보냅니다. Meta 앱 검수를 마치면 열립니다.
      </p>

      {open && (
        <Sheet title={open.title} onClose={() => setOpen(null)}>
          <dl className="mt-2 border-t border-ink">
            {[
              ["키워드", open.keyword || "직접 입력"],
              ["메시지", open.message || "직접 입력"],
              ["링크", open.link ? `${displayUrl(handle)}${open.link}` : "직접 입력"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4 border-b border-rule py-3.5">
                <dt className="w-14 shrink-0 text-[14px] text-mute">{k}</dt>
                <dd className="text-[15px]">{v}</dd>
              </div>
            ))}
          </dl>
          <button disabled className="btn mt-8 w-full">
            Instagram 연결하고 켜기
          </button>
          <p className="mt-3 text-center text-[13px] text-mute">Meta 앱 검수가 끝나면 바로 켤 수 있어요.</p>
        </Sheet>
      )}
    </main>
  );
}

// A comment turning into a DM, drawn in KNIL's own type rather than as a
// phone screenshot.
function Conversation({ handle }: { handle: string }) {
  return (
    <div className="bg-white px-5 py-5">
      <p className="text-[12px] text-mute">릴스 댓글</p>
      <p className="mt-1 text-[15px]">
        <b>minji.k</b> 정보 알려주세요!
      </p>
      <div className="my-4 flex items-center gap-2 text-[12px] text-signal">
        <span className="h-px flex-1 bg-signal" />
        키워드 &lsquo;정보&rsquo; 감지, 자동 DM 발송
      </div>
      <p className="text-[12px] text-mute">DM</p>
      <div className="mt-1 max-w-[85%] bg-paper px-4 py-3 text-[15px]">
        요청하신 착장 정보예요!
        <span className="mt-2 block border-t border-rule pt-2 font-semibold">{displayUrl(handle)}/look →</span>
      </div>
    </div>
  );
}
