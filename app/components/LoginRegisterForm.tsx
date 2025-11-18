// app\components\LoginRegisterForm.tsx
"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { Locale } from "@/app/lib/locale";

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

// аккуратный тип под ошибки Clerk
type ClerkErrorShape = {
  errors?: { longMessage?: string; message?: string }[];
  message?: string;
};

function getErrorMessage(err: unknown): string {
  const e = err as ClerkErrorShape;
  return (
    e?.errors?.[0]?.longMessage ||
    e?.errors?.[0]?.message ||
    e?.message ||
    "Something went wrong"
  );
}

export default function LoginRegisterForm({ lang }: { lang: Locale }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<Strength | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();

  const { label: strengthLabel, className: strengthClass } =
    strengthMeta(passwordStrength);

  function resetPasswords() {
    setPassword("");
    setConfirmPassword("");
    setPasswordStrength(null);
    setShowPassword(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "register") {
        // проверка пароля
        const strength = getPasswordStrength(password);
        if (strength === "weak") {
          setError(
            "Password must be at least 8 characters and contain letters and numbers."
          );
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        // signUp и setActive могут быть undefined → проверяем
        if (!signUpLoaded || !signUp || !setActive) {
          setLoading(false);
          return;
        }

        const result = await signUp.create({
          emailAddress: email,
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          resetPasswords();
          setSuccess("Account created successfully!");

          setTimeout(() => {
            router.push(`/${lang}/account`);
            router.refresh();
          }, 500);
        } else {
          setError("Please complete the sign-up flow.");
        }
      } else {
        // LOGIN
        if (!signInLoaded || !signIn || !setActive) {
          setLoading(false);
          return;
        }

        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          resetPasswords();

          setTimeout(() => {
            router.push(`/${lang}/account`);
            router.refresh();
          }, 300);
        } else {
          setError("Please complete the sign-in flow.");
        }
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    if (!signInLoaded || !signIn) return;

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setSuccess(
        "If this email exists, we have sent instructions to reset your password."
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[480px] px-8 py-10">
      {/* Табы Sign in / Sign up */}
      <div className="mt-6 flex w-full border-b border-white/10">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
            setSuccess(null);
            resetPasswords();
          }}
          className={`flex-1 pb-6 px-1 text-center text-base font-semibold transition-colors border-b-2 ${
            mode === "login"
              ? "text-yellow-400 border-yellow-400"
              : "text-gray-500 hover:text-white border-transparent"
          }`}
        >
          Sign in
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
            setSuccess(null);
            resetPasswords();
          }}
          className={`flex-1 pb-3 px-1 text-center text-base font-semibold transition-colors border-b-2 ${
            mode === "register"
              ? "text-yellow-400 border-yellow-400"
              : "text-gray-500 hover:text-white border-transparent"
          }`}
        >
          Sign up
        </button>
      </div>

      <p className="mt-6 text-center text-base text-gray-300">
        {mode === "login"
          ? "Welcome back! Please sign in to continue"
          : "Create your account to start shopping"}
      </p>

      {/* Форма */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm/6 font-medium text-gray-300"
          >
            Email address
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
        </div>

        {/* Password + глаз + индикатор */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm/6 font-medium text-gray-300"
          >
            Password
          </label>
          <div className="mt-2 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
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
          {mode === "register" && password && (
            <p className={`mt-1 text-xs font-medium ${strengthClass}`}>
              Password strength: {strengthLabel}{" "}
              <span className="text-gray-400">
                (min 8 chars, letters &amp; digits)
              </span>
            </p>
          )}
        </div>

        {/* Confirm password только при регистрации */}
        {mode === "register" && (
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm/6 font-medium text-gray-300"
            >
              Confirm password
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
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        {/* Кнопка снизу формы */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "..." : mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </div>
        {/* Контейнер для Smart CAPTCHA от Clerk — нужен только на регистрации */}
        {mode === "register" && <div id="clerk-captcha" className="mt-4" />}

        {mode === "login" && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="mt-10 text-center text-base text-gray-500 hover:text-yellow-500"
            >
              Forgot password?
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
