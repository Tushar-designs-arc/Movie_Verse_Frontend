export const CardSkeleton = () => (
  <div className="cinema-card overflow-hidden rounded-lg">
    <div className="aspect-[2/3] animate-pulse bg-surface/10" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-surface/10" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-surface/10" />
      <div className="h-8 animate-pulse rounded bg-surface/10" />
    </div>
  </div>
);

export const RailSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
);
