import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import usePageMetadata from "../hooks/usePageMetadata";
import ContentCard from "../components/ContentCard";
import { CardSkeleton } from "../components/common/Skeletons";
import { API } from "../constants/apiEndpoints";
import { genreOptions } from "../utils/content";

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const query = (searchParams.get("q") || "").trim();
  const genre = searchParams.get("genre") || "";
  const language = searchParams.get("language") || "";
  const year = searchParams.get("year") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "newest";
  const [search, setSearch] = useState(query);
  const qualifier = genre || language || year || query;
  usePageMetadata({ title: qualifier ? `${qualifier} Movies \u2022 MovieVerse` : "Movies \u2022 MovieVerse" });

  const updateFilters = useCallback(
    (changes, resetPage = true) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        Object.entries(changes).forEach(([key, value]) => {
          if (value) next.set(key, value);
          else next.delete(key);
        });
        if (resetPage) next.delete("page");
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const requestParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: query || undefined,
      genre: genre || undefined,
      language: language || undefined,
      year: year || undefined,
      status: status || undefined,
      sort,
    }),
    [genre, language, page, query, sort, status, year]
  );

  useEffect(() => {
    queueMicrotask(() => setSearch(query));
  }, [query]);

  useEffect(() => {
    if (search.trim() === query) return;
    const timer = setTimeout(() => updateFilters({ q: search.trim() }), 400);
    return () => clearTimeout(timer);
  }, [query, search, updateFilters]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      setLoading(true);
      setError(false);
    });

    api
      .get(API.MOVIES.LIST, { params: requestParams, signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setItems(data.data || []);
          setMeta(data.meta || { page: 1, totalPages: 1, total: 0 });
        }
      })
      .catch((requestError) => {
        if (requestError.code !== "ERR_CANCELED" && !controller.signal.aborted) {
          setItems([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestParams, retryKey]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const hasFilters = Boolean(query || genre || language || year || status || sort !== "newest" || page > 1);

  return (
    <div className="section-shell min-h-screen py-24 sm:py-28">
      <div className="mb-8">
        <p className="eyebrow">Movie catalogue</p>
        <h1 className="mt-2 text-4xl font-black text-theme sm:text-5xl">Find your next story</h1>
        <p className="muted-copy mt-3">{meta.total} published titles available.</p>
      </div>

      <section className="cinema-panel mb-8 rounded-lg p-4 sm:p-5" aria-label="Movie filters">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="relative md:col-span-2 xl:col-span-2">
            <span className="sr-only">Search movies</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the catalogue" className="cinema-input py-3 pl-10 pr-3 text-sm" />
          </label>
          <label><span className="sr-only">Genre</span><select value={genre} onChange={(event) => updateFilters({ genre: event.target.value })} className="cinema-input px-3 py-3 text-sm" aria-label="Filter by genre"><option value="">All genres</option>{genreOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label><span className="sr-only">Language</span><input value={language} onChange={(event) => updateFilters({ language: event.target.value })} placeholder="Language" className="cinema-input px-3 py-3 text-sm" aria-label="Filter by language" /></label>
          <label><span className="sr-only">Year</span><input value={year} onChange={(event) => updateFilters({ year: event.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="Year" inputMode="numeric" className="cinema-input px-3 py-3 text-sm" aria-label="Filter by release year" /></label>
          <label><span className="sr-only">Sort movies</span><select value={sort} onChange={(event) => updateFilters({ sort: event.target.value })} className="cinema-input px-3 py-3 text-sm" aria-label="Sort movies"><option value="newest">Recently added</option><option value="rating">Top rated</option><option value="views">Most viewed</option><option value="oldest">Oldest</option></select></label>
          <label><span className="sr-only">Release status</span><select value={status} onChange={(event) => updateFilters({ status: event.target.value })} className="cinema-input px-3 py-3 text-sm" aria-label="Filter by release status"><option value="">All status</option><option value="released">Released</option><option value="upcoming">Upcoming</option></select></label>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4 sm:gap-5" aria-label="Loading movies" aria-busy="true">{Array.from({ length: 12 }).map((_, index) => <CardSkeleton key={index} />)}</div>
      ) : error ? (
        <section className="cinema-panel rounded-lg p-8 text-center sm:p-10" role="alert"><h2 className="text-2xl font-black text-theme">Unable to load movies.</h2><button type="button" onClick={() => setRetryKey((value) => value + 1)} className="primary-action mt-5 rounded-lg px-5 py-2.5 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">Retry</button></section>
      ) : items.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4 sm:gap-5">{items.map((item) => <ContentCard key={item._id} item={item} />)}</div>
      ) : (
        <section className="cinema-panel rounded-lg p-8 text-center sm:p-10"><h2 className="text-2xl font-black text-theme">No movies found.</h2><p className="muted-copy mt-2">Try changing your search or filters.</p>{hasFilters && <button type="button" onClick={resetFilters} className="secondary-action mt-5 rounded-lg px-5 py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">Reset Filters</button>}</section>
      )}

      <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Movie pagination">
        <button type="button" disabled={page <= 1 || loading} onClick={() => updateFilters({ page: String(page - 1) }, false)} className="secondary-action rounded-md px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label="Previous page">Previous</button>
        <span className="muted-copy text-sm" aria-live="polite">Page {meta.page} of {meta.totalPages}</span>
        <button type="button" disabled={page >= meta.totalPages || loading} onClick={() => updateFilters({ page: String(page + 1) }, false)} className="secondary-action rounded-md px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label="Next page">Next</button>
      </nav>
    </div>
  );
};

export default CatalogPage;

