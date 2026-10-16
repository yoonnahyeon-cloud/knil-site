// ROSIE is a fictional sample creator, the same one used on the brand site.
// Her page and statistics are illustrative only.

import { BASE } from "./base";
import type { ChatMessage, ChatThread, KnilEvent, Page, Source } from "./types";

// A date n days from today as YYYY-MM-DD, so the sample calendar always looks current.
function day(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const demoPage: Page = {
  profile: { handle: "rosie", name: "ROSIE YOON", bio: "beauty, fashion, daily life", avatar: `${BASE}/samples/rosie.jpg` },
  updatedAt: 0,
  portfolio: {
    intro: "데일리 뷰티와 가을 룩을 매주 릴스로 올려요",
    categories: ["뷰티", "패션"],
    tags: ["데일리메이크업", "가을룩", "협찬릴스"],
    region: "서울",
    audience: "20대 여성",
    collabs: "스킨케어 브랜드 릴스 6회, 패션 공동구매 2회",
  },
  chat: { on: true, ai: true, guide: "립 틴트 03 로즈는 18,000원, 수분 쿠션 21호는 32,000원. 해외 배송은 SHOP 링크에서 가능. 협찬 문의는 '협업 제안하기'로." },
  blocks: [
    {
      id: "ch",
      type: "channels",
      items: [
        { id: "ig", platform: "Instagram", url: "https://instagram.com", followers: "28.6만" },
        { id: "yt", platform: "YouTube", url: "https://youtube.com", followers: "12.4만" },
        { id: "tt", platform: "TikTok", url: "https://tiktok.com", followers: "19.8만" },
        { id: "xhs", platform: "Xiaohongshu", url: "https://xiaohongshu.com", followers: "4.2만" },
      ],
    },
    {
      id: "cal",
      type: "calendar",
      title: "공구 · 기획전 일정",
      note: "알림 받고 놓치지 마세요",
      items: [
        { id: "e1", title: "수분 쿠션 공동구매", start: day(-2), end: day(2), kind: "공구", url: "https://example.com" },
        { id: "e2", title: "가을 니트 기획전", start: day(5), end: day(9), kind: "기획전", url: "https://example.com" },
        { id: "e3", title: "인스타 라이브 Q&A", start: day(12), end: day(12), kind: "라이브", url: "" },
      ],
    },
    {
      id: "nv",
      type: "video",
      heading: "New Video",
      title: "가을 데일리 메이크업, 10분 루틴",
      meta: "새 영상 · 2일 전",
      duration: "12:48",
      url: "https://youtube.com",
    },
    {
      id: "dl",
      type: "gallery",
      title: "Daily Look",
      note: "4개의 룩",
      items: [
        { id: "l1", label: "니트와 데님", url: "https://instagram.com" },
        { id: "l2", label: "블랙 셋업", url: "https://instagram.com" },
        { id: "l3", label: "트렌치 코트", url: "https://instagram.com" },
        { id: "l4", label: "주말 외출", url: "https://instagram.com" },
      ],
    },
    {
      id: "bp",
      type: "products",
      title: "Beauty Picks",
      note: "ROSIE가 쓰는 제품",
      items: [
        { id: "p1", name: "립 틴트 03 로즈", price: "18,000원", url: "https://example.com" },
        { id: "p2", name: "수분 쿠션 21호", price: "32,000원", url: "https://example.com" },
      ],
    },
    { id: "bc", type: "link", title: "Brand Collaboration", sub: "가을 스킨케어 협업 · 10.14 – 10.20", label: "진행 중", url: "https://example.com" },
    { id: "sh", type: "link", title: "Shop", sub: "ROSIE SELECT · 상품 24개", label: "바로 가기", url: "https://example.com" },
  ],
};

// 30 days of plausible traffic, generated deterministically so the numbers
// stay the same on every visit.
let cache: KnilEvent[] | null = null;
export function demoEvents(): KnilEvent[] {
  if (cache) return cache;
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = <T,>(pairs: [T, number][]) => {
    let r = rand() * pairs.reduce((s, [, w]) => s + w, 0);
    for (const [v, w] of pairs) if ((r -= w) <= 0) return v;
    return pairs[0][0];
  };
  const sources: [Source, number][] = [["Instagram", 62], ["YouTube", 17], ["TikTok", 11], ["직접 방문", 6], ["검색", 4]];
  const targets: [string, number][] = [
    ["sh", 24], ["bp:p1", 14], ["bp:p2", 9], ["nv", 12], ["bc", 8], ["dl:l1", 6], ["dl:l2", 5], ["dl:l3", 4], ["dl:l4", 3],
    ["ch:ig", 6], ["ch:yt", 5], ["ch:tt", 3], ["ch:xhs", 1],
  ];
  const out: KnilEvent[] = [];
  const day = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let d = 29; d >= 0; d--) {
    const start = today.getTime() - d * day;
    const visits = Math.round(90 + 40 * Math.sin(d / 3) + rand() * 50 + (d < 4 ? 80 : 0));
    for (let i = 0; i < visits; i++) {
      const at = start + Math.floor(rand() * day);
      if (at > Date.now()) continue;
      const source = pick(sources);
      out.push({ kind: "view", handle: "rosie", at, source });
      if (rand() < 0.62) out.push({ kind: "click", handle: "rosie", at: at + 4000, source, target: pick(targets) });
    }
  }
  cache = out;
  return out;
}

