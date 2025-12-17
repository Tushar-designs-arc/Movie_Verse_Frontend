import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";

import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles, User, UserCheck } from "lucide-react";


const SignupPage = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const { showToast } = useToast();

    const [form, setForm] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [submitting, setSubmitting] = useState(false);

    // Keep both visibility controls local because the fields can be inspected independently.
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        try {
            if (form.password !== form.confirmPassword) {
                showToast("Passwords do not match.", "error");

                setSubmitting(false);
                return;
            }


            const username = form.username.trim().toLowerCase();
            if (!/^[a-z0-9_]{3,20}$/.test(username)) {
                showToast(
                    "Username must use 3–20 lowercase letters, numbers, or underscores only.",
                    "error",
                );
                setSubmitting(false);
                return;
            }

            await signup({
                fullName: form.fullName.trim(),
                username,
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });

            showToast("Registration successful. Please verify your email.", "success");
            navigate("/verify-email", {
                replace: true,
                state: { email: form.email.trim().toLowerCase() }
            });
        } catch (error) {
            showToast(error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || "Signup failed.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    return (
        <div className="section-shell min-h-screen py-28">
            <div className="grid min-h-[680px] overflow-hidden rounded-lg border border-white/10 bg-theme/[0.22] shadow-[0_28px_90px_rgba(0,0,0,0.45)] lg:grid-cols-[460px_1fr]">
                <section className="cinema-panel flex items-center rounded-none border-0 p-6 sm:p-8">
                    <form onSubmit={submit} className="w-full">

                        <div className="mb-8">
                            <p className="eyebrow">Signup</p>
                            <h1 className="mt-2 text-4xl font-black leading-tight text-theme">
                                Create your MovieVerse account
                            </h1>

                            <p className="muted-copy mt-3 text-sm leading-6">
                                Create your account to review movies, build your watchlist, save favorites, and discover trending content.
                            </p>
                        </div>

                        <label className="block">
                            <span className="text-sm font-bold text-inverse">Name</span>

                            <span className="relative mt-2 block">
                                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

                                <input type="text" autoComplete="name" value={form.fullName}
                                    minLength={2}
                                    maxLength={50}
                                    onChange={(event) => updateField("fullName", event.target.value)}
                                    className="cinema-input px-3 py-3 pl-10" required />
                            </span>
                        </label>

                        <label className="mt-4 block">
                            <span className="text-sm font-bold text-inverse">Username</span>

                            <span className="relative mt-2 block">
                                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

                                <input type="text" autoComplete="username" value={form.username}
                                    minLength={3}
                                    maxLength={20}
                                    pattern="[a-z0-9_]+"
                                    title="Use 3–20 lowercase letters, numbers, or underscores."
                                    onChange={(e) => updateField("username", e.target.value.toLowerCase())}
                                    className="cinema-input px-3 py-3 pl-10" required />
                            </span>
                            <span className="mt-1 block text-xs text-muted">3–20 lowercase letters, numbers, or underscores. Do not use an email address.</span>
                        </label>

                        <label className="mt-4 block">
                            <span className="text-sm font-bold text-inverse">Email</span>

                            <span className="relative mt-2 block">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

                                <input type="email" autoComplete="email" value={form.email}
                                    onChange={(event) => updateField("email", event.target.value)}
                                    className="cinema-input px-3 py-3 pl-10" required />
                            </span>
                        </label>

                        <label className="mt-4 block">
                            <span className="text-sm font-bold text-inverse">Password</span>

                            <span className="relative mt-2 block">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

                                <input type={showPassword ? "text" : "password"} autoComplete="new-password"
                                    minLength={8} value={form.password}
                                    onChange={(event) => updateField("password", event.target.value)}
                                    className="cinema-input px-3 py-3 pl-10 pr-11" required />

                                <button type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-surface/10 hover:text-theme"
                                    aria-label={showPassword ? "Hide password" : "Show password"}>

                                    {showPassword ?
                                        (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                                </button>
                            </span>
                        </label>

                        <label className="mt-4 block">
                            <span className="text-sm font-bold text-inverse">Confirm Password</span>

                            <span className="relative mt-2 block">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

                                <input type={showConfirmPassword ? "text" : "password"} autoComplete="new-password"
                                    value={form.confirmPassword}
                                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                                    className="cinema-input px-3 py-3 pl-10 pr-11" required />

                                <button type="button" onClick={() => setShowConfirmPassword((value) => !value)}
                                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-surface/10 hover:text-theme">

                                    {showConfirmPassword ?
                                        (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                                </button>
                            </span>
                        </label>

                        <button type="submit" disabled={submitting}
                            className="primary-action mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60">

                            <UserCheck className="h-4 w-4" />
                            {submitting ? "Creating..." : "Create Account"}
                        </button>

                        <p className="muted-copy mt-6 text-center text-sm">
                            Already registered?{" "}

                            <Link to="/login" className="font-bold text-red-300 transition hover:text-theme">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </section>

                <section
                    className="relative hidden overflow-hidden p-8 lg:flex lg:flex-col lg:justify-end"
                    style={{
                        backgroundImage:
                            "linear-gradient(115deg, rgba(5,6,9,0.9), rgba(5,6,9,0.66), rgba(5,6,9,0.28)), url(https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=80)",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                    }}
                >
                    <div className="relative max-w-2xl">
                        <p className="eyebrow mb-4 inline-flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            New profile
                        </p>
                        <h2 className="text-6xl font-black leading-none text-theme">
                            Build a personal streaming shelf.
                        </h2>
                        <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                            {["Save", "Resume", "Rate"].map((item) => (
                                <div key={item} className="rounded-lg border border-white/10 bg-theme/[0.32] p-4">
                                    <p className="text-xs font-black uppercase text-neutral-500">{item}</p>
                                    <ArrowRight className="mt-3 h-5 w-5 text-red-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SignupPage;
