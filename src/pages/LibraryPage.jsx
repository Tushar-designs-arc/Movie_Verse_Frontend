import { Bookmark, Heart } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import usePageMetadata from "../hooks/usePageMetadata";
import ContentCard from "../components/ContentCard";
import { RailSkeleton } from "../components/common/Skeletons";
import { API } from "../constants/apiEndpoints";

const LibraryPage = ({ collection, title, subtitle }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isFavorites = collection === "favorites";
  const Icon = isFavorites ? Heart : Bookmark;
  const emptyTitle = isFavorites ? "No favorites yet." : "Your watchlist is empty.";
  const emptyMessage = isFavorites
    ? "Start exploring movies and add them to your favorites."
    : "Save movies to watch later.";

  const pageTitle = useMemo(
    () => `${isFavorites ? "Favorites" : "Watchlist"} \u2022 MovieVerse`,
    [isFavorites]
  );

  usePageMetadata({ title: pageTitle });

// A collection page uses one loader for both favourites and wishlists to keep their behavior aligned.
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const { data } = await api.get(
        isFavorites ? API.FAVORITES.BASE : API.WISHLIST.BASE
      );
      const rows = data.data || [];
      setItems(rows.map((row) => row.movie).filter(Boolean));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isFavorites]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    void Promise.resolve().then(load);
  }, [load, pageTitle]);

  return (
    <div className="section-shell min-h-screen py-24 sm:py-28">
      <div className="max-w-2xl">
        <p className="eyebrow">Your library</p>
        <h1 className="mt-2 text-4xl font-black text-theme sm:text-5xl">{title}</h1>
        <p className="muted-copy mt-3">{subtitle}</p>
      </div>

      {loading ? (
        <div className="mt-8" aria-label="Loading your library" aria-busy="true">
          <RailSkeleton count={12} />
        </div>
      ) : error ? (
        <section className="cinema-panel mt-8 rounded-lg p-8 text-center sm:p-10" role="alert">
          <h2 className="text-xl font-black text-theme">Unable to load your library.</h2>
          <button
            type="button"
            onClick={load}
            className="primary-action mt-5 rounded-lg px-5 py-2.5 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Retry
          </button>
        </section>
      ) : items.length ? (
        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4 sm:gap-5">
          {items.map((item) => (
            <ContentCard
              key={item._id}
              item={item}
              initialIsFavorite={isFavorites}
              initialInWishlist={!isFavorites}
              onLibraryChange={load}
            />
          ))}
        </div>
      ) : (
        <section className="cinema-panel mt-8 rounded-lg p-8 text-center sm:p-10">
          <Icon className="mx-auto h-10 w-10 text-red-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-theme">{emptyTitle}</h2>
          <p className="muted-copy mx-auto mt-2 max-w-md">{emptyMessage}</p>
          <button
            type="button"
            onClick={() => navigate("/movies")}
            className="primary-action mt-6 rounded-lg px-5 py-2.5 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Browse Movies
          </button>
        </section>
      )}
    </div>
  );
};

export default LibraryPage;
