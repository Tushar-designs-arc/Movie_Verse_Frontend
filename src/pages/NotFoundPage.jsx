import { Clapperboard, Home, Search } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePageMetadata from "../hooks/usePageMetadata";

const NotFoundPage = () => {
  const navigate = useNavigate();
  usePageMetadata({ title: "404 \u2022 MovieVerse" });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <main
      className="section-shell grid min-h-screen place-items-center px-4 py-24 sm:py-28"
      aria-labelledby="not-found-heading"
    >
      <section className="cinema-panel w-full max-w-xl rounded-2xl p-6 text-center shadow-xl transition duration-300 motion-reduce:transition-none sm:p-10">
        <div
          className="mx-auto grid h-20 w-20 place-items-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 transition duration-300 hover:scale-105 motion-reduce:transform-none"
          aria-hidden="true"
        >
          <Clapperboard className="h-10 w-10" />
        </div>
        <p className="mt-6 text-6xl font-black tracking-tight text-red-500 sm:text-8xl">
          404
        </p>
        <h1
          id="not-found-heading"
          className="mt-3 text-3xl font-black text-theme sm:text-4xl"
        >
          Page not found
        </h1>
        <p className="muted-copy mx-auto mt-4 max-w-md leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="primary-action inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 motion-reduce:transform-none"
            aria-label="Go to MovieVerse home page"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go Home
          </button>
          <button
            type="button"
            onClick={() => navigate("/movies")}
            className="secondary-action inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 motion-reduce:transform-none"
            aria-label="Browse movies"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Browse Movies
          </button>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