// Extra fictional pages, shown only as previews on the home screen.
export const showcase: Page[] = [
  demoPage,
  {
    profile: { handle: "minu.table", name: "MINU", bio: "집밥과 동네 맛집" },
    updatedAt: 0,
    portfolio: { intro: "10분 집밥 레시피와 동네 맛집", categories: ["푸드", "리빙"], tags: ["집밥", "원팬요리"], region: "부산", audience: "30대 직장인", collabs: "주방용품 공동구매 3회" },
    blocks: [
      {
        id: "ch",
        type: "channels",
        items: [
          { id: "ig", platform: "Instagram", url: "", followers: "9.4만" },
          { id: "yt", platform: "YouTube", url: "", followers: "3.1만" },
        ],
      },
      { id: "v", type: "video", heading: "New Video", title: "10분 완성 원팬 파스타", meta: "새 영상 · 오늘", duration: "08:12", url: "" },
      {
        id: "p",
        type: "products",
        title: "Kitchen Picks",
        note: "매일 쓰는 도구",
        items: [
          { id: "a", name: "무쇠 팬 24cm", price: "39,000원", url: "" },
          { id: "b", name: "올리브 오일", price: "16,500원", url: "" },
        ],
      },
      { id: "l", type: "link", title: "공동구매", sub: "제철 귤 5kg · D-2", label: "참여하기", url: "" },
    ],
  },
  {
    profile: { handle: "hana.trip", name: "HANA", bio: "travel, film, slow days" },
    updatedAt: 0,
    portfolio: { intro: "필름 카메라로 담는 느린 여행", categories: ["여행"], tags: ["필름사진", "교토", "호캉스"], region: "제주", audience: "20대 후반 여성", collabs: "캐리어 브랜드, 호텔 숙박 협찬" },
    blocks: [
      {
        id: "ch",
        type: "channels",
        items: [
          { id: "ig", platform: "Instagram", url: "", followers: "15.2만" },
          { id: "tt", platform: "TikTok", url: "", followers: "6.8만" },
        ],
      },
      {
        id: "g",
        type: "gallery",
        title: "Places",
        note: "지난 여행",
        items: [
          { id: "a", label: "교토", url: "" },
          { id: "b", label: "리스본", url: "" },
          { id: "c", label: "제주", url: "" },
        ],
      },
      { id: "l1", type: "link", title: "Brand Collaboration", sub: "캐리어 협업 · 10.20 – 10.31", label: "진행 중", url: "" },
      { id: "l2", type: "link", title: "여행 가이드북", sub: "PDF · 교토 3박 4일", label: "바로 가기", url: "" },
    ],
  },
];

