// The address a visitor typed on the home screen, kept until they have
// signed in and reach /start.
const KEY = "knil:pending-handle";

export function setPendingHandle(h: string) {
  try {
    localStorage.setItem(KEY, h);
  } catch {}
}
export function takePendingHandle(): string | null {
  try {
    const h = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return h;
  } catch {
    return null;
  }
}
