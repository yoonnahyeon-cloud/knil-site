// Site-wide configuration. Service routes (sign-in, creator pages such as
// knil.com/@{handle}) are intentionally absent at this stage; add them under
// src/app/(service) when the product launches and point SERVICE_URL there.
export const site = {
  name: "KNIL",
  nameKo: "크닐",
  company: "주식회사 크닐",
  slogan: "링크, 그 반대편의 가능성.",
  category: "크리에이터 멀티 링크 플랫폼",
  description:
    "링크가 사람을 어디론가 보내는 것에 집중했다면, 크닐은 링크를 반대로 바라봅니다. 크리에이터에게는 데이터, 브랜드에게는 더 정확한 선택, 팔로워에게는 더 편리한 연결. KNIL은 이 세 주체가 만나는 크리에이터 멀티 링크 플랫폼입니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://knil.com",
  serviceUrl: null as string | null,
  locale: "ko_KR",
} as const;
