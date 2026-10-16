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

export type Page = { profile: Profile; blocks: Block[]; updatedAt: number };

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