// The sample page in a few languages, standing in for the AI translation
// that real pages get from the server.
const DEMO_DICT: Record<string, Record<string, string>> = {
  en: {
    "가을 데일리 메이크업, 10분 루틴": "Fall daily makeup, a 10-minute routine",
    "새 영상 · 2일 전": "New video · 2 days ago",
    "4개의 룩": "4 looks",
    "니트와 데님": "Knit and denim",
    "블랙 셋업": "Black set",
    "트렌치 코트": "Trench coat",
    "주말 외출": "Weekend out",
    "ROSIE가 쓰는 제품": "What ROSIE uses",
    "립 틴트 03 로즈": "Lip tint 03 Rose",
    "수분 쿠션 21호": "Hydrating cushion No. 21",
    "가을 스킨케어 협업 · 10.14 – 10.20": "Fall skincare collab · Oct 14 – 20",
    "진행 중": "Live now",
    "ROSIE SELECT · 상품 24개": "ROSIE SELECT · 24 items",
    "바로 가기": "Open",
  },
  ja: {
    "beauty, fashion, daily life": "ビューティー、ファッション、日常",
    "가을 데일리 메이크업, 10분 루틴": "秋のデイリーメイク、10分ルーティン",
    "새 영상 · 2일 전": "新着動画 · 2日前",
    "4개의 룩": "4つのルック",
    "니트와 데님": "ニットとデニム",
    "블랙 셋업": "ブラックのセットアップ",
    "트렌치 코트": "トレンチコート",
    "주말 외출": "週末のおでかけ",
    "ROSIE가 쓰는 제품": "ROSIEの愛用品",
    "립 틴트 03 로즈": "リップティント 03 ローズ",
    "수분 쿠션 21호": "うるおいクッション 21号",
    "가을 스킨케어 협업 · 10.14 – 10.20": "秋のスキンケアコラボ · 10/14 – 10/20",
    "진행 중": "開催中",
    "ROSIE SELECT · 상품 24개": "ROSIE SELECT · 24商品",
    "바로 가기": "見る",
  },
  "zh-CN": {
    "beauty, fashion, daily life": "美妆、时尚、日常",
    "가을 데일리 메이크업, 10분 루틴": "秋季日常妆容，10分钟流程",
    "새 영상 · 2일 전": "新视频 · 2天前",
    "4개의 룩": "4套穿搭",
    "니트와 데님": "针织衫和牛仔",
    "블랙 셋업": "黑色套装",
    "트렌치 코트": "风衣",
    "주말 외출": "周末出门",
    "ROSIE가 쓰는 제품": "ROSIE 在用的产品",
    "립 틴트 03 로즈": "唇釉 03 玫瑰",
    "수분 쿠션 21호": "保湿气垫 21号",
    "가을 스킨케어 협업 · 10.14 – 10.20": "秋季护肤合作 · 10.14 – 10.20",
    "진행 중": "进行中",
    "ROSIE SELECT · 상품 24개": "ROSIE SELECT · 24件商品",
    "바로 가기": "前往",
  },
};

export const demoDict = (lang: string) => DEMO_DICT[lang] ?? null;

const now = Date.now();
const min = 60000;

