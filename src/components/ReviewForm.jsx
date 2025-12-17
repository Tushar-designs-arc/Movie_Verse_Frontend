import { useState, useEffect } from "react";
import { Star } from "lucide-react";

import api from "../api/client";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { API } from "../constants/apiEndpoints";

const ReviewForm = ({ movieId, review = null, onSuccess, onCancel }) => {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();

    const [rating, setRating] = useState(0);

    const [hoverRating, setHoverRating] = useState(0);

    const [form, setForm] = useState({
        title: "",
        review: "",
        spoilers: false,
    });

    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const submitReview = async (event) => {
        event.preventDefault();

        if (!isAuthenticated) {
            showToast(
                "Please login to write a review.",
                "info"
            );

            return;
        }

        if (rating === 0) {
            showToast(
                "Please select a rating.",
                "error"
            );

            return;
        }

        if (form.title.trim().length < 3) {
            showToast(
                "Review title must be at least 3 characters.",
                "error"
            );
            return;
        }

        if (form.review.trim().length < 10) {
            showToast(
                "Review must be at least 10 characters.",
                "error"
            );
            return;
        }

        try {
            setSubmitting(true);

            if (review) {
                await api.put(API.REVIEWS.UPDATE(review._id), {
                    rating,
                    title: form.title.trim(),
                    review: form.review.trim(),
                    spoilers: form.spoilers
                });
            } else {
                await api.post(API.REVIEWS.CREATE, {
                    movie: movieId,
                    rating,
                    title: form.title.trim(),
                    review: form.review.trim(),
                    spoilers: form.spoilers
                });
            }

            showToast(
                review
                    ? "Review updated successfully."
                    : "Review submitted successfully.",
                "success"
            );

            if (!review) {
                setRating(0);

                setHoverRating(0);

                setForm({
                    title: "",
                    review: "",
                    spoilers: false
                });
            }

            onSuccess?.();

        } catch (error) {

            showToast(
                error?.response?.data?.message ||
                "Unable to submit review.",
                "error"
            );

        } finally {

            setSubmitting(false);

        }
    };

    useEffect(() => {

        if (!review) return;

        queueMicrotask(() => {
            setRating(review.rating);
            setForm({
                title: review.title,
                review: review.review,
                spoilers: review.spoilers,
            });
        });

    }, [review]);

    return (
        <section className="section-shell py-10">

            <div className="cinema-panel rounded-xl p-6">

                <h2 className="text-2xl font-black text-theme">
                    {review ? "Edit Review" : "Write a Review"}
                </h2>

                <p className="mt-2 text-muted">
                    Share your opinion about this movie.
                </p>

                <form
                    onSubmit={submitReview}
                    className="mt-6 space-y-5"
                >

                    <div>

                        <label className="mb-3 block text-sm font-bold text-theme">
                            Rating
                        </label>

                        <div className="flex gap-2">

                            {[1, 2, 3, 4, 5].map((star) => (

                                <button
                                    key={star}
                                    type="button"
                                    onClick={() =>
                                        setRating(star)
                                    }
                                    onMouseEnter={() =>
                                        setHoverRating(star)
                                    }
                                    onMouseLeave={() =>
                                        setHoverRating(0)
                                    }
                                >
                                    <Star
                                        className={`h-8 w-8 transition ${(
                                            hoverRating ||
                                            rating
                                        ) >= star
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-neutral-500"
                                            }`}
                                    />
                                </button>

                            ))}

                        </div>

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-bold text-theme">
                            Review Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            maxLength={100}
                            className="cinema-input px-4 py-3"
                            placeholder="Amazing movie..."
                            required
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-bold text-theme">
                            Review
                        </label>

                        <textarea
                            rows={6}
                            name="review"
                            value={form.review}
                            onChange={handleChange}
                            maxLength={2000}
                            className="cinema-input resize-none px-4 py-3"
                            placeholder="Write your review..."
                            required
                        />

                    </div>

                    <label className="flex items-center gap-3">

                        <input
                            type="checkbox"
                            name="spoilers"
                            checked={form.spoilers}
                            onChange={handleChange}
                        />

                        <span className="text-sm text-inverse">
                            This review contains spoilers.
                        </span>

                    </label>

                    <div className="flex gap-3">

                        <button

                            type="submit"

                            disabled={submitting}

                            className="primary-action rounded-lg px-6 py-3 font-bold"

                        >

                            {submitting

                                ? "Submitting..."

                                : review

                                    ? "Update Review"

                                    : "Submit Review"

                            }

                        </button>

                        {review && (

                            <button

                                type="button"

                                onClick={onCancel}

                                className="secondary-action rounded-lg px-6 py-3"

                            >

                                Cancel

                            </button>

                        )}

                    </div>

                </form>

            </div>

        </section>
    );
};

export default ReviewForm;