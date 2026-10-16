// ROSIE is a fictional sample creator, the same one used on the brand site.
// Her page and statistics are illustrative only.

import type { KnilEvent, Page, Source } from "./types";

export const demoPage: Page = {
  profile: { handle: "rosie", name: "ROSIE", bio: "beauty, fashion, daily life" },
  updatedAt: 0,
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
