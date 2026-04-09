import HeroSection from "../components/home/HeroSection";
import VisionHouseSection from "../components/home/VisionHouseSection";
import QuickAccessGrid from "../components/home/QuickAccessGrid";
import NewsTimeline from "../components/home/NewsTimeline";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <VisionHouseSection />
      <QuickAccessGrid />
      <NewsTimeline />
    </div>
  );
}
