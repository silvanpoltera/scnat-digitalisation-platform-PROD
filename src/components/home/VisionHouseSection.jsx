import { useState } from "react";
import VisionHouse from "@/components/vision/VisionHouse";
import ActionFieldDetail from "@/components/vision/ActionFieldDetail";
import StatsStrip from "@/components/vision/StatsStrip";

export default function VisionHouseSection() {
  const [selected, setSelected] = useState(null);

  return (
    <section className="bg-muted/50 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-scnat-red font-semibold uppercase tracking-wider text-xs">
            Strategisches Zielbild
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mt-2">
            Das Haus der Digitalisierung
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
            Klick auf ein Handlungsfeld für Details zu Themen und Zielen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <VisionHouse selected={selected} onSelect={setSelected} />
          </div>
          <div className="lg:col-span-1">
            <ActionFieldDetail selectedId={selected} />
            <StatsStrip />
          </div>
        </div>
      </div>
    </section>
  );
}
