import {
  BookmarkCheck,
  BookmarkPlus,
  Heart,
  LoaderCircle,
  Play,
  Star,
} from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";
import { API } from "../constants/apiEndpoints";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { getPosterUrl } from "../utils/image.js";

const ContentCard = ({
  item,
  compact = false,
  onLibraryChange,
  initialIsFavorite = false,
  initialInWishlist = false,
}) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [posterError, setPosterError] = useState(false);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);
  const [updatingWishlist, setUpdatingWishlist] = useState(false);

// Reconcile optimistic card state with the signed-in library after the card identity changes.
  useEffect(() => {
    queueMicrotask(() => {
      setIsFavorite(initialIsFavorite);
      setInWishlist(initialInWishlist);
    });
  }, [initialInWishlist, initialIsFavorite, item?._id]);

// Reconcile optimistic card state with the signed-in library after the card identity changes.
  useEffect(() => {
    let active = true;
    if (!isAuthenticated || !item?._id) return undefined;

    Promise.all([
      api.get(API.FAVORITES.CHECK(item._id)),
      api.get(API.WISHLIST.CHECK(item._id)),
    ])
      .then(([favoriteResponse, wishlistResponse]) => {
        if (!active) return;
        setIsFavorite(Boolean(favoriteResponse.data.data?.isFavorite));
        setInWishlist(Boolean(wishlistResponse.data.data?.inWishlist));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isAuthenticated, item?._id]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    showToast("Please sign in to save titles.", "info");
    navigate("/login", { state: { from: location } });
    return false;
  };

  const toggleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!requireAuth() || updatingFavorite) return;

    const previousValue = isFavorite;
    setIsFavorite(!previousValue);
    setUpdatingFavorite(true);
    try {
      if (previousValue) {
        await api.delete(API.FAVORITES.BY_MOVIE(item._id));
        showToast("Removed from favorites.", "success");
      } else {
        await api.post(API.FAVORITES.BY_MOVIE(item._id));
        showToast("Added to favorites.", "success");
      }
      onLibraryChange?.();
    } catch (error) {
      setIsFavorite(previousValue);
      showToast(
        error.response?.data?.message || "Could not update favorites.",
        "error",
      );
    } finally {
      setUpdatingFavorite(false);
    }
  };

  const toggleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!requireAuth() || updatingWishlist) return;

    const previousValue = inWishlist;
    setInWishlist(!previousValue);
    setUpdatingWishlist(true);
    try {
      if (previousValue) {
        await api.delete(API.WISHLIST.BY_MOVIE(item._id));
        showToast("Removed from watchlist.", "success");
      } else {
        await api.post(API.WISHLIST.BASE, { movieId: item._id });
        showToast("Added to watchlist.", "success");
      }
      onLibraryChange?.();
    } catch (error) {
      setInWishlist(previousValue);
      showToast(
        error.response?.data?.message || "Could not update watchlist.",
        "error",
      );
    } finally {
      setUpdatingWishlist(false);
    }
  };

  const posterUrl = posterError
    ? getPosterUrl()
    : getPosterUrl(item.poster);

  return (
    <article className="cinema-card group relative w-full overflow-hidden rounded-lg transition duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-red-500">
      <Link
        to={`/details/${item.slug}`}
        className="block focus-visible:outline-none"
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-surface-soft">
          <img
            src={posterUrl}
            alt={`${item.title} poster`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setPosterError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
          <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-bold uppercase text-white backdrop-blur-sm">
            {item.contentType || "Movie"}
          </span>
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-sm font-semibold text-white backdrop-blur-sm">
            <Star
              className="h-4 w-4 fill-yellow-400 text-yellow-400"
              aria-hidden="true"
            />
            {item.averageRating?.toFixed(1) || "—"}
          </span>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <Link
          to={`/details/${item.slug}`}
          className="focus-visible:outline-none"
        >
          <h3 className="line-clamp-1 font-bold text-theme transition group-hover:text-red-500">
            {item.title}
          </h3>
        </Link>
        <p className="text-xs uppercase text-muted">
          {item.releaseDate
            ? new Date(item.releaseDate).getFullYear()
            : "Coming soon"}
          {item.duration ? ` · ${item.duration} min` : ""}
        </p>
        {!compact && (
          <p className="line-clamp-2 min-h-10 text-sm text-muted">
            {item.description ||
              item.genres?.join(" · ") ||
              "No description available."}
          </p>
        )}
        <div className="grid grid-cols-[1fr_40px_40px] gap-2">
          <Link
            to={`/watch/${item.slug}`}
            className="primary-action inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Trailer
          </Link>
          <button
            type="button"
            onClick={toggleWishlist}
            disabled={updatingWishlist}
            className={`icon-action rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-60 ${inWishlist ? "!border-teal-500 !bg-teal-500/20 !text-teal-400" : ""}`}
            aria-label={
              inWishlist ? "Remove from watchlist" : "Add to watchlist"
            }
            aria-pressed={inWishlist}
            aria-busy={updatingWishlist}
            title={
              updatingWishlist
                ? "Updating watchlist"
                : inWishlist
                  ? "Remove from watchlist"
                  : "Add to watchlist"
            }
          >
            {updatingWishlist ? (
              <LoaderCircle className="mx-auto h-4 w-4 animate-spin" />
            ) : inWishlist ? (
              <BookmarkCheck className="mx-auto h-4 w-4" />
            ) : (
              <BookmarkPlus className="mx-auto h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={updatingFavorite}
            className={`icon-action rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-60 ${isFavorite ? "!border-red-500 !bg-red-500/20 !text-red-500" : ""}`}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            aria-pressed={isFavorite}
            aria-busy={updatingFavorite}
            title={
              updatingFavorite
                ? "Updating favorites"
                : isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
            }
          >
            {updatingFavorite ? (
              <LoaderCircle className="mx-auto h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={`mx-auto h-4 w-4 ${isFavorite ? "fill-red-500" : ""}`}
              />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default memo(ContentCard);
