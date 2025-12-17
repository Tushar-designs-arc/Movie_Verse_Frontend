import {
  Calendar,
  MessageSquare,
  RefreshCw,
  Star,
  TriangleAlert,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { isCancellationError } from "../utils/apiError";
import usePageMetadata from "../hooks/usePageMetadata";
import { formatLongDate } from "../utils/date.js";

const avatarFallback = (name) =>
  `https://ui-avatars.com/api/?background=E50914&color=fff&bold=true&name=${encodeURIComponent(name || "MovieVerse member")}`;

const ReviewsSkeleton = () => (
  <div
    className="mt-6 grid gap-4 sm:grid-cols-2"
    aria-busy="true"
    aria-label="Loading reviews"
  >
    <div className="h-40 animate-pulse rounded-xl bg-surface-soft" />
    <div className="h-40 animate-pulse rounded-xl bg-surface-soft" />
  </div>
);

const ProfileSkeleton = () => (
  <main
    className="section-shell min-h-screen py-24 sm:py-28"
    aria-busy="true"
    aria-label="Loading public profile"
  >
    <section
      className="cinema-panel animate-pulse rounded-xl p-6 sm:p-8"
      aria-label="Loading profile details"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-xl bg-surface-soft" />
          <div className="space-y-3">
            <div className="h-7 w-48 rounded bg-surface-soft" />
            <div className="h-4 w-28 rounded bg-surface-soft" />
          </div>
        </div>
        <div className="h-10 w-32 rounded bg-surface-soft" />
      </div>
      <div className="mt-6 h-16 rounded bg-surface-soft" />
    </section>
    <section className="mt-10" aria-label="Loading reviews">
      <ReviewsSkeleton />
    </section>
  </main>
);

const Avatar = memo(({ name, src }) => {
  const fallback = useMemo(() => avatarFallback(name), [name]);
  const [imageSource, setImageSource] = useState(src || fallback);
  const [showInitial, setShowInitial] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setImageSource(src || fallback);
      setShowInitial(false);
    });
  }, [fallback, src]);

  if (showInitial) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-red-600 text-2xl font-black text-white"
        role="img"
        aria-label={`${name} avatar`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={imageSource}
      alt={`${name} avatar`}
      className="h-full w-full object-cover"
      onError={() =>
        imageSource === fallback
          ? setShowInitial(true)
          : setImageSource(fallback)
      }
    />
  );
});

Avatar.displayName = "Avatar";

