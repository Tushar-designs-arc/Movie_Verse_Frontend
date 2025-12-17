import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBannerUrl } from "../../utils/image.js";

const HeroSlider = ({ items = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const activeItem = items[activeIndex] || items[0];

  const move = useCallback(
    (direction) => {
      setImageError(false);
      setIsExpanded(false);
      setActiveIndex(
        (index) => (index + direction + items.length) % items.length,
      );
    },
    [items.length],
  );

// Keep the selected slide valid when the featured list changes.
  useEffect(() => {
    queueMicrotask(() => {
      setActiveIndex((index) => Math.min(index, Math.max(items.length - 1, 0)));
      setImageError(false);
      setIsExpanded(false);
    });
  }, [items.length]);

// Keep featured titles rotating automatically; manual arrows remain available.
  useEffect(() => {
    if (items.length < 2 || isExpanded) return undefined;
    const timer = window.setInterval(() => move(1), 6000);
    return () => window.clearInterval(timer);
  }, [items.length, move, isExpanded]);

  if (!activeItem) return null;

  const selectItem = (index) => {
    setImageError(false);
    setIsExpanded(false);
    setActiveIndex(index);
  };

  return (
    <section
      className="relative min-h-[520px] overflow-hidden border-b border-white/10 bg-[#050609] sm:min-h-[610px]"
      aria-roledescription="carousel"
      aria-label="Featured movies"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      }}
    >
      <img
        src={
          imageError
            ? getBannerUrl()
            : getBannerUrl(activeItem.banner)
        }
        onError={() => setImageError(true)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/95 via-[#050609]/55 to-[#050609]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/85 via-[#050609]/10 to-[#050609]/35" />
      <div className="section-shell relative z-10 flex min-h-[520px] flex-col justify-end pb-14 pt-28 sm:min-h-[610px] sm:pb-12 sm:pt-32">
        <div className={isExpanded ? "max-w-5xl" : "max-w-3xl"}>
          <p className="eyebrow mb-4">Featured now</p>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-red-600 px-3 py-1 text-xs font-black uppercase text-theme">
              {activeItem.contentType}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-surface/[0.12] px-3 py-1 text-xs font-bold text-theme ring-1 ring-white/10">
              <Star
                className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                aria-hidden="true"
              />
              {activeItem.averageRating?.toFixed(1) ?? "N/A"}
            </span>
          </div>
          <h1 className="max-w-4xl break-words text-4xl font-black leading-[0.95] text-theme sm:text-6xl lg:text-7xl">
            {activeItem.title}
          </h1>
          <div className={`mt-5 ${isExpanded ? "max-w-4xl lg:max-w-5xl" : "max-w-2xl"}`}>
            <p
              className={`text-base leading-7 text-neutral-200 sm:text-lg ${
                isExpanded ? "" : "line-clamp-4 sm:line-clamp-5"
              }`}
            >
              {activeItem.description}
            </p>
            {activeItem.description && activeItem.description.length > 180 && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="mt-2 inline-flex items-center text-sm font-bold text-red-500 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to={`/watch/${activeItem.slug}`}
              className="bright-action inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Play className="h-5 w-5 fill-black" aria-hidden="true" />
              Play
            </Link>
            <Link
              to={`/details/${activeItem.slug}`}
              className="secondary-action inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              Details
            </Link>
          </div>
        </div>
      </div>
      {items.length > 1 && (
        <>
          <div className="absolute bottom-8 right-4 z-20 flex gap-2 sm:right-8">
            <button
              type="button"
              onClick={() => move(-1)}
              className="icon-action inline-flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Previous featured movie"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="icon-action inline-flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Next featured movie"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="hide-scrollbar absolute bottom-8 left-4 z-20 flex max-w-[calc(100%-11rem)] gap-2 overflow-x-auto pr-2 sm:left-8 lg:hidden">
            {items.map((item, index) => (
              <button
                key={item._id || item.slug}
                type="button"
                onClick={() => selectItem(index)}
                className={`h-1.5 rounded-full transition ${index === activeIndex ? "w-9 bg-red-400" : "w-4 bg-surface/35 hover:bg-surface/60"}`}
                aria-label={`Show ${item.title}`}
                aria-current={index === activeIndex}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
export default HeroSlider;
