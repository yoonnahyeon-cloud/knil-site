import { Masthead } from "@/components/sections/Masthead";
import { Hero } from "@/components/sections/Hero";
import { Reverse } from "@/components/sections/Reverse";
import { Channels } from "@/components/sections/Channels";
import { Screens } from "@/components/sections/Screens";
import { AutoDm } from "@/components/sections/AutoDm";
import { Expansion } from "@/components/sections/Expansion";
import { Sides } from "@/components/sections/Sides";
import { Network } from "@/components/sections/Network";
import { Vision } from "@/components/sections/Vision";
import { Finale } from "@/components/sections/Finale";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Masthead />
      <main id="top">
        <Hero />
        <Reverse />
        <Channels />
        <Screens />
        <AutoDm />
        <Expansion />
        <Sides />
        <Network />
        <Vision />
        <Finale />
      </main>
      <Footer />
    </>
  );
}
