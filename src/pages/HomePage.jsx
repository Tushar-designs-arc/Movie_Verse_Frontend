import ContentRail from "../components/ContentRail";
import HeroSlider from "../components/layout/HeroSlider";
import { RailSkeleton } from "../components/common/Skeletons";
import { useStorefront } from "../context/StoreFrontContext";

const HomePage = () => {
  const { hero, trending, topRated, latest, upcoming, loading, error } = useStorefront();

  if (loading) {
    return (
      <div className="pt-20">
        <div className="h-[620px] animate-pulse bg-surface/[.08]" />
        <div className="section-shell py-10">
          <RailSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-shell py-32">
        <div className="cinema-panel rounded-lg p-8">
          <h1 className="text-3xl font-black text-theme">MovieVerse is unavailable</h1>
          <p className="muted-copy mt-3">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <HeroSlider items={hero} />
      <ContentRail
        title="Trending Movies"
        subtitle="Fresh, high-intent picks across MovieVerse."
        items={trending}
        to="/movies"
      />
      <ContentRail
        title="Top Rated"
        subtitle="Highest-rated stories from the community."
        items={topRated}
        to="/movies?sort=rating"
      />
      <ContentRail
        title="New Releases"
        subtitle="Recently released films, ready to explore."
        items={latest}
        to="/movies"
      />
      <ContentRail
        title="Coming Soon"
        subtitle="Save upcoming films to your watchlist."
        items={upcoming}
        to="/movies?status=upcoming"
      />
    </div>
  );
};

export default HomePage;