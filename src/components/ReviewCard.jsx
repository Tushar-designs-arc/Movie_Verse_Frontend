import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Flag,
  HeartHandshake,
  Pencil,
  Star,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import api from "../api/client";
import { API } from "../constants/apiEndpoints";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/date.js";

const ReviewCard = ({ review, onEdit, onRefresh }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [activeAction, setActiveAction] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportReasons, setReportReasons] = useState([]);
  const [reportReasonsLoading, setReportReasonsLoading] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const reportButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const owner = user?._id === review.user?._id;

  const closeReportDialog = useCallback(() => {
    setReportModalOpen(false);
    requestAnimationFrame(() => reportButtonRef.current?.focus());
  }, []);

  const openReportDialog = () => {
    if (!isAuthenticated) {
      showToast("Please sign in first.", "info");
      return;
    }
    setReportReasonsLoading(true);
    setReportReasons([]);
    setReportReason("");
    setReportModalOpen(true);
  };

  useEffect(() => {
    if (!reportModalOpen) return undefined;
    dialogRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeReportDialog();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reportModalOpen, closeReportDialog]);
  useEffect(() => {
    if (!reportModalOpen) return undefined;

    const controller = new AbortController();

    api
      .get(API.REVIEWS.REPORT_REASONS, { signal: controller.signal })
      .then(({ data }) => {
        const options = Array.isArray(data.data) ? data.data : [];
        setReportReasons(options);
        setReportReason(options[0]?.value || "");
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setReportReasons([]);
          showToast(
            error.response?.data?.message || "Unable to load report reasons.",
            "error",
          );
        }
      })
      .finally(() => setReportReasonsLoading(false));

    return () => controller.abort();
  }, [reportModalOpen, showToast]);
  const act = async (action, fn, fallback) => {
    if (!isAuthenticated) {
      showToast("Please sign in first.", "info");
      return;
    }
    try {
      setActiveAction(action);
      await fn();
      onRefresh?.();
    } catch (error) {
      showToast(error.response?.data?.errors?.[0]?.message || error.response?.data?.message || fallback, "error");
    } finally {
      setActiveAction(null);
    }
  };
  const submitReport = async (event) => {
    event.preventDefault();
    if (!reportReason) {
      showToast("Select a report reason before submitting.", "error");
      return;
    }
    await act(
      "report",
      async () => {
        await api.post(API.REVIEWS.REPORT(review._id), {
          reason: reportReason,
        });
        setHasReported(true);
        closeReportDialog();
        showToast("Review reported.", "success");
      },
      "Could not report review.",
    );
  };
  const withdrawReport = () =>
    act(
      "report",
      async () => {
        await api.delete(API.REVIEWS.WITHDRAW_REPORT(review._id));
        setHasReported(false);
        showToast("Report withdrawn.", "success");
      },
      "Could not withdraw report.",
    );
  const authorName =
    review.user?.fullName || review.user?.username || "MovieVerse member";

  return (
    <article className="cinema-panel rounded-xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-theme">{review.title}</h3>
          <p className="mt-1 text-sm text-muted">
            {review.user?.username ? (
              <Link
                to={`/user/${review.user.username}`}
                className="font-medium text-theme transition hover:text-red-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {authorName}
              </Link>
            ) : (
              authorName
            )}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-lg border border-theme bg-surface-soft px-3 py-1.5 text-sm font-bold text-theme">
          <Star
            className="h-4 w-4 fill-yellow-400 text-yellow-400"
            aria-hidden="true"
          />
          {review.rating}
        </span>
      </div>
      {review.spoilers && (
        <p className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/15 px-3 py-2 text-xs font-bold text-yellow-500">
          Spoiler warning
        </p>
      )}
      <p className="mt-4 whitespace-pre-line leading-7 text-theme">
        {review.review}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={activeAction === "like" || owner}
          onClick={() =>
            act(
              "like",
              () => api.post(API.REVIEWS.LIKE(review._id)),
              "Could not like review.",
            )
          }
          className="secondary-action inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-40"
        >
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
          {review.likes || 0}
        </button>
        <button
          type="button"
          disabled={activeAction === "helpful" || owner}
          onClick={() =>
            act(
              "helpful",
              () => api.post(API.REVIEWS.HELPFUL(review._id)),
              "Could not mark helpful.",
            )
          }
          className="secondary-action inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-40"
        >
          <HeartHandshake
            className="h-4 w-4 text-accent-2"
            aria-hidden="true"
          />
          Helpful {review.helpfulCount || 0}
        </button>
        {!owner &&
          (hasReported ? (
            <button
              type="button"
              disabled={activeAction === "report"}
              onClick={withdrawReport}
              className="secondary-action inline-flex items-center gap-2 rounded-lg border-yellow-500/30 px-3 py-2 text-sm font-bold text-yellow-500 disabled:opacity-40"
            >
              <Flag className="h-4 w-4 fill-yellow-500" aria-hidden="true" />
              Reported (Withdraw)
            </button>
          ) : (
            <button
              ref={reportButtonRef}
              type="button"
              disabled={activeAction === "report"}
              onClick={openReportDialog}

              className="secondary-action inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-40"
            >
              <Flag className="h-4 w-4" aria-hidden="true" />
              Report
            </button>
          ))}
        {owner && (
          <>
            <button
              type="button"
              onClick={() => onEdit?.(review)}
              className="secondary-action inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              disabled={activeAction === "delete"}
              onClick={() => {
                if (window.confirm("Delete this review?"))
                  act(
                    "delete",
                    () => api.delete(API.REVIEWS.DELETE(review._id)),
                    "Could not delete review.",
                  );
              }}
              className="secondary-action inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-500/10 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </>
        )}
      </div>
      <p className="mt-5 text-xs text-muted">
        {formatDate(review.createdAt)}
        {review.isEdited ? " · Edited" : ""}
      </p>
      {reportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-review-title"
            tabIndex="-1"
            className="cinema-panel w-full max-w-md rounded-xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-theme pb-4">
              <h3
                id="report-review-title"
                className="text-lg font-black text-theme"
              >
                Report Review
              </h3>
              <button
                type="button"
                onClick={closeReportDialog}
                className="icon-action rounded-lg p-1"
                aria-label="Close report dialog"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={submitReport} className="mt-4 space-y-4">
              <p className="text-sm text-muted">
                Select a reason for reporting this review by @
                {review.user?.username || "user"}:
              </p>
              <label
                htmlFor={`report-reason-${review._id}`}
                className="sr-only"
              >
                Report reason
              </label>
              <select
                id={`report-reason-${review._id}`}
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
                disabled={reportReasonsLoading || reportReasons.length === 0}
                className="cinema-input p-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
              >
                {reportReasonsLoading ? (
                  <option value="">Loading report reasons…</option>
                ) : reportReasons.length ? (
                  reportReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))
                ) : (
                  <option value="">No report reasons are available.</option>
                )}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeReportDialog}
                  className="secondary-action rounded-lg px-4 py-2 text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activeAction === "report" || reportReasonsLoading || !reportReason}
                  className="primary-action rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-60"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
};

export default ReviewCard;
