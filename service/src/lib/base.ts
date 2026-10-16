export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// The address a creator shares. On the preview it points at this host;
// in production it becomes knil.com/@handle.
export function publicUrl(handle: string) {
  if (typeof window === "undefined") return `knil.com/@${handle}`;
  return `${location.origin}${BASE}/@${handle}`;
}
export const displayUrl = (handle: string) => `knil.com/@${handle}`;
