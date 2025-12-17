import { BarChart3, Film, Flag, Plus, RefreshCw, Star, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import { API } from "../constants/apiEndpoints";
import { useToast } from "../context/ToastContext";
import { formatNumber } from "../utils/formatters.js";

const emptyMovie = {
  title: "",
  description: "",
  releaseDate: "",
  duration: "",
  contentType: "movie",
  genres: "Drama",
  languages: "Hindi",
  country: "India",
  certificate: "UA",
  director: "",
  cast: "",
  productionCompanies: "",
  trailer: "",
  status: "released",
  publishStatus: "published",
  isFeatured: false,
  poster: null,
  banner: null,
};

const format = formatNumber;

// Debounce helper
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const AdminDashboardPage = () => {
  const { showToast } = useToast();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [movie, setMovie] = useState(emptyMovie);
  const [saving, setSaving] = useState(false);

  // Overview
  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, recentRes, analyticsRes] = await Promise.all([
        api.get(API.ADMIN.STATS),
        api.get(API.ADMIN.RECENT),
        api.get(API.ADMIN.ANALYTICS),
      ]);
      setStats(statsRes.data.data);
      setRecent(recentRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (e) {
      showToast(e.response?.data?.message || "Could not load dashboard.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Users
  const loadUsers = useCallback(async () => {
    try {
      const { data } = await api.get(API.ADMIN.USERS, {
        params: { search: debouncedSearch || undefined, limit: 30 },
      });
      setUsers(data.data || []);
    } catch (e) {
      showToast(e.response?.data?.message || "Could not load users.", "error");
    }
  }, [debouncedSearch, showToast]);

  // Reports
  const loadReports = useCallback(async () => {
    try {
      const { data } = await api.get(API.ADMIN.REPORTED_REVIEWS, {
        params: { limit: 30, reportStatus: "open" },
      });
      setReports(data.data || []);
    } catch (e) {
      showToast(e.response?.data?.message || "Could not load reports.", "error");
    }
  }, [showToast]);

  useEffect(() => {
    void Promise.resolve().then(loadOverview);
  }, [loadOverview]);

  useEffect(() => {
    if (tab === "users") void Promise.resolve().then(loadUsers);
    if (tab === "reports") void Promise.resolve().then(loadReports);
  }, [tab, loadUsers, loadReports]);

  // User status
  const setUserStatus = async (id, isActive) => {
    if (!window.confirm(`Are you sure you want to ${isActive ? "restore" : "suspend"} this user?`))
      return;
    try {
      await api.put(API.ADMIN.USER_STATUS(id), { isActive });
      showToast(isActive ? "User restored." : "User suspended.", "success");
      loadUsers();
    } catch (e) {
      showToast(e.response?.data?.message || "Could not update user.", "error");
    }
  };

  // Moderate review
  const moderate = async (id, status) => {
    try {
      await api.put(API.ADMIN.REVIEW_STATUS(id), { status });
      showToast(`Review ${status}.`, "success");
      loadReports();
      loadOverview();
    } catch (e) {
      showToast(e.response?.data?.message || "Could not update review.", "error");
    }
  };

  // Create movie
  const createMovie = async (e) => {
    e.preventDefault();
    if (!movie.poster || !movie.banner) {
      showToast("Poster and banner images are required.", "error");
      return;
    }
    try {
      setSaving(true);
      const body = new FormData();
      [
        "title",
        "description",
        "releaseDate",
        "duration",
        "contentType",
        "country",
        "certificate",
        "director",
        "trailer",
        "status",
        "publishStatus",
        "isFeatured",
      ].forEach((key) => body.append(key, movie[key]));

      ["genres", "languages", "cast", "productionCompanies"].forEach((key) => {
        const val = movie[key];
        if (typeof val === "string") {
          const arr = val.split(",").map((x) => x.trim()).filter(Boolean);
          body.append(key, JSON.stringify(arr));
        } else {
          body.append(key, JSON.stringify(val));
        }
      });

      body.append("poster", movie.poster);
      body.append("banner", movie.banner);

      await api.post(API.MOVIES.LIST, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Movie created successfully.", "success");
      setMovie(emptyMovie);
      loadOverview();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not create movie.", "error");
    } finally {
      setSaving(false);
    }
  };

  const cards = [
    { label: "Users", value: stats?.users?.total, icon: Users },
    { label: "Movies", value: stats?.movies?.total, icon: Film },
    { label: "Reviews", value: stats?.reviews?.total, icon: Star },
    { label: "Open reports", value: stats?.reports?.open, icon: Flag },
  ];

  return (
    <div className="section-shell min-h-screen py-24 sm:py-28">
      <section className="cinema-panel overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Administration</p>
              <h1 className="mt-1 text-3xl font-black text-theme sm:text-4xl">
                MovieVerse control room
              </h1>
              <p className="muted-copy mt-2 text-sm">
                Manage content quality, users, and community safety.
              </p>
            </div>
            <button
              onClick={loadOverview}
              className="secondary-action inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {[
              ["overview", "Overview", BarChart3],
              ["users", "Users", Users],
              ["reports", "Reports", Flag],
              ["create", "Add movie", Plus],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold ${
                  tab === id ? "primary-action" : "secondary-action"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {tab === "overview" && (
            <>
              {loading ? (
                <p className="muted-copy">Loading dashboard…</p>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(({ label, value, icon: Icon }) => (
                      <div key={label} className="cinema-card rounded-xl p-5">
                        <Icon className="h-5 w-5 text-red-400" />
                        <p className="mt-6 text-3xl font-black text-theme">{format(value)}</p>
                        <p className="muted-copy mt-1 text-sm">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <section>
                      <h2 className="text-xl font-black text-theme">Recent activity</h2>
                      <div className="mt-3 space-y-2">
                        {[...(recent?.movies || []), ...(recent?.reviews || [])]
                          .slice(0, 6)
                          .map((item, index) => (
                            <div
                              key={item._id || index}
                              className="cinema-card flex items-center justify-between rounded-lg p-3"
                            >
                              <span className="line-clamp-1 text-sm font-bold text-theme">
                                {item.title || item.movie?.title || "New review"}
                              </span>
                              <span className="text-xs text-neutral-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </section>
                    <section>
                      <h2 className="text-xl font-black text-theme">Top performers</h2>
                      <div className="mt-3 space-y-2">
                        {(analytics?.highestRatedMovies || []).map((item) => (
                          <div
                            key={item._id}
                            className="cinema-card flex items-center justify-between rounded-lg p-3"
                          >
                            <span className="text-sm font-bold text-theme">{item.title}</span>
                            <span className="flex items-center gap-1 text-sm text-yellow-300">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              {item.averageRating?.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              )}
            </>
          )}

          {tab === "users" && (
            <section>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="cinema-input px-3 py-2.5"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, username, email"
                />
                <button onClick={loadUsers} className="primary-action rounded-lg px-4 py-2.5 font-bold">
                  Search
                </button>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-muted">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Verified</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item._id} className="border-t border-white/10">
                        <td className="p-3">
                          <p className="font-bold text-theme">{item.fullName}</p>
                          <p className="text-neutral-500">@{item.username}</p>
                        </td>
                        <td className="p-3">{item.role}</td>
                        <td className="p-3">{item.isVerified ? "Yes" : "No"}</td>
                        <td className="p-3">{item.isActive ? "Active" : "Suspended"}</td>
                        <td className="p-3">
                          <button
                            onClick={() => setUserStatus(item._id, !item.isActive)}
                            className="secondary-action rounded-lg px-3 py-2"
                          >
                            {item.isActive ? "Suspend" : "Restore"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "reports" && (
            <section>
              <h2 className="text-xl font-black text-theme">Open reported reviews</h2>
              <div className="mt-5 space-y-4">
                {reports.length ? (
                  reports.map((report) => (
                    <article key={report.reviewId} className="cinema-card rounded-xl p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                        <div>
                          <p className="font-bold text-theme">{report.title}</p>
                          <p className="mt-1 text-sm text-muted">
                            {report.movie?.title} · by @{report.author?.username}
                          </p>
                          <p className="mt-3 text-sm text-inverse">{report.review}</p>
                          <p className="mt-3 text-xs text-red-300">
                            {report.reportCount} report(s):{" "}
                            {report.reasonSummary?.map((x) => x.reason).join(", ")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => moderate(report.reviewId, "hidden")}
                            className="primary-action h-fit rounded-lg px-3 py-2 text-sm"
                          >
                            Hide
                          </button>
                          <button
                            onClick={() => moderate(report.reviewId, "published")}
                            className="secondary-action h-fit rounded-lg px-3 py-2 text-sm"
                          >
                            Keep
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="muted-copy">No open reports.</p>
                )}
              </div>
            </section>
          )}

          {tab === "create" && (
            <form onSubmit={createMovie} className="max-w-4xl">
              <h2 className="text-xl font-black text-theme">Add a movie</h2>
              <p className="muted-copy mt-1 text-sm">
                Both poster and banner images are required by the backend.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["title", "Title"],
                  ["releaseDate", "Release date", "date"],
                  ["duration", "Duration (minutes)", "number"],
                  ["country", "Country"],
                  ["director", "Director"],
                  ["genres", "Genres (comma separated)"],
                  ["languages", "Languages (comma separated)"],
                  ["cast", "Cast (comma separated)"],
                  ["productionCompanies", "Production companies (comma separated)"],
                  ["trailer", "YouTube embed URL", "url"],
                ].map(([key, label, type = "text"]) => (
                  <label key={key} className="text-sm font-bold text-theme">
                    {label}
                    <input
                      type={type}
                      required={!["cast", "productionCompanies", "trailer"].includes(key)}
                      value={movie[key]}
                      onChange={(e) => setMovie({ ...movie, [key]: e.target.value })}
                      className="cinema-input mt-2 px-3 py-2.5"
                    />
                  </label>
                ))}
                <label className="text-sm font-bold text-theme">
                  Content type
                  <select
                    value={movie.contentType}
                    onChange={(e) => setMovie({ ...movie, contentType: e.target.value })}
                    className="cinema-input mt-2 px-3 py-2.5"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                    <option value="documentary">Documentary</option>
                    <option value="short-film">Short film</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-theme">
                  Certificate
                  <select
                    value={movie.certificate}
                    onChange={(e) => setMovie({ ...movie, certificate: e.target.value })}
                    className="cinema-input mt-2 px-3 py-2.5"
                  >
                    {["U", "UA", "A", "PG", "PG-13", "R", "NC-17"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold text-theme">
                  Status (released/upcoming)
                  <select
                    value={movie.status}
                    onChange={(e) => setMovie({ ...movie, status: e.target.value })}
                    className="cinema-input mt-2 px-3 py-2.5"
                  >
                    <option value="released">Released</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-theme">
                  Poster
                  <input
                    required
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setMovie({ ...movie, poster: e.target.files?.[0] || null })}
                    className="mt-2 block text-sm"
                  />
                </label>
                <label className="text-sm font-bold text-theme">
                  Banner
                  <input
                    required
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setMovie({ ...movie, banner: e.target.files?.[0] || null })}
                    className="mt-2 block text-sm"
                  />
                </label>
              </div>
              <label className="mt-4 block text-sm font-bold text-theme">
                Description
                <textarea
                  required
                  minLength="20"
                  value={movie.description}
                  onChange={(e) => setMovie({ ...movie, description: e.target.value })}
                  className="cinema-input mt-2 min-h-36 p-3"
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={movie.isFeatured}
                    onChange={(e) => setMovie({ ...movie, isFeatured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="text-sm">
                  Visibility
                  <select
                    value={movie.publishStatus}
                    onChange={(e) => setMovie({ ...movie, publishStatus: e.target.value })}
                    className="cinema-input ml-2 px-2 py-1"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
              </div>
              <button
                disabled={saving}
                className="primary-action mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 font-bold disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {saving ? "Uploading…" : "Create movie"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;