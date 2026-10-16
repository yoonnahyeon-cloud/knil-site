// Turns server and network errors into Korean a creator can act on.

type Raw = { message?: string; code?: string; status?: number } | null | undefined;

export function korean(e: unknown): string {
  const err = (e ?? {}) as Raw & object;
  const msg = (err?.message ?? String(e ?? "")).toLowerCase();
  const code = err?.code ?? "";
  const status = err?.status ?? 0;

  if (code === "23505" || msg.includes("duplicate key")) return "이미 사용 중인 아이디입니다";
  if (code === "PGRST205" || code === "42P01" || code === "42703" || msg.includes("schema cache") || msg.includes("does not exist"))
    return "서버 준비가 아직 덜 됐어요. 잠시 후 다시 시도해 주세요.";
  if (code === "42501" || msg.includes("row-level security") || msg.includes("permission denied") || status === 401 || status === 403)
    return "권한이 없어요. 다시 로그인해 주세요.";
  if (msg.includes("jwt") || msg.includes("session") || msg.includes("not authenticated")) return "로그인이 만료됐어요. 다시 로그인해 주세요.";
  if (status === 429 || msg.includes("rate limit") || msg.includes("too many")) return "요청이 많아요. 잠시 후 다시 시도해 주세요.";
  if (msg.includes("email") && (msg.includes("invalid") || msg.includes("valid"))) return "이메일 주소를 다시 확인해 주세요.";
  if (msg.includes("signup") && msg.includes("not allowed")) return "지금은 새로 가입할 수 없어요.";
  if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("load failed") || msg.includes("timeout"))
    return "인터넷 연결을 확인하고 다시 시도해 주세요.";
  return "문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
}

export class KoreanError extends Error {
  constructor(e: unknown) {
    super(korean(e));
  }
}

// Keeps a message that is already Korean; translates anything else.
export const toKorean = (e: unknown) => (e instanceof Error && /[가-힣]/.test(e.message) ? e.message : korean(e));
