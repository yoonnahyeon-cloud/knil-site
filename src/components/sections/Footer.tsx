import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="grid-12 border-t border-rule pt-6 pb-[clamp(28px,4vw,48px)] text-[13px] leading-[1.7]">
      <p className="col-span-6 md:col-span-6">
        <span className="font-semibold">{site.company}</span>
        <br />
        <span className="text-mute">{site.parent}의 자회사</span>
      </p>
    </footer>
  );
}
