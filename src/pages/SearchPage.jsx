import { Search, SearchX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import usePageMetadata from "../hooks/usePageMetadata";
import ContentCard from "../components/ContentCard";
import { CardSkeleton } from "../components/common/Skeletons";
import { API } from "../constants/apiEndpoints";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const submittedQuery = (searchParams.get("q") || "").trim();
  const [query, setQuery] = useState(submittedQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const lastRequested = useRef("");
  const requestId = useRef(0);

  const updateUrl = useCallback(
    (value) => {
      const trimmedValue = value.trim();
      if (trimmedValue === submittedQuery) return;
      setSearchParams(trimmedValue ? { q: trimmedValue } : {}, { replace: true });
    },
    [setSearchParams, submittedQuery]
  );

  const submitSearch = useCallback(
    (event) => {
      event.preventDefault();
      updateUrl(query);
    },
    [query, updateUrl]
  );

// Reset the request marker so an explicit retry can re-run the same query after a failure.
  const retrySearch = useCallback(() => {
    lastRequested.current = "";
    setRetryKey((currentKey) => currentKey + 1);
  }, []);

  usePageMetadata({ title: "Search Results • MovieVerse" });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    queueMicrotask(() => setQuery(submittedQuery));
  }, [submittedQuery]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery === submittedQuery) return;

    const timer = setTimeout(() => updateUrl(query), 400);
    return () => clearTimeout(timer);
  }, [query, submittedQuery, updateUrl]);

  useEffect(() => {
    if (!submittedQuery) {
      lastRequested.current = "";
      queueMicrotask(() => {
        setResults([]);
        setError(false);
        setLoading(false);
      });
      return;
    }

    if (lastRequested.current === submittedQuery) return;

    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    lastRequested.current = submittedQuery;
    queueMicrotask(() => {
      setLoading(true);
      setError(false);
    });

    api
      .get(API.SEARCH.BASE, { params: { q: submittedQuery } })
      .then(({ data }) => {
        if (requestId.current === currentRequest) {
          setResults(data.data || []);
        }
      })
      .catch(() => {
        if (requestId.current === currentRequest) {
          setResults([]);
          setError(true);
        }
      })
      .finally(() => {
        if (requestId.current === currentRequest) {
          setLoading(false);
        }
      });
  }, [retryKey, submittedQuery]);

  const heading = submittedQuery
    ? `Showing ${results.length} ${results.length === 1 ? "result" : "results"} for`
    : "Discover titles";

  return (
    <div className="section-shell min-h-screen py-24 sm:py-28">
      <div className="max-w-3xl">
        <p className="eyebrow">Search</p>
        <h1 className="mt-2 text-4xl font-black text-theme sm:text-5xl">{heading}</h1>
        {submittedQuery && (
          <p className="mt-2 break-words text-xl font-bold text-theme sm:text-2xl">&quot;{submittedQuery}&quot;</p>
        )}

        <form role="search" onSubmit={submitSearch} className="mt-7 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="movie-search">
            Search movies, actors, directors, or genres
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="movie-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              enterKeyHint="search"
              className="cinema-input w-full py-3 pl-12 pr-4 focus-visible:ring-2 focus-visible:ring-red-500"
              placeholder="Search movies, actors, directors..."
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim()}
            className="primary-action rounded-lg px-6 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-label="Loading search results" aria-busy="true">
          {Array.from({ length: 10 }).map((_, index) => <CardSkeleton key={index} />)}
        </div>
      ) : error ? (
        <section className="cinema-panel mt-8 rounded-lg p-8 text-center sm:p-10" role="alert">
          <h2 className="text-xl font-black text-theme">Unable to load search results.</h2>
          <p className="muted-copy mt-2">Please check your connection and try again.</p>
          <button
            type="button"
            onClick={retrySearch}
            className="primary-action mt-5 rounded-lg px-5 py-2.5 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Retry
          </button>
        </section>
      ) : submittedQuery && results.length ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((item) => <ContentCard key={item._id} item={item} compact />)}
        </div>
      ) : submittedQuery ? (
        <section className="cinema-panel mt-8 rounded-lg p-8 text-center sm:p-12">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-surface/10 text-red-500">
            <SearchX className="h-10 w-10" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-black text-theme">No results found</h2>
          <p className="muted-copy mx-auto mt-2 max-w-md">
            Try a different title, actor, director, or genre.
          </p>
        </section>
      ) : (
        <section className="cinema-panel mt-8 rounded-lg p-8 text-center sm:p-12">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-surface/10 text-red-500">
            <Search className="h-10 w-10" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-black text-theme">Find your next movie</h2>
          <p className="muted-copy mx-auto mt-2 max-w-md">
            Search by title, actor, director, or genre to explore MovieVerse.
          </p>
        </section>
      )}
    </div>
  );
};

export default SearchPage;
