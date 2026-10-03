// All copy lives here so the page can later be fed from a CMS or the
// KNIL service without touching layout components.

export const reverse = {
  outward: ["링크는 지금까지", "사람을 어디론가 보내는 데", "집중했습니다."],
  inward: ["크닐은 링크를", "반대로 바라봅니다."],
  signals: [
    { kind: "유입", text: "누가 들어왔는지," },
    { kind: "선택", text: "무엇을 선택했는지," },
    { kind: "반응", text: "어떤 콘텐츠와 브랜드에 반응했는지." },
  ],
  close: ["LINK를 뒤집으면 KNIL.", "링크 너머에 남겨진 데이터를 발견하고,", "그 데이터에서 새로운 가능성을 찾습니다."],
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

// Who meets on KNIL, and what each of them gets.
export const sides = {
  lines: [
    { who: "크리에이터", gets: "데이터,", body: "크리에이터는 감이 아닌 데이터를 기반으로 자신의 영향력을 이해하고, 콘텐츠와 비즈니스를 설계합니다." },
    { who: "브랜드", gets: "더 정확한 선택,", body: "브랜드는 단순 팔로워 수가 아닌 실제 반응 데이터를 기반으로 크리에이터를 발견하고, 더 정교한 광고와 협업을 진행합니다." },
    { who: "팔로워", gets: "더 편리한 연결.", body: "팔로워는 여러 플랫폼에 흩어진 크리에이터의 콘텐츠, 상품, 브랜드와 활동을 하나의 KNIL에서 더 편리하게 발견하고 이용합니다." },
  ],
  close: ["KNIL은 이 세 주체가 만나는", "크리에이터 멀티링크 플랫폼입니다."],
};

export const network = {
  figure: "14M+",
  figureLabel: ["대표이사가 함께해 온 크리에이터", "합산 팔로워 1,400만+"],
  connected: ["그리고 이미 연결되어 있는", "크리에이터 네트워크."],
  sources: [
    { name: "대표이사", detail: "직접 관계를 맺어 온 크리에이터 네트워크" },
    { name: "초기 마케팅", detail: "대규모 광고비 없이 크리에이터에게 직접 소개" },
  ],
  statement: ["KNIL은 사용자를", "처음부터 찾아야 하는", "서비스가 아닙니다."],
  body:
    "KNIL은 대표이사가 직접 관계를 맺어 온 크리에이터 네트워크를 통해 처음부터 크리에이터에게 소개됩니다. 대규모 마케팅 비용을 먼저 쓰지 않고도 크리에이터 시장에 서비스를 알릴 수 있고, 초기 사용자를 만나는 비용은 그만큼 낮아집니다.",
  footnote:
    "1,400만+는 대표이사가 함께해 온 크리에이터 계정의 팔로워를 합산한 수치이며, KNIL 이용자 수를 뜻하지 않습니다.",
};

export const finale = {
  first: ["링크는", "시작일 뿐입니다."],
  second: ["크리에이터에게는 하나의 링크.", "KNIL에게는 새로운 데이터의 시작."],
};
