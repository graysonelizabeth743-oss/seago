// src/components/home/TrackStrip.jsx
import TrackBox from "@/components/home/TrackBox";
import { hero, trackStrip } from "@/config/content";

/** The tracking bar that sits between the carousel and the hero. */
export default function TrackStrip() {
  return (
    <section aria-label="Track a shipment" className="border-b border-line bg-soft">
      <div className="container-x flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <div>
          <p className="font-display text-lg font-bold text-ink">{trackStrip.title}</p>
          <p className="mt-0.5 text-sm text-muted">{trackStrip.subtitle}</p>
        </div>
        <TrackBox label={hero.trackLabel} placeholder={hero.trackPlaceholder} className="md:max-w-xl" />
      </div>
    </section>
  );
}