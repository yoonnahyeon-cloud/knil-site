import { Latin } from "@/components/brand/Latin";
import { autoDm } from "@/lib/content";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="mb-4 flex gap-3 text-[15px] leading-[1.6] text-mute md:text-[16px]">
      <span className="font-display font-[750] text-ink [font-stretch:94%]">{n}</span>
      <span>{children}</span>
    </p>
  );
}

// Comment-keyword auto DM: setup, the comment, the DM, and what KNIL records.
export function AutoDm() {
  return (
    <section aria-label="댓글 키워드 자동 DM" className="relative bg-paper pt-[10svh] pb-[18svh]">
      <div className="grid-12">
        <h2 className="t-display col-span-6 text-[clamp(34px,5.9vw,108px)] md:col-span-10">
          {autoDm.heading[0]}
          <br />
          {autoDm.heading[1]}
        </h2>
        <p className="col-span-6 mt-6 max-w-[32em] text-[16px] leading-[1.8] text-ink/80 md:col-span-6 md:mt-10 md:text-[18px]">
          {autoDm.intro}
        </p>
      </div>

      <div className="grid-12 mt-[clamp(56px,10svh,104px)] gap-y-[clamp(56px,10svh,96px)]">
        <div className="col-span-6 md:col-start-2 md:col-span-4">
          <Step n="1">크리에이터가 키워드와 보낼 링크를 정합니다.</Step>
          <dl className="border-t border-ink text-[15px]">
            {autoDm.setup.map((s) => (
              <div key={s.label} className="grid grid-cols-[5.5em_1fr] gap-x-4 border-b border-rule py-3">
                <dt className="text-mute">{s.label}</dt>
                <dd className={s.label === "키워드" || s.label === "링크" ? "font-semibold" : ""}>
                  {s.label === "키워드" ? `‘${s.value}’` : s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="col-span-6 md:col-start-8 md:col-span-4 md:row-span-2">
          <Step n="2">팔로워가 ‘정보’라고 댓글을 남기면</Step>
          <img
            src={`${base}/visuals/haru-reel.webp`}
            alt="HARU의 릴스 댓글 창. 캡션에 '착장 정보가 궁금하면 댓글에 정보라고 남겨주세요'라고 적혀 있고, 팔로워들이 '정보'라고 댓글을 남겼다."
            width={1170}
            height={2532}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </figure>

        <figure className="col-span-6 md:col-start-2 md:col-span-4">
          <Step n="3">KNIL이 DM과 링크를 자동으로 보냅니다.</Step>
          <img
            src={`${base}/visuals/haru-dm.webp`}
            alt="팔로워가 받은 HARU의 DM. '요청하신 HARU의 착장 정보를 보내드릴게요'라는 메시지와 knil.com/@haru/look 링크가 와 있다."
            width={1170}
            height={2532}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </figure>
      </div>

      <div className="grid-12 mt-[clamp(72px,14svh,140px)]">
        <div className="col-span-6 md:col-start-2 md:col-span-10">
          <Step n="4">
            그리고 모든 반응은 <Latin>KNIL</Latin>에 데이터로 남습니다.
          </Step>

          <dl className="grid grid-cols-2 border-t border-ink md:grid-cols-4">
            {autoDm.totals.map((t, i) => (
              <div
                key={t.label}
                className={`border-b border-rule py-5 ${i % 2 === 1 ? "pl-5 border-l md:pl-6" : ""} ${
                  i === 2 ? "md:border-l md:pl-6" : ""
                }`}
              >
                <dt className="text-[13px] text-mute md:text-[14px]">{t.label}</dt>
                <dd className="mt-1 font-display text-[clamp(34px,6vw,64px)] leading-none font-[750] tracking-[-0.04em] text-signal tabular-nums [font-stretch:90%]">
                  {t.value}
                </dd>
              </div>
            ))}
          </dl>

          <table className="mt-10 w-full text-left text-[14px] md:text-[15px]">
            <caption className="mb-3 text-left text-[13px] text-mute">콘텐츠별 반응</caption>
            <thead>
              <tr className="border-b border-ink text-[12px] text-mute">
                <th className="py-2 font-normal">콘텐츠</th>
                <th className="py-2 text-right font-normal">댓글</th>
                <th className="py-2 text-right font-normal">클릭</th>
              </tr>
            </thead>
            <tbody>
              {autoDm.byContent.map((r) => (
                <tr key={r.title} className="border-b border-rule">
                  <td className="py-3 pr-3">
                    <span className="block font-semibold">{r.title}</span>
                    <span className="text-[12.5px] text-mute">
                      {r.kind} · 키워드 ‘{r.keyword}’
                    </span>
                  </td>
                  <td className="py-3 text-right tabular-nums">{r.comments}</td>
                  <td className="py-3 text-right font-semibold text-signal tabular-nums">{r.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-8 max-w-[40em] text-[12px] leading-[1.7] text-mute md:text-[13px]">{autoDm.note}</p>
        </div>
      </div>
    </section>
  );
}
