# KNIL 서비스

크리에이터가 가입해서 자기 KNIL 페이지(knil.kr/@아이디)를 만들고, 방문과 클릭 통계를 보는 실제 서비스입니다. 브랜드 소개 사이트(저장소 루트)와는 별도 앱입니다.

Next.js 16 (App Router), TypeScript, Tailwind CSS 4. 모바일 우선.

## 화면

| 주소 | 내용 |
| --- | --- |
| `/` | 시작 화면 (주소 바로 정하기, 예시 페이지, 기능 소개) |
| `/login`, `/start` | 이메일 로그인, 주소(아이디)와 이름 정하기 |
| `/home` | 대시보드: 오늘 방문·클릭, 시작하기 체크리스트, 도구, 협업 요약 |
| `/edit`, `/stats` | 링크(블록) 편집과 미리보기, 통계 |
| `/dm` | 댓글 키워드 자동 DM 소개와 템플릿 (준비 중, `../docs/instagram-auto-dm.md`) |
| `/collab` | 캠페인, 제안함(브랜드가 보낸 협업 제안), 협업 프로필 |
| `/chat` | 해외 팬 채팅: 받은 대화, 메시지 버튼과 AI 답변 설정, 언어별 페이지 |
| `/menu`, `/invite`, `/membership`, `/settings` | 전체 메뉴, 친구 초대, 멤버십, 설정 |
| `/@아이디` | 공개 크리에이터 페이지 (협업 제안하기 버튼 포함) |

블록 종류: 채널, 링크, 영상, 룩·사진, 상품 (`src/lib/types.ts`).

## 데이터

지금은 미리보기 단계라 모든 데이터가 브라우저(localStorage)에 저장됩니다. 화면은 `src/lib/store.ts` 만 거치므로 Supabase 연결 시 이 파일만 바꿉니다. 처음 한 번은 `supabase/setup.sql` 만 실행하면 돼요(아래 세 파일을 합친 것, 다시 실행해도 안전). 스키마는 `supabase/schema.sql`, 그다음 `supabase/002_collab.sql` (협업 프로필, 제안함), `supabase/003_chat.sql` (채팅, 번역 캐시).

번역과 AI 답변은 Edge Function `supabase/functions/knil` 이 Claude API로 처리해요. Supabase 대시보드의 Edge Functions에서 `knil` 이름으로 붙여 넣어 배포하고 Verify JWT를 끄고, Secrets에 `ANTHROPIC_API_KEY` 를 넣어요.

예시 계정 `rosie` 의 페이지와 통계는 설명용 예시 데이터입니다 (`src/lib/demo.ts`).

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
```

## 배포

미리보기는 브랜드 사이트와 같은 GitHub Pages의 `/app` 아래에 올라갑니다 (`.github/workflows/pages.yml`). 정적 호스팅이라 `/@아이디` 는 `not-found.tsx` 가 브라우저에서 주소를 읽어 그립니다. 백엔드 연결 후에는 `output: "export"` 를 빼고 Vercel 등에 일반 Next.js 앱으로 배포합니다.
