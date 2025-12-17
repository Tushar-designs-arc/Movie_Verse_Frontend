import { CirclePlay, Clapperboard, Radio, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const socialIcons = [Share2, Radio, CirclePlay, Clapperboard];

const Footer = () => (
  <footer className="relative z-10 border-t border-theme bg-surface-soft backdrop-blur-xl">
    <div className="section-shell py-10 sm:py-14">
      <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.8fr]">
        <section aria-labelledby="footer-brand">
          <div className="flex items-center gap-3">
            <span
              className="brand-mark grid h-10 w-10 place-items-center rounded-lg font-black text-white"
              aria-hidden="true"
            >
              M
            </span>
            <div>
              <h2 id="footer-brand" className="text-xl font-black text-theme">
                MovieVerse
              </h2>
              <p className="text-xs uppercase text-muted">
                Discover. Save. Review.
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            A simple place to discover films, save the ones you love, and share
            thoughtful reviews.
          </p>
          <div className="mt-5 flex gap-2" aria-label="MovieVerse features">
            {socialIcons.map((Icon) => (
              <span
                key={Icon.displayName || Icon.name}
                className="icon-action grid h-9 w-9 place-items-center rounded-lg"
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </section>
        <nav aria-label="Explore">
          <h2 className="font-black text-theme">Explore</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted">
            <li>
              <Link
                to="/"
                className="transition hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/movies"
                className="transition hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Movies
              </Link>
            </li>
            <li>
              <Link
                to="/search"
                className="transition hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Search
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <h2 className="font-black text-theme">Your account</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted">
            <li>
              <Link
                to="/watchlist"
                className="transition hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Watchlist
              </Link>
            </li>
            <li>
              <Link
                to="/favorites"
                className="transition hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Favorites
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="transition hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Profile
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mt-10 border-t border-theme pt-5 text-sm text-muted">
        © 2026 MovieVerse. Built for discovering great films.
      </p>
    </div>
  </footer>
);

export default Footer;