const PublicProfilePage = () => {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(false);
  const [profileRetryKey, setProfileRetryKey] = useState(0);
  const [reviewsRetryKey, setReviewsRetryKey] = useState(0);

  const retryProfile = useCallback(
    () => setProfileRetryKey((value) => value + 1),
    [],
  );
  const retryReviews = useCallback(
    () => setReviewsRetryKey((value) => value + 1),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    window.scrollTo({ top: 0, behavior: "auto" });
    queueMicrotask(() => {
      setLoading(true);
      setError(false);
      setNotFound(false);
      setData(null);
      setReviews([]);
      setReviewsError(false);
    });

    api
      .get(`/users/${username}`, { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) setData(response.data.data || null);
      })
      .catch((requestError) => {
        if (controller.signal.aborted || isCancellationError(requestError))
          return;
        if (requestError.response?.status === 404) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [profileRetryKey, username]);

  useEffect(() => {
    if (!data) return undefined;
    const controller = new AbortController();
    queueMicrotask(() => {
      setReviewsLoading(true);
      setReviewsError(false);
    });

    api
      .get(`/users/${username}/reviews`, {
        params: { page: 1, limit: 6 },
        signal: controller.signal,
      })
      .then((response) => {
        if (!controller.signal.aborted) setReviews(response.data.data || []);
      })
      .catch((requestError) => {
        if (controller.signal.aborted || isCancellationError(requestError))
          return;
        setReviews([]);
        setReviewsError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setReviewsLoading(false);
      });

    return () => controller.abort();
  }, [data, reviewsRetryKey, username]);

  usePageMetadata({
    title: data?.fullName
      ? `${data.fullName} \u2022 MovieVerse`
      : "Profile \u2022 MovieVerse",
    description: data?.bio,
  });

  const name = data?.fullName || data?.username || "MovieVerse member";
  const firstName = name.trim().split(/\s+/)[0];
  const joinedDate =
    data?.createdAt && !Number.isNaN(new Date(data.createdAt).getTime())
      ? formatLongDate(data.createdAt)
      : null;

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (notFound) {
    return (
      <main className="section-shell grid min-h-screen place-items-center py-24 sm:py-28">
        <section className="cinema-panel max-w-lg rounded-xl p-8 text-center">
          <h1 className="text-3xl font-black text-theme">User not found.</h1>
          <p className="muted-copy mt-2">
            The requested public profile does not exist.
          </p>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main
        className="section-shell grid min-h-screen place-items-center py-24 sm:py-28"
        role="alert"
      >
        <section className="cinema-panel max-w-lg rounded-xl p-8 text-center">
          <TriangleAlert
            className="mx-auto h-10 w-10 text-red-400"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-3xl font-black text-theme">
            Unable to load profile.
          </h1>
          <button
            type="button"
            onClick={retryProfile}
            className="primary-action mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Retry loading profile"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="section-shell min-h-screen py-24 sm:py-28">
      <section
        className="cinema-panel rounded-xl p-6 sm:p-8"
        aria-labelledby="profile-name"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-theme bg-surface-soft">
              <Avatar name={name} src={data.avatar?.url} />
            </div>
            <div>
              <p className="eyebrow">Community member</p>
              <h1
                id="profile-name"
                className="mt-1 text-3xl font-black text-theme"
              >
                {name}
              </h1>
              <p className="muted-copy">@{data.username}</p>
            </div>
          </div>
          <div
            className="cinema-card rounded-lg px-4 py-2 text-sm text-muted"
            aria-label="Profile statistics"
          >
            <MessageSquare
              className="mr-2 inline h-4 w-4 text-accent-2"
              aria-hidden="true"
            />
            {Number.isFinite(data.reviewCount) ? (
              <>
                <strong className="text-theme">{data.reviewCount}</strong>{" "}
                Reviews
              </>
            ) : (
              <>
                <span>Statistics unavailable.</span>
                <button
                  type="button"
                  onClick={retryProfile}
                  className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-label="Retry loading statistics"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
        {data.bio && (
          <p className="mt-6 border-t border-theme pt-6 text-sm leading-relaxed text-theme">
            {data.bio}
          </p>
        )}
        {data.favoriteGenres?.length > 0 && (
          <div
            className="mt-4 flex flex-wrap gap-2"
            aria-label="Favorite genres"
          >
            {data.favoriteGenres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-theme px-3 py-1 text-xs text-theme"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
        {joinedDate && (
          <p className="mt-4 text-sm text-muted">
            <Calendar className="mr-1 inline h-4 w-4" aria-hidden="true" />
            Joined {joinedDate}
          </p>
        )}
      </section>

      <section className="mt-10" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-2xl font-black text-theme">
          Reviews by {firstName}
        </h2>
        {reviewsLoading ? (
          <ReviewsSkeleton />
        ) : reviewsError ? (
          <div
            className="cinema-panel mt-6 rounded-xl p-8 text-center"
            role="alert"
          >
            <p className="text-theme">Unable to load reviews.</p>
            <button
              type="button"
              onClick={retryReviews}
              className="primary-action mt-4 rounded-lg px-4 py-2 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Retry loading reviews"
            >
              Retry
            </button>
          </div>
        ) : reviews.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <article
                key={review._id}
                className="cinema-panel flex flex-col rounded-xl p-5"
              >
                <Link
                  to={`/details/${review.movie?.slug}`}
                  className="font-bold text-theme transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-label={`View ${review.movie?.title || "movie"}`}
                >
                  {review.movie?.title || "Movie"}
                </Link>
                {review.title && (
                  <h3 className="mt-2 text-sm font-semibold text-theme">
                    {review.title}
                  </h3>
                )}
                {review.review && (
                  <p className="mt-2 line-clamp-4 text-sm text-muted">
                    {review.review}
                  </p>
                )}
                {review.rating !== null && review.rating !== undefined && (
                  <p className="mt-4 text-sm text-theme">
                    <Star
                      className="mr-1 inline h-4 w-4 fill-yellow-400 text-yellow-400"
                      aria-hidden="true"
                    />
                    {Number(review.rating).toFixed(1)}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="cinema-panel mt-6 rounded-xl p-8 text-center">
            <p className="text-theme">No reviews yet.</p>
            <p className="muted-copy mt-2">
              This member hasn&apos;t shared any reviews.
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default PublicProfilePage;
