import { site } from "@/lib/site";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// What the multilink looks like in a creator's hands: the one link in a
// profile, and the page it opens. HARU is a fictional creator.
const shots = [
  {
    src: `${base}/visuals/haru-instagram.webp`,
    alt: "가상의 크리에이터 HARU의 Instagram 프로필. 소개 아래에 knil.com/@haru 링크가 있다.",
    step: "1",
    caption: (
      <>
        Instagram 프로필에는 <span className="font-semibold text-ink">knil.com/@haru</span> 링크 하나.
      </>
    ),
  },
  {
    src: `${base}/visuals/haru-knil.webp`,
    alt: "링크를 누르면 열리는 HARU의 KNIL 페이지. Instagram, YouTube, TikTok, Xiaohongshu, 새 영상, 데일리 룩, 뷰티 제품, 브랜드 협업, 숍이 한 페이지에 모여 있다.",
    step: "2",
    caption: <>누르면 HARU의 채널, 콘텐츠, 상품, 협업이 한 페이지에 열립니다.</>,
  },
];

export function Screens() {
  return (
    <section aria-label={`${site.name} 페이지 예시`} className="relative bg-paper pt-[8svh] pb-[16svh]">
      <div className="grid-12 gap-y-[clamp(56px,10svh,96px)]">
        {shots.map((s, i) => (
          <figure
            key={s.step}
            className={`col-span-6 md:col-span-4 ${i === 0 ? "md:col-start-2" : "md:col-start-8 md:mt-[18svh]"}`}
          >
            <figcaption className="mb-4 flex gap-3 text-[15px] text-mute md:text-[16px]">
              <span className="font-display font-[750] text-ink [font-stretch:94%]">{s.step}</span>
              <span>{s.caption}</span>
            </figcaption>
            <img
              src={s.src}
              alt={s.alt}
              width={1170}
              height={2532}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
