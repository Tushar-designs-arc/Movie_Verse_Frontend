import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";
import RouteLoadingFallback from "./components/common/RouteLoadingFallback";
import { AuthProvider } from "./context/AuthContext";
import { StorefrontProvider } from "./context/StoreFrontContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import CatalogPage from "./pages/CatalogPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SearchPage from "./pages/SearchPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const DetailsPage = lazy(() => import("./pages/DetailsPage"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const WatchPlayerPage = lazy(() => import("./pages/WatchPlayerPage"));

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <StorefrontProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <div className="app-frame text-[var(--text)]">
                  <Navbar />
                  <main className="relative z-10">
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/movies" element={<CatalogPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/details/:slug" element={<DetailsPage />} />
                        <Route
                          path="/user/:username"
                          element={<PublicProfilePage />}
                        />
                        <Route
                          path="/watch/:slug"
                          element={
                            <ProtectedRoute>
                              <WatchPlayerPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/login"
                          element={
                            <GuestRoute>
                              <LoginPage />
                            </GuestRoute>
                          }
                        />
                        <Route
                          path="/signup"
                          element={
                            <GuestRoute>
                              <SignupPage />
                            </GuestRoute>
                          }
                        />
                        <Route
                          path="/verify-email"
                          element={
                            <GuestRoute>
                              <VerifyEmailPage />
                            </GuestRoute>
                          }
                        />
                        <Route
                          path="/forgot-password"
                          element={
                            <GuestRoute>
                              <ForgotPasswordPage />
                            </GuestRoute>
                          }
                        />
                        <Route
                          path="/reset-password"
                          element={
                            <GuestRoute>
                              <ResetPasswordPage />
                            </GuestRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/watchlist"
                          element={
                            <ProtectedRoute>
                              <LibraryPage
                                collection="wishlist"
                                title="Watchlist"
                                subtitle="Titles you saved for later."
                              />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/favorites"
                          element={
                            <ProtectedRoute>
                              <LibraryPage
                                collection="favorites"
                                title="Favorites"
                                subtitle="Your highest-intent picks in one place."
                              />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute adminOnly>
                              <AdminDashboardPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>
              </ErrorBoundary>
            </BrowserRouter>
          </StorefrontProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
