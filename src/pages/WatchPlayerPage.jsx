import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import usePageMetadata from "../hooks/usePageMetadata";
import { API } from "../constants/apiEndpoints";
import { getTrailerEmbedUrl } from "../utils/trailer";


const TrailerSkeleton = () => (
  <div className="section-shell min-h-screen py-24 sm:py-28" aria-label="Loading trailer" aria-busy="true">
    <div className="h-5 w-32 animate-pulse rounded bg-surface/10" />
    <div className="mt-6 h-10 w-3/5 max-w-lg animate-pulse rounded bg-surface/10" />
    <div className="cinema-panel mt-6 aspect-video animate-pulse overflow-hidden rounded-xl bg-surface-soft" />
  </div>
);

const WatchPlayerPage = () => {
  const { slug } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);
  usePageMetadata({ title: movie?.title ? `${movie.title} \u2022 Trailer \u2022 MovieVerse` : "Watch Trailer \u2022 MovieVerse" });

  const retry = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    window.scrollTo({ top: 0, behavior: "auto" });
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
      setMovie(null);
    });

    api
      .get(API.MOVIES.DETAILS(slug), { signal: controller.signal })
      .then(({ data }) => {
        setMovie(data.data || null);
      })
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED" || controller.signal.aborted) return;
        setError(requestError.response?.status === 404 ? "not-found" : "network");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestVersion, slug]);

  const trailerUrl = movie?.trailer;
  const trailerEmbedUrl = useMemo(() => getTrailerEmbedUrl(trailerUrl), [trailerUrl]);

  if (loading) return <TrailerSkeleton />;

  if (error === "not-found" || !movie) {
    return (
      <div className="section-shell grid min-h-screen place-items-center py-24 sm:py-28">
        <section className="cinema-panel max-w-lg rounded-xl p-8 text-center sm:p-10">
          <h1 className="text-3xl font-black text-theme">Movie not found.</h1>
          <p className="muted-copy mt-3">This title may have been removed or is no longer available.</p>
          <Link
            to="/movies"
            className="primary-action mt-6 inline-flex rounded-lg px-5 py-3 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Browse movies
          </Link>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-shell grid min-h-screen place-items-center py-24 sm:py-28">
        <section className="cinema-panel max-w-lg rounded-xl p-8 text-center sm:p-10" role="alert">
          <TriangleAlert className="mx-auto h-10 w-10 text-red-400" aria-hidden="true" />
          <h1 className="mt-4 text-3xl font-black text-theme">Unable to load trailer.</h1>
          <p className="muted-copy mt-3">Please check your connection and try again.</p>
          <button
            type="button"
            onClick={retry}
            className="primary-action mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="section-shell min-h-screen py-24 sm:py-28">
      <Link
        to={`/details/${movie.slug}`}
        className="inline-flex items-center gap-2 rounded-md px-1 py-2 text-sm text-inverse transition hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to details
      </Link>

      <h1 className="mt-6 text-3xl font-black text-theme sm:text-4xl">{movie.title} trailer</h1>

      <div className="cinema-panel mt-5 aspect-video overflow-hidden rounded-xl bg-theme">
        {trailerEmbedUrl ? (
          <iframe
            src={trailerEmbedUrl}
            title={`${movie.title} trailer`}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center">
            <div>
              <h2 className="text-xl font-black text-theme">Trailer unavailable.</h2>
              <Link
                to={`/details/${movie.slug}`}
                className="secondary-action mt-4 inline-flex rounded-lg px-4 py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Back to Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPlayerPage;
