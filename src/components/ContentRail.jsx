import { ArrowLeft, ArrowRight } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ContentCard from "./ContentCard";
import { RailSkeleton } from "./common/Skeletons";

const ContentRail = ({ title, subtitle, items = [], to, loading = false }) => {
  const railRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const visibleItems = items.slice(0, 12);

  useEffect(() => {
    if (isPaused || visibleItems.length < 2) return undefined;

    const interval = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail) return;

      const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
      if (maxScrollLeft <= 0) return;

      if (rail.scrollLeft >= maxScrollLeft - 8) {
        rail.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        rail.scrollBy({ left: 260, behavior: "smooth" });
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused, visibleItems.length]);

  const moveRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * 260, behavior: "smooth" });
  };

  if (loading)
    return (
      <section
        className="section-shell py-8 sm:py-10"
        aria-label={`Loading ${title || "content"}`}
        aria-busy="true"
      >
        <div className="mb-5 h-8 w-60 animate-pulse rounded bg-surface/10" />
        <RailSkeleton />
      </section>
    );

  if (!items.length) return null;

  return (
    <section
      className="section-shell py-8 sm:py-10"
      aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-heading`}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="border-l-2 border-red-500 pl-4">
          <h2
            id={`${title.replace(/\s+/g, "-").toLowerCase()}-heading`}
            className="text-2xl font-black text-theme sm:text-3xl"
          >
            {title}
          </h2>
          {subtitle && <p className="muted-copy mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => moveRail(-1)}
            className="icon-action grid h-9 w-9 place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label={`Previous ${title}`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => moveRail(1)}
            className="icon-action grid h-9 w-9 place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label={`Next ${title}`}
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          {to && (
            <Link
              to={to}
              className="inline-flex items-center gap-2 rounded-md px-1 py-2 text-sm font-bold text-red-300 transition hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
      <div
        ref={railRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        {visibleItems.map((item) => (
          <div key={item._id} className="w-[240px] shrink-0 snap-start">
            <ContentCard item={item} compact />
          </div>
        ))}
      </div>
    </section>
  );
};

export default memo(ContentRail);
