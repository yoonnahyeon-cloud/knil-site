# KNIL 브랜드 사이트

주식회사 크닐 원페이지 브랜드 사이트. Next.js 16 (App Router, static export), TypeScript, Tailwind CSS 4, GSAP 3 (ScrollTrigger).

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # out/ 에 정적 사이트 생성
```

배포 도메인은 `NEXT_PUBLIC_SITE_URL` 로 지정합니다 (기본값 https://knil.me). canonical, OG, sitemap 에 쓰입니다.

## 구조

```
src/app/            layout(SEO·OG·JSON-LD), page, robots, sitemap, fonts
src/lib/content.ts  모든 카피. 레이아웃 수정 없이 문구만 바꿀 수 있습니다
src/lib/site.ts     회사명, 슬로건, 도메인, 향후 서비스 URL
src/lib/gsap.ts     GSAP 등록, reduced-motion 미디어쿼리
src/components/brand/LetterSwap.tsx   LINK → KNIL 재배열 (히어로, 마지막 화면)
src/components/sections/              섹션 01~06, 푸터
```

## 모션 메모

- LINK → KNIL: 네 글자를 LINK 순서로 렌더하고, 보이지 않는 KNIL 조판에서 각 글자의 목적지를 측정해 이동합니다. 오프셋은 글자 폭 대비 %라 화면 크기와 무관하게 유지됩니다. 글자는 `mix-blend-mode: difference` 로 그려져 서로 통과하는 순간 겹친 부분이 반전됩니다. 첫 화면은 클릭 시 다시 재생, 마지막 KNIL은 마우스를 올리면 LINK로 돌아갑니다.
- 사업 확장(섹션 04): 단어 위치와 크기는 모두 스테이지 크기에서 계산합니다 (`layout()`).
- `prefers-reduced-motion` 사용자에게는 고정 레이아웃(최종 상태)을 보여줍니다.

## 서비스 확장

현재 `output: "export"` 정적 사이트입니다. 로그인, 크리에이터 페이지(knil.me/{handle}) 등 실제 서비스가 붙으면 `next.config.ts` 의 `output: "export"` 를 제거하고 `src/app/(service)/...` 라우트 그룹으로 추가하면 됩니다. 브랜드 페이지는 그대로 `/` 에 남습니다.

## 참고

- 섹션 03의 크리에이터 "로지"와 클릭 수치는 설명용 예시입니다.
- 폰트: Pretendard (KS X 1001 서브셋, 자체 호스팅), Archivo (next/font/google, 빌드 시 다운로드).
