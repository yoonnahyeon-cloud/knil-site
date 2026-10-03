# 댓글 키워드 자동 DM 구현 메모

브랜드 사이트에는 소개 화면만 있습니다. 실제 기능은 KNIL 서비스에 아래 기준으로 구현합니다. 모든 동작은 Meta 공식 API 범위 안에서만 합니다.

## 전제

- 대상 계정: Instagram 프로페셔널 계정(비즈니스 또는 크리에이터). 크리에이터가 KNIL에서 Instagram 로그인으로 연결합니다.
- API: Instagram API with Instagram Login (Instagram Graph API).
- 권한: `instagram_business_basic`, `instagram_business_manage_comments`, `instagram_business_manage_messages`. 출시 전에 Meta 앱 검수(App Review)에서 고급 액세스를 받아야 합니다.

## 흐름

1. 크리에이터가 KNIL에서 콘텐츠(게시물 또는 릴스), 키워드, 메시지, 링크를 설정합니다.
2. KNIL 앱은 Webhooks의 `comments` 필드를 구독합니다. 댓글이 달리면 댓글 ID, 텍스트, 미디어 ID를 받습니다.
3. 해당 미디어에 설정된 키워드와 댓글 텍스트가 일치하면, 그 댓글에 비공개 답장(Private Reply)을 보냅니다.
   - `POST /{ig-user-id}/messages`, `recipient: { comment_id }`, `message: { text }`
   - 댓글 하나당 비공개 답장은 한 번만 보낼 수 있고, 댓글 작성 후 7일 이내에만 보낼 수 있습니다.
   - 팔로워가 답장하면 그때부터 24시간 메시징 창이 열리고, 이 안에서만 후속 메시지를 보낼 수 있습니다.
4. 메시지의 링크는 KNIL 리디렉트 주소(예: `knil.com/@haru/look?d={발송 ID}`)로 보냅니다. 클릭을 기록한 뒤 목적지로 이동시킵니다.

## 기록하는 데이터

| 지표 | 출처 |
| --- | --- |
| 댓글 수, 키워드 일치 댓글 수 | 댓글 웹훅 |
| DM 발송 수, 실패 수 | Private Reply API 응답 |
| 링크 클릭 수 | KNIL 리디렉트 |
| 콘텐츠별 반응 | 위 지표를 미디어 ID별로 집계 |

## 하지 않는 것

- 댓글이나 메시지를 먼저 보내지 않은 사람에게 DM 보내기
- 팔로우 여부를 확인한 뒤에만 링크 보내기 (API로 확인할 수 없습니다)
- 비공식 API, 스크래핑, 자동 로그인
- 같은 댓글에 두 번 이상 답장하기, 7일이 지난 댓글에 답장하기

정책과 엔드포인트는 바뀔 수 있으므로, 개발을 시작할 때 Meta 개발자 문서에서 최신 내용을 다시 확인합니다.
