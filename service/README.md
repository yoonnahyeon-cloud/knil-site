# KNIL 서비스

크리에이터가 가입해서 자기 KNIL 페이지(knil.com/@아이디)를 만들고, 방문과 클릭 통계를 보는 실제 서비스입니다. 브랜드 소개 사이트(저장소 루트)와는 별도 앱입니다.

Next.js 16 (App Router), TypeScript, Tailwind CSS 4. 모바일 우선.

## 화면

| 주소 | 내용 |
| --- | --- |
| `/` | 시작 화면 (가입, 예시 계정 둘러보기) |
| `/start` | 주소(아이디)와 이름 정하기 |
| `/edit` | 페이지 편집: 프로필, 블록 추가·수정·순서·숨김, 미리보기 |
| `/stats` | 방문, 클릭, 클릭률, 일별 그래프, 많이 누른 링크, 유입 경로 |
| `/dm` | 댓글 키워드 자동 DM (준비 중, `../docs/instagram-auto-dm.md`) |
| `/@아이디` | 공개 크리에이터 페이지 |

블록 종류: 채널, 링크, 영상, 룩·사진, 상품 (`src/lib/types.ts`).

## 데이터

지금은 미리보기 단계라 모든 데이터가 브라우저(localStorage)에 저장됩니다. 화면은 `src/lib/store.ts` 만 거치므로 Supabase 연결 시 이 파일만 바꿉니다. 스키마는 `supabase/schema.sql`.

예시 계정 `rosie` 의 페이지와 통계는 설명용 예시 데이터입니다 (`src/lib/demo.ts`).

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
```

## 배포

미리보기는 브랜드 사이트와 같은 GitHub Pages의 `/app` 아래에 올라갑니다 (`.github/workflows/pages.yml`). 정적 호스팅이라 `/@아이디` 는 `not-found.tsx` 가 브라우저에서 주소를 읽어 그립니다. 백엔드 연결 후에는 `output: "export"` 를 빼고 Vercel 등에 일반 Next.js 앱으로 배포합니다.
