// All copy lives here so the page can later be fed from a CMS or the
// KNIL service without touching layout components.

export const reverse = {
  outward: ["우리는 링크를 타고", "어디론가 가는 것만 생각했습니다."],
  inward: ["KNIL은", "그 반대편을 봅니다."],
  signals: [
    { kind: "유입", text: "누가 들어왔는지" },
    { kind: "클릭", text: "무엇을 클릭했는지" },
    { kind: "관심", text: "어떤 콘텐츠에 관심을 보였는지" },
    { kind: "반응", text: "어떤 상품에 반응했는지" },
  ],
  close: ["LINK를 뒤집으면 KNIL.", "링크를 바라보는 방식도 뒤집습니다."],
};

export type ChannelRow = {
  channel: string;
  title: string;
  meta: string;
  clicks: string;
};

// Sample creator page. "하루" is a fictional creator used for illustration.
export const creatorPage = {
  heading: ["크리에이터의 모든 활동을", "하나의 KNIL로."],
  handle: "haru",
  name: "하루",
  bio: "옷장과 일상을 기록합니다",
  rows: [
    { channel: "Instagram", title: "@haru.archive", meta: "12.8만", clicks: "1,942" },
    { channel: "YouTube", title: "하루의 옷장", meta: "4.2만", clicks: "1,206" },
    { channel: "TikTok", title: "@haru.archive", meta: "8.6만", clicks: "731" },
    { channel: "Xiaohongshu", title: "haru archive", meta: "1.1만", clicks: "288" },
    { channel: "Shop", title: "하루 셀렉트", meta: "상품 24", clicks: "2,415" },
    { channel: "공동구매", title: "가을 니트 공동구매", meta: "D-3", clicks: "3,870" },
    { channel: "콘텐츠", title: "가을 옷장 정리 루틴", meta: "영상", clicks: "1,123" },
  ] satisfies ChannelRow[],
};

export const expansion = {
  opening: ["하지만,", "링크가 끝은 아닙니다."],
  stages: [
    { word: "멀티링크", note: "크리에이터가 흩어진 채널을 하나의 페이지에 연결합니다." },
    { word: "크리에이터", note: "더 많은 크리에이터가 KNIL로 자신을 소개합니다." },
    { word: "데이터", note: "방문, 클릭, 콘텐츠 관심, 상품 반응이 쌓입니다." },
    { word: "비즈니스", note: "쌓인 데이터 위에서 새로운 사업이 시작됩니다." },
  ],
  businesses: ["광고", "브랜드 매칭", "커머스", "어필리에이트", "크리에이터 데이터"],
};

export const network = {
  figure: "14M+",
  figureLabel: ["주식회사 텍스처 소속 크리에이터", "합산 팔로워 1,400만+"],
  connected: ["그리고 이미 연결되어 있는", "크리에이터 네트워크."],
  sources: [
    { name: "주식회사 텍스처", detail: "소속 크리에이터 네트워크" },
    { name: "윤나현 대표", detail: "외부 크리에이터 네트워크" },
  ],
  statement: ["KNIL은 사용자를", "처음부터 찾아야 하는", "서비스가 아닙니다."],
  body:
    "KNIL은 텍스처와 함께하는 크리에이터, 그리고 윤나현 대표가 직접 관계를 맺어 온 외부 크리에이터에게 처음부터 직접 소개됩니다. 대규모 마케팅 비용을 먼저 쓰지 않고도 크리에이터 시장에 서비스를 알릴 수 있고, 초기 사용자를 만나는 비용은 그만큼 낮아집니다.",
  footnote:
    "1,400만+는 텍스처 소속 크리에이터 계정의 팔로워를 합산한 수치이며, KNIL 이용자 수를 뜻하지 않습니다.",
};

export const finale = {
  first: ["링크는", "시작일 뿐입니다."],
  second: ["크리에이터에게는 하나의 링크.", "KNIL에게는 새로운 데이터의 시작."],
};
