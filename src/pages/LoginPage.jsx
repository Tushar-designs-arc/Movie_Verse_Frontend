import { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";

import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, UserPlus } from "lucide-react";


const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { showToast } = useToast();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        try {
            await login({
                loginId: form.email.trim(), password: form.password
            });

            showToast("Login successful.", "success");

            const from = location.state?.from;
            const requestedPath = typeof from === "string"
                ? from
                : from?.pathname
                    ? `${from.pathname}${from.search || ""}${from.hash || ""}`
                    : "/";

            // Signing in never automatically opens the client-side admin panel.
            navigate(requestedPath.startsWith("/admin") ? "/" : requestedPath, {
                replace: true,
            });
        } catch (error) {
            showToast(error?.response?.data?.message || "Unable to login. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="section-shell min-h-screen py-28">
            <div className="grid min-h-[640px] overflow-hidden rounded-lg border border-white/10 bg-theme/[0.22] shadow-[0_28px_90px_rgba(0,0,0,0.45)] lg:grid-cols-[1fr_460px]">
                <section
                    className="relative hidden overflow-hidden p-8 lg:flex lg:flex-col lg:justify-end"
                    style={{
                        backgroundImage:
                            "linear-gradient(115deg, rgba(5,6,9,0.92), rgba(5,6,9,0.72), rgba(5,6,9,0.35)), url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80)",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                    }}
                >
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
                    <div className="relative max-w-2xl">
                        <p className="eyebrow mb-4 inline-flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            MovieVerse access
                        </p>
                        <h1 className="text-6xl font-black leading-none text-theme">
                            Stream dashboard, clean and ready.
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-inverse">
                            Login opens your watchlist, favorites, continue watching, and admin tools when your
                            account has access.
                        </p>

                        <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                            {["Watchlist", "Favorites", "Admin"].map((item) => (
                                <div key={item} className="rounded-lg border border-white/10 bg-theme/[0.32] p-4">
                                    <p className="text-xs font-black uppercase text-neutral-500">{item}</p>
                                    <p className="mt-2 text-lg font-black text-theme">Ready</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="cinema-panel flex items-center rounded-none border-0 p-6 sm:p-8">
                    <form onSubmit={submit} className="w-full">
                        <div className="mb-8">
                            <p className="eyebrow">Login</p>
                            <h2 className="mt-2 text-4xl font-black leading-tight text-theme">Open your library</h2>
                            <p className="muted-copy mt-3 text-sm leading-6">
                                Sign in to continue watching your favorite movies.
                            </p>
                            <p className="muted-copy mt-3 text-sm leading-6">
                                For inspection purpose use <span className="text-red-500 font-bold">admin@gmail.com</span> & <span className="text-red-500 font-bold">admin@123</span> credentials. <br /> Or, create a new account with a valid email.
                            </p>
                        </div>

                        <label className="block">
                            <span className="text-sm font-bold text-inverse">Email</span>
                            <span className="relative mt-2 block">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                                <input
                                    type="email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm((current) => ({ ...current, email: event.target.value }))
                                    }
                                    className="cinema-input px-3 py-3 pl-10"
                                    required
                                />
                            </span>
                        </label>

                        {/* Password Input */}
                        <label className="mt-4 block">
                            <span className="text-sm font-bold text-inverse">Password</span>
                            <span className="relative mt-2 block">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

                                <input type={showPassword ? "text" : "password"} autoComplete="current-password" value={form.password}
                                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                                    className="cinema-input px-3 py-3 pl-10 pr-11" required />

                                <button type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-surface/10 hover:text-theme"
                                    aria-label={showPassword ? "Hide password" : "Show password"}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </span>
                        </label>

                        {/* Forget Password Link */}
                        <div className="mt-2 flex justify-end">
                            <Link to="/forgot-password"
                                className="text-sm font-medium text-red-300 transition hover:text-theme">
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" disabled={submitting}
                            className="primary-action mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60">
                            <ShieldCheck className="h-4 w-4" />
                            {submitting ? "Signing In..." : "Sign In"}
                        </button>

                        <p className="muted-copy mt-6 text-center text-sm">
                            New here?{" "}
                            <Link to="/signup" className="font-bold text-red-300 transition hover:text-theme">
                                <span className="inline-flex items-center gap-1">
                                    <UserPlus className="h-4 w-4" />
                                    Create an account
                                </span>
                            </Link>
                        </p>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default LoginPage;

