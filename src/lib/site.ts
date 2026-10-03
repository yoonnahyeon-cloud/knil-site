// Site-wide configuration. Service routes (sign-in, creator pages such as
// knil.me/{handle}) are intentionally absent at this stage; add them under
// src/app/(service) when the product launches and point SERVICE_URL there.
export const site = {
  name: "KNIL",
  nameKo: "크닐",
  company: "주식회사 크닐",
  parent: "주식회사 텍스처",
  slogan: "링크, 그 반대편의 가능성.",
  description:
    "KNIL은 LINK를 뒤집은 이름입니다. 크리에이터를 위한 멀티링크에서 시작해, 링크 반대편에 쌓이는 크리에이터와 행동 데이터를 새로운 사업으로 연결합니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://knil.me",
  serviceUrl: null as string | null,
  locale: "ko_KR",
} as const;
