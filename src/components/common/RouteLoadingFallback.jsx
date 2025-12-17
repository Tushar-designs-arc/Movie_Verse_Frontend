import { LoaderCircle } from "lucide-react";

const RouteLoadingFallback = () => (
  <div
    className="section-shell grid min-h-[60vh] place-items-center py-16"
    role="status"
    aria-live="polite"
    aria-label="Loading page"
  >
    <div className="cinema-panel flex w-full max-w-sm flex-col items-center rounded-xl p-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-red-500/10 text-red-400">
        <LoaderCircle className="h-7 w-7 animate-spin" aria-hidden="true" />
      </div>
      <div className="mt-5 h-5 w-36 animate-pulse rounded bg-surface-soft" />
      <div className="mt-3 h-3 w-52 animate-pulse rounded bg-surface-soft" />
      <span className="sr-only">Loading page</span>
    </div>
  </div>
);

export default RouteLoadingFallback;
