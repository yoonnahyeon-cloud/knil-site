// The shape of a creator's KNIL page. Everything a visitor sees is a list of
// blocks; the order of the list is the order on the page.

export type Platform = "Instagram" | "YouTube" | "TikTok" | "Xiaohongshu" | "X" | "Threads" | "Blog";
export const PLATFORMS: Platform[] = ["Instagram", "YouTube", "TikTok", "Xiaohongshu", "X", "Threads", "Blog"];

export type ChannelItem = { id: string; platform: Platform; url: string; followers: string };
export type GalleryItem = { id: string; label: string; url: string; image?: string };
export type ProductItem = { id: string; name: string; price: string; url: string; image?: string };

type Base = { id: string; hidden?: boolean };

export type Block =
  | (Base & { type: "channels"; items: ChannelItem[] })
  | (Base & { type: "link"; title: string; sub: string; label: string; url: string })
  | (Base & { type: "video"; title: string; heading: string; meta: string; duration: string; url: string; image?: string })
  | (Base & { type: "gallery"; title: string; note: string; items: GalleryItem[] })
  | (Base & { type: "products"; title: string; note: string; items: ProductItem[] });

export type BlockType = Block["type"];

export type Profile = {
  handle: string;
  name: string;
  bio: string;
  avatar?: string;
};

export type Page = { profile: Profile; blocks: Block[]; updatedAt: number; portfolio?: Portfolio; chat?: ChatSettings };

// Chat with visitors in their own language. `guide` is what the AI may use
// to answer first: prices, hours, how to book, frequent questions.
export type ChatSettings = { on: boolean; ai: boolean; guide: string };

// Every message is kept twice: in Korean for the creator and in the
// visitor's language for the visitor.
export type ChatMessage = { id: string; from: "visitor" | "owner" | "ai"; ko: string; visitor: string; at: number };

export type ChatThread = { id: string; handle: string; lang: string; name: string; last: string; unread: number; at: number };

// What brands see when choosing creators: the data side of a creator.
export type Portfolio = {
  intro: string;
  categories: string[];
  tags: string[];
  region: string;
  audience: string;
  collabs: string;
};

export const CATEGORIES = ["뷰티", "패션", "푸드", "여행", "리빙", "육아", "운동", "테크", "반려동물", "교육", "게임", "음악"];

export type ProposalStatus = "new" | "progress" | "done";

// A collaboration request a brand sends from a creator's public page.
export type Proposal = {
  id: string;
  handle: string;
  brand: string;
  contact: string;
  budget: string;
  message: string;
  status: ProposalStatus;
  at: number;
};

// One row per visit or click. `target` is the block id (and item id, joined
// with ":") that was clicked; `source` is where the visitor came from.
export type KnilEvent = {
  kind: "view" | "click";
  handle: string;
  at: number;
  target?: string;
  source: Source;
};

export type Source = "Instagram" | "YouTube" | "TikTok" | "검색" | "직접 방문" | "기타";
