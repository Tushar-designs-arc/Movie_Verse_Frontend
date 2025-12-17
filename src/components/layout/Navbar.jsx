import { Bookmark, Heart, LogOut, Menu, Moon, Search, Sun, User, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

const links = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "Search", to: "/search" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const lastQuery = useRef("");

  const closeMenu = useCallback(() => setOpen(false), []);

  const search = useCallback(
    (event) => {
      event.preventDefault();
      const value = query.trim();
      if (!value || value === lastQuery.current) return;
      lastQuery.current = value;
      navigate(`/search?q=${encodeURIComponent(value)}`);
      closeMenu();
    },
    [closeMenu, navigate, query],
  );

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
    closeMenu();
  }, [closeMenu, toggleTheme]);

  const handleLogout = useCallback(async () => {
    await logout();
    setQuery("");
    lastQuery.current = "";
    closeMenu();
    navigate("/", { replace: true });
  }, [closeMenu, logout, navigate]);

  const itemClass = ({ isActive }) =>
    `rounded-lg px-3 py-2.5 text-sm font-bold transition ${isActive ? "nav-pill-active" : "nav-pill"}`;

  useEffect(() => {
    queueMicrotask(() => {
      const urlQuery = location.pathname === "/search" ? new URLSearchParams(location.search).get("q") || "" : "";
      setQuery(urlQuery);
      lastQuery.current = urlQuery;
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/search") return;
    const value = query.trim();
    if (value === lastQuery.current) return;
    const timer = setTimeout(() => {
      lastQuery.current = value;
      navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/search", {
        replace: true,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [location.pathname, navigate, query]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu]);

  useEffect(() => {
    queueMicrotask(closeMenu);
  }, [closeMenu, location.pathname]);

  const searchInput = (mobile = false) => (
    <div className={mobile ? "relative" : "relative flex-1"}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        type="search"
        enterKeyHint="search"
        className={`cinema-input ${mobile ? "w-full py-3" : "w-40 py-2.5 sm:w-48 lg:w-64"} pl-10 pr-3 text-sm focus-visible:ring-2 focus-visible:ring-red-500`}
        placeholder="Search movies, actors, directors..."
        autoComplete="off"
        spellCheck={false}
        aria-label="Search movies, actors, and directors"
      />
    </div>
  );

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 backdrop-blur-xl ${isScrolled ? "bg-[var(--panel-strong)]/95 shadow-2xl" : "bg-transparent"}`}
    >
      <div className="section-shell flex h-16 items-center justify-between gap-3 sm:h-20">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex min-w-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <span className="brand-mark grid h-9 w-9 place-items-center rounded-lg text-base font-black text-theme sm:h-10 sm:w-10">
            M
          </span>
          <span className="text-lg font-black text-theme sm:text-xl">
            MovieVerse
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary navigation"
        >
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={itemClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <form
            role="search"
            onSubmit={search}
            className="flex items-center gap-2"
          >
            {searchInput()}
            <button
              type="submit"
              disabled={!query.trim()}
              className="primary-action rounded-lg px-3 py-2.5 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Search movies"
            >
              Search
            </button>
          </form>
          <button
            onClick={handleThemeToggle}
            className="icon-action grid h-10 w-10 place-items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sun className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          {isAuthenticated ? (
            <>
              <Link
                to="/watchlist"
                className="icon-action grid h-10 w-10 place-items-center rounded-lg"
                title="Watchlist"
                aria-label="Watchlist"
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/favorites"
                className="icon-action grid h-10 w-10 place-items-center rounded-lg"
                title="Favorites"
                aria-label="Favorites"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/profile"
                className="bright-action inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="Open profile"
              >
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="max-w-24 truncate">
                  {user?.fullName?.trim().split(" ")[0] || "Profile"}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="icon-action grid h-10 w-10 place-items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="primary-action rounded-lg px-4 py-2.5 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          onClick={() => setOpen((currentOpen) => !currentOpen)}
          className="icon-action grid h-10 w-10 place-items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          className="border-t border-white/10 bg-[var(--panel-strong)] px-4 pb-5 pt-4 shadow-2xl md:hidden"
        >
          <form role="search" onSubmit={search}>
            {searchInput(true)}
          </form>
          <nav className="mt-3 grid gap-1" aria-label="Mobile navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={itemClass}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <>
                <NavLink
                  to="/watchlist"
                  onClick={closeMenu}
                  className={itemClass}
                >
                  Watchlist
                </NavLink>
                <NavLink
                  to="/favorites"
                  onClick={closeMenu}
                  className={itemClass}
                >
                  Favorites
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={closeMenu}
                  className={itemClass}
                >
                  Profile
                </NavLink>
              </>
            )}
          </nav>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleThemeToggle}
              className="secondary-action flex-1 rounded-lg py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </button>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="secondary-action flex-1 rounded-lg py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="primary-action flex-1 rounded-lg py-2.5 text-center text-sm font-bold"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
