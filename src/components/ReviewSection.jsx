import ReviewCard from "./ReviewCard";

const ReviewSection = ({ reviews, loading, onEdit, onRefresh }) => {
  if (loading) {
    return (
      <section className="section-shell py-10">
        <div className="space-y-5">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="cinema-panel rounded-xl p-5 animate-pulse"
            >
              <div className="h-6 w-44 rounded bg-surface/10" />
              <div className="mt-4 h-4 w-full rounded bg-surface/10" />
              <div className="mt-2 h-4 w-10/12 rounded bg-surface/10" />
              <div className="mt-2 h-4 w-8/12 rounded bg-surface/10" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!reviews.length) {
    return (
      <section className="section-shell py-10">
        <div className="cinema-panel rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-theme">No Reviews Yet</h2>

          <p className="mt-3 text-muted">
            No reviews have been posted yet. Share your experience after
            watching this movie.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-10">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-theme">User Reviews</h2>

        <p className="mt-2 text-muted">{reviews.length} Review(s)</p>
      </div>

      <div className="space-y-5">
        {reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onEdit={onEdit}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </section>
  );
};

export default ReviewSection;
