import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Component, createRef } from "react";

// Keep a rendering failure in one route subtree from taking down the entire application shell.
class ErrorBoundaryContent extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.headingRef = createRef();
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Unhandled application error:", error, errorInfo);
  }
  componentDidUpdate(_, previousState) {
    if (!previousState.hasError && this.state.hasError) {
      document.title = "Unexpected Error \u2022 MovieVerse";
      this.headingRef.current?.focus();
    }
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main
        className="section-shell grid min-h-screen place-items-center px-4 py-24 sm:py-28"
        role="alert"
        aria-labelledby="unexpected-error-heading"
      >
        <section className="cinema-panel w-full max-w-lg rounded-2xl p-6 text-center sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertTriangle className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1
            ref={this.headingRef}
            id="unexpected-error-heading"
            tabIndex="-1"
            className="mt-6 text-3xl font-black text-theme outline-none sm:text-4xl"
          >
            Something went wrong.
          </h1>
          <p className="muted-copy mt-3">
            The page encountered an unexpected error.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="primary-action inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Retry loading this page"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="secondary-action inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Go to MovieVerse home page"
            >
              <Home className="h-4 w-4" />
              Go Home
            </button>
          </div>
        </section>
      </main>
    );
  }
}

const ErrorBoundary = ({ children }) => (
  <ErrorBoundaryContent>{children}</ErrorBoundaryContent>
);

export default ErrorBoundary;
