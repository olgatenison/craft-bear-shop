// app/[lang]/account/reset/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Locale } from "@/app/lib/locale";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type Strength = "weak" | "medium" | "strong";

function getPasswordStrength(pw: string): Strength | null {
  if (!pw) return null;

  const hasLetter = /[A-Za-zА-Яа-я]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^A-Za-zА-Яа-я0-9]/.test(pw);

  if (pw.length < 6 || !hasLetter || !hasDigit) return "weak";
  if (pw.length >= 10 && hasLetter && hasDigit && hasSpecial) return "strong";
  if (pw.length >= 8 && hasLetter && hasDigit) return "medium";

  return "weak";
}

function strengthMeta(strength: Strength | null) {
  switch (strength) {
    case "weak":
      return { label: "Weak", className: "text-red-500" };
    case "medium":
      return { label: "Medium", className: "text-yellow-400" };
    case "strong":
      return { label: "Strong", className: "text-green-500" };
    default:
      return { label: "", className: "" };
  }
}

function ResetPasswordForm({ lang }: { lang: Locale }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<Strength | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetUrl = searchParams.get("url");

  const { label: strengthLabel, className: strengthClass } =
    strengthMeta(passwordStrength);

  useEffect(() => {
    if (!resetUrl) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, [resetUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const strength = getPasswordStrength(password);

    if (strength === "weak") {
      setLoading(false);
      setError(
        "Password must be at least 8 characters and contain letters and numbers."
      );
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    if (!resetUrl) {
      setLoading(false);
      setError("Invalid reset link.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetUrl, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.errors?.[0]?.message || data.error || "Failed to reset password"
        );
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push(`/${lang}/account`);
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Network error");
      } else {
        setError("Network error");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[480px] px-8 py-10">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-white">
            Password Reset Successfully!
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Redirecting you to your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[480px] px-8 py-10">
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold text-white">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Enter your new password below
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="password"
            className="block text-sm/6 font-medium text-gray-300"
          >
            New Password
          </label>
          <div className="mt-2 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                setPasswordStrength(getPasswordStrength(value));
              }}
              className="block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {password && (
            <p className={`mt-1 text-xs font-medium ${strengthClass}`}>
              Password strength: {strengthLabel}{" "}
              <span className="text-gray-400">
                (min 8 chars, letters & digits)
              </span>
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm/6 font-medium text-gray-300"
          >
            Confirm New Password
          </label>
          <div className="mt-2">
            <input
              id="confirm-password"
              name="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || !resetUrl}
            className="flex w-full items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <a
          href={`/${lang}/account/login`}
          className="text-sm text-gray-400 hover:text-yellow-400"
        >
          Back to Sign in
        </a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage({
  params,
}: {
  params: { lang: Locale };
}) {
  return (
    <Suspense
      fallback={<div className="text-center text-white">Loading...</div>}
    >
      <ResetPasswordForm lang={params.lang} />
    </Suspense>
  );
}