// Sample conversations in ROSIE's inbox.
export const demoThreads: { thread: ChatThread; messages: ChatMessage[] }[] = [
  {
    thread: { id: "d1", handle: "rosie", lang: "ja", name: "Yuki", last: "", unread: 1, at: now - 6 * min },
    messages: [
      { id: "a", from: "visitor", visitor: "動画で使っていたリップは何番ですか？", ko: "영상에서 쓰신 립은 몇 번인가요?", at: now - 8 * min },
      { id: "b", from: "ai", visitor: "リップティント 03 ローズです！18,000ウォンで、SHOPリンクから海外配送もできます。", ko: "립 틴트 03 로즈예요! 18,000원이고 SHOP 링크에서 해외 배송도 돼요.", at: now - 8 * min + 5000 },
      { id: "c", from: "visitor", visitor: "ありがとうございます！日本にも届きますか？", ko: "감사합니다! 일본에도 배송되나요?", at: now - 6 * min },
    ],
  },
  {
    thread: { id: "d2", handle: "rosie", lang: "en", name: "Glow Lab (LA)", last: "", unread: 0, at: now - 3 * 60 * min },
    messages: [
      { id: "a", from: "visitor", visitor: "Hi ROSIE! We're a clean skincare brand from LA. Would you be open to a reels collab next month?", ko: "안녕하세요 ROSIE님! LA의 클린 스킨케어 브랜드예요. 다음 달 릴스 협업 가능하실까요?", at: now - 4 * 60 * min },
      { id: "b", from: "owner", ko: "안녕하세요! 좋아요. 제품 정보와 일정 보내주시면 검토해 볼게요.", visitor: "Hi! Sounds great. Send me the product details and timeline and I'll take a look.", at: now - 3 * 60 * min },
    ],
  },
  {
    thread: { id: "d3", handle: "rosie", lang: "zh-CN", name: "小林", last: "", unread: 0, at: now - 26 * 60 * min },
    messages: [
      { id: "a", from: "visitor", visitor: "这件风衣在哪里买的？", ko: "이 트렌치 코트 어디서 사셨어요?", at: now - 26 * 60 * min },
      { id: "b", from: "ai", visitor: "这件风衣在 ROSIE SELECT 里可以找到哦！点页面上的 Shop 就能看到。", ko: "ROSIE SELECT에서 찾을 수 있어요! 페이지의 Shop을 누르면 보여요.", at: now - 26 * 60 * min + 5000 },
    ],
  },
];

// What the sample page's AI says back to a new visitor message.
export function demoAiReply(lang: string): { visitor: string; ko: string } {
  const ko = "메시지 고마워요! ROSIE가 확인하고 곧 답장할게요.";
  const visitor: Record<string, string> = {
    ko,
    en: "Thanks for your message! ROSIE will read it and reply soon.",
    ja: "メッセージありがとうございます！ROSIEが確認して、すぐにお返事しますね。",
    "zh-CN": "谢谢你的留言！ROSIE 看到后会尽快回复你。",
    "zh-TW": "謝謝你的留言！ROSIE 看到後會盡快回覆你。",
  };
  return { ko, visitor: visitor[lang] ?? visitor.en };
}

const sample = (handle: string, name: string, bio: string, ch: [string, string][], portfolio: Page["portfolio"]): Page => ({
  profile: { handle, name, bio },
  updatedAt: 0,
  portfolio,
  blocks: [{ id: "ch", type: "channels", items: ch.map(([platform, followers], i) => ({ id: String(i), platform: platform as "Instagram", url: "", followers })) }],
});

showcase.push(
  sample("jun.fit", "JUN", "홈트와 식단, 매일 30분", [["Instagram", "6.2만"], ["YouTube", "18.5만"]], {
    intro: "운동 초보를 위한 홈트 루틴", categories: ["운동"], tags: ["홈트", "다이어트", "식단"], region: "서울", audience: "20–30대 남녀", collabs: "프로틴 브랜드 유튜브 PPL 4회",
  }),
  sample("sora.home", "SORA", "작은 집을 넓게 쓰는 법", [["Instagram", "11.3만"], ["Threads", "2.1만"]], {
    intro: "원룸 인테리어와 수납 아이디어", categories: ["리빙"], tags: ["원룸인테리어", "수납"], region: "경기", audience: "20대 1인 가구", collabs: "가구 브랜드 공동구매 5회",
  }),
  sample("leo.tech", "LEO", "새로 나온 기기 먼저 써보기", [["YouTube", "32만"], ["X", "4.8만"]], {
    intro: "스마트폰, 노트북 리뷰", categories: ["테크"], tags: ["언박싱", "리뷰"], region: "서울", audience: "20–40대 남성", collabs: "가전 브랜드 리뷰 12회",
  }),
  sample("yuna.glow", "YUNA", "skin, clinic, self care", [["Instagram", "15.7만"], ["TikTok", "9.9만"], ["Xiaohongshu", "3.4만"]], {
    intro: "피부 관리와 클리닉 시술 후기", categories: ["뷰티"], tags: ["피부관리", "시술후기", "K뷰티"], region: "서울 강남", audience: "20–30대 여성, 중화권 팬", collabs: "피부과 시술 후기 8회",
  }),
);
