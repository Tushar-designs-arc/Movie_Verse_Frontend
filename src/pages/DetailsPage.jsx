import {
  BookmarkCheck,
  BookmarkPlus,
  Heart,
  Play,
  RefreshCw,
  Star,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import usePageMetadata from "../hooks/usePageMetadata";
import ContentRail from "../components/ContentRail";
import { RailSkeleton } from "../components/common/Skeletons";
import ReviewForm from "../components/ReviewForm";
import ReviewSection from "../components/ReviewSection";
import { API } from "../constants/apiEndpoints";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { getTrailerEmbedUrl } from "../utils/trailer";
import { getPosterUrl } from "../utils/image.js";

const DetailsPage = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const reviewController = useRef(null);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [trailerLoading, setTrailerLoading] = useState(false);
 const similarRetryController = useRef(null);
  usePageMetadata({
    title: movie?.title
      ? `${movie.title} \u2022 MovieVerse`
      : "Movie Details \u2022 MovieVerse",
    description: movie?.description,
  });

  const loadReviews = useCallback(async (movieId, signal) => {
    reviewController.current?.abort();
    const controller = signal ? null : new AbortController();
    const requestSignal = signal || controller.signal;
    if (controller) reviewController.current = controller;

    try {
      setReviewsLoading(true);
      const { data } = await api.get(API.REVIEWS.BY_MOVIE(movieId), {
        signal: requestSignal,
      });
      if (!requestSignal.aborted) setReviews(data.data || []);
    } catch (requestError) {
      if (requestError.code !== "ERR_CANCELED" && !requestSignal.aborted)
        setReviews([]);
    } finally {
      if (!requestSignal.aborted) setReviewsLoading(false);
    }
  }, []);

  const loadSimilar = useCallback(async (movieId, signal) => {
    try {
      setSimilarLoading(true);
      setSimilarError(false);
      const { data } = await api.get(API.DISCOVERY.SIMILAR(movieId), {
        signal,
      });
      if (!signal.aborted) setSimilar(data.data || []);
    } catch (requestError) {
      if (requestError.code !== "ERR_CANCELED" && !signal.aborted) {
        setSimilar([]);
        setSimilarError(true);
      }
    } finally {
      if (!signal.aborted) setSimilarLoading(false);
    }
  }, []);

  useEffect(() => {
// Abort prior detail work on navigation so late responses cannot repaint a different movie.
    const controller = new AbortController();
    window.scrollTo({ top: 0, behavior: "auto" });
    queueMicrotask(() => {
      setLoading(true);
      setError(false);
      setNotFound(false);
      setMovie(null);
    });
    queueMicrotask(() => {
      setSimilar([]);
      setSimilarError(false);
      setEditingReview(null);
      setBannerError(false);
      setPosterError(false);
    });

    api
      .get(API.MOVIES.DETAILS(slug), { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted || !data.data) return;
        setMovie(data.data);
        setTrailerLoading(Boolean(data.data.trailer));
        loadReviews(data.data._id, controller.signal);
        loadSimilar(data.data._id, controller.signal);
      })
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED" || controller.signal.aborted)
          return;
        if (requestError.response?.status === 404) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
      reviewController.current?.abort();
      similarRetryController.current?.abort();
    };
  }, [loadReviews, loadSimilar, retryKey, slug]);

  useEffect(() => {
    if (!isAuthenticated || !movie?._id) {
      queueMicrotask(() => {
        setIsFavorite(false);
        setInWishlist(false);
      });
      return undefined;
    }

// Abort prior detail work on navigation so late responses cannot repaint a different movie.
    const controller = new AbortController();
    Promise.all([
      api.get(API.FAVORITES.CHECK(movie._id), { signal: controller.signal }),
      api.get(API.WISHLIST.CHECK(movie._id), { signal: controller.signal }),
    ])
      .then(([favoriteResponse, wishlistResponse]) => {
        if (!controller.signal.aborted) {
          setIsFavorite(Boolean(favoriteResponse.data.data?.isFavorite));
          setInWishlist(Boolean(wishlistResponse.data.data?.inWishlist));
        }
      })
      .catch(() => { });

    return () => controller.abort();
  }, [isAuthenticated, movie?._id]);

  const toggleFavorite = async () => {
    if (!isAuthenticated)
      return navigate("/login", { state: { from: location } });
    const previousValue = isFavorite;
    setIsFavorite(!previousValue);
    try {
      if (previousValue) await api.delete(API.FAVORITES.BY_MOVIE(movie._id));
      else await api.post(API.FAVORITES.BY_MOVIE(movie._id));
      showToast(
        previousValue ? "Removed from favorites." : "Added to favorites.",
        "success",
      );
    } catch (requestError) {
      setIsFavorite(previousValue);
      showToast(
        requestError.response?.data?.message || "Could not update favorites.",
        "error",
      );
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated)
      return navigate("/login", { state: { from: location } });
    const previousValue = inWishlist;
    setInWishlist(!previousValue);
    try {
      if (previousValue) await api.delete(API.WISHLIST.BY_MOVIE(movie._id));
      else await api.post(API.WISHLIST.BASE, { movieId: movie._id });
      showToast(
        previousValue ? "Removed from watchlist." : "Added to watchlist.",
        "success",
      );
    } catch (requestError) {
      setInWishlist(previousValue);
      showToast(
        requestError.response?.data?.message || "Could not update watchlist.",
        "error",
      );
    }
  };

  const bannerSource =
    !bannerError && (movie?.banner?.url || movie?.banner);
  const posterSource = posterError
    ? getPosterUrl()
    : getPosterUrl(movie?.poster);
  const trustedTrailer = useMemo(
    () => getTrailerEmbedUrl(movie?.trailer),
    [movie?.trailer],
  );

  if (loading)
    return (
      <div
        className="section-shell py-24 sm:py-28"
        aria-label="Loading movie details"
        aria-busy="true"
      >
        <div className="h-[520px] animate-pulse rounded-xl bg-surface-soft" />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <RailSkeleton />
        </div>
      </div>
    );

  if (notFound)
    return (
      <div className="section-shell grid min-h-screen place-items-center py-24 sm:py-28">
        <section className="cinema-panel max-w-lg rounded-xl p-8 text-center">
          <h1 className="text-3xl font-black text-theme">Movie not found.</h1>
          <Link
            to="/movies"
            className="primary-action mt-6 inline-flex rounded-lg px-5 py-3 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Browse movies
          </Link>
        </section>
      </div>
    );

  if (error)
    return (
      <div className="section-shell grid min-h-screen place-items-center py-24 sm:py-28">
        <section
          className="cinema-panel max-w-lg rounded-xl p-8 text-center"
          role="alert"
        >
          <TriangleAlert
            className="mx-auto h-10 w-10 text-red-400"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-3xl font-black text-theme">
            Unable to load movie details.
          </h1>
          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="primary-action mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </section>
      </div>
    );

  return (
    <div className="pb-12 pt-20">
      <section
        className="relative overflow-hidden bg-surface"
        aria-labelledby="movie-title"
      >
        {bannerSource ? (
          <img
            src={bannerSource}
            onError={() => setBannerError(true)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-slate-950 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/30" />
        <div className="section-shell relative grid min-h-[560px] items-end gap-8 py-28 sm:py-32 lg:grid-cols-[200px_1fr]">
          <img
            src={posterSource}
            onError={() => setPosterError(true)}
            alt={`${movie.title} poster`}
            className="hidden aspect-[2/3] w-full rounded-xl object-cover shadow-2xl lg:block"
          />
          <div className="max-w-3xl">
            <div className="flex gap-2 text-sm">
              <span className="rounded bg-red-600 px-3 py-1 font-bold text-white">
                {movie.contentType}
              </span>
              <span className="rounded bg-black/50 px-3 py-1 font-semibold text-white backdrop-blur-md">
                <Star
                  className="mr-1 inline h-4 w-4 fill-yellow-400 text-yellow-400"
                  aria-hidden="true"
                />
                {movie.averageRating?.toFixed(1) || "—"}
              </span>
            </div>
            <h1
              id="movie-title"
              className="mt-5 text-5xl font-black text-white sm:text-6xl"
            >
              {movie.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-neutral-200">
              {movie.description}
            </p>
            <p className="mt-5 text-sm text-neutral-300">
              {movie.releaseDate
                ? new Date(movie.releaseDate).getFullYear()
                : "Upcoming"}{" "}
              • {movie.duration || "—"} min •{" "}
              {movie.certificate || "Unrated"} •{" "}
              {movie.languages?.join(", ") || "Language unavailable"}
            </p>
            <p className="mt-2 text-sm text-neutral-300">
              Director: {movie.director || "Unavailable"} • Cast:{" "}
              {movie.cast?.join(", ") || "Unavailable"}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/watch/${movie.slug}`}
                className="primary-action inline-flex items-center gap-2 rounded-md px-5 py-3 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Watch trailer
              </Link>
              <button
                type="button"
                onClick={toggleWishlist}
                className={`secondary-action rounded-md px-5 py-3 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${inWishlist ? "!border-teal-500 !bg-teal-500/25 !text-teal-400" : ""}`}
                aria-pressed={inWishlist}
              >
                {inWishlist ? (
                  <>
                    <BookmarkCheck className="mr-2 inline h-4 w-4" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="mr-2 inline h-4 w-4" />
                    Watchlist
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={toggleFavorite}
                className={`secondary-action rounded-md px-5 py-3 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${isFavorite ? "!border-red-500 !bg-red-500/25 !text-red-500" : ""}`}
                aria-pressed={isFavorite}
              >
                <Heart
                  className={`mr-2 inline h-4 w-4 ${isFavorite ? "fill-red-500" : ""}`}
                />
                {isFavorite ? "Favorited" : "Favorite"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section-shell py-10"
        aria-labelledby="trailer-heading"
      >
        <div className="cinema-panel overflow-hidden rounded-xl p-4">
          <h2
            id="trailer-heading"
            className="mb-4 text-2xl font-black text-theme"
          >
            Trailer
          </h2>
          <div className="relative aspect-video bg-theme">
            {trustedTrailer ? (
              <>
                {trailerLoading && (
                  <div
                    className="absolute inset-0 animate-pulse bg-surface-soft"
                    aria-label="Loading trailer"
                  />
                )}
                <iframe
                  src={trustedTrailer}
                  title={`${movie.title} trailer`}
                  onLoad={() => setTrailerLoading(false)}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </>
            ) : (
              <div className="grid h-full place-items-center p-6 text-center">
                <div>
                  <p className="text-theme">Trailer unavailable.</p>
                  <Link
                    to="/movies"
                    className="secondary-action mt-4 inline-flex rounded-lg px-4 py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Back to Trailer Library
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="py-2">
        <ReviewForm
          movieId={movie._id}
          review={editingReview}
          onSuccess={() => {
            setEditingReview(null);
            loadReviews(movie._id);
          }}
          onCancel={() => setEditingReview(null)}
        />
        <ReviewSection
          reviews={reviews}
          loading={reviewsLoading}
          onEdit={setEditingReview}
          onRefresh={() => loadReviews(movie._id)}
        />
      </div>

      <section className="section-shell py-8" aria-labelledby="similar-heading">
        <h2 id="similar-heading" className="sr-only">
          More like this
        </h2>
        {similarLoading ? (
          <RailSkeleton />
        ) : similarError ? (
          <div className="cinema-panel rounded-xl p-6 text-center" role="alert">
            <p className="text-theme">Unable to load similar titles.</p>
            <button
              type="button"
              onClick={() => {
                similarRetryController.current?.abort();
            // Abort prior detail work on navigation so late responses cannot repaint a different movie.
    const controller = new AbortController();
                similarRetryController.current = controller;
                loadSimilar(movie._id, controller.signal);
              }}
              className="primary-action mt-4 rounded-lg px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Retry
            </button>
          </div>
        ) : similar.length ? (
          <ContentRail title="More like this" items={similar} to="/movies" />
        ) : (
          <div className="cinema-panel rounded-xl p-6 text-center">
            <p className="muted-copy">No similar titles found.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DetailsPage;
