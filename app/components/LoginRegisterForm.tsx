// app/components/LoginRegisterForm.tsx

"use client";

import { useRef, useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";

import type { Locale } from "@/app/lib/locale";

import { AuthTabs } from "@/app/components/auth/AuthTabs";
import { AuthAlert } from "@/app/components/auth/AuthAlert";
import PasswordField from "@/app/components/auth/PasswordField";
import type { AuthMessages } from "@/app/components/auth/types";

type Strength = "weak" | "medium" | "strong";

function getPasswordStrength(pw: string): Strength | null {
  if (!pw) return null;

  const hasLetter = /[A-Za-zА-Яа-я]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^A-Za-zА-Яа-я0-9]/.test(pw);

  if (pw.length < 6 || !hasLetter || !hasDigit) {
    return "weak";
  }

  if (pw.length >= 10 && hasLetter && hasDigit && hasSpecial) {
    return "strong";
  }

  if (pw.length >= 8 && hasLetter && hasDigit) {
    return "medium";
  }

  return "weak";
}

function strengthMeta(
  strength: Strength | null,
  messages: AuthMessages,
): {
  label: string;
  className: string;
} {
  switch (strength) {
    case "weak":
      return {
        label: messages.passwordStrengthWeak,
        className: "text-red-500",
      };

    case "medium":
      return {
        label: messages.passwordStrengthMedium,
        className: "text-yellow-400",
      };

    case "strong":
      return {
        label: messages.passwordStrengthStrong,
        className: "text-green-500",
      };

    default:
      return {
        label: "",
        className: "",
      };
  }
}

type ClerkErrorShape = {
  errors?: {
    code?: string;
    longMessage?: string;
    message?: string;
  }[];
  message?: string;
};

function getErrorMessage(err: unknown, messages: AuthMessages): string {
  const e = err as ClerkErrorShape;

  const firstError = e?.errors?.[0];
  const code = firstError?.code;

  switch (code) {
    case "form_identifier_exists":
      return messages.emailAlreadyExists;

    case "form_identifier_not_found":
      return messages.userNotFound;

    case "form_password_incorrect":
      return messages.incorrectPassword;

    case "form_password_or_identifier_incorrect":
      return messages.passwordOrEmailIncorrect;

    case "form_password_validation_failed":
      return messages.passwordValidationFailed;

    case "form_password_matches_identifier":
      return messages.passwordMatchesIdentifier;

    case "form_password_pwned":
      return messages.passwordCompromised;

    case "form_code_incorrect":
      return messages.verificationCodeIncorrect;

    case "verification_expired":
      return messages.verificationExpired;

    case "verification_failed":
      return messages.verificationFailed;

    case "form_param_format_invalid":
    case "form_param_nil":
      return messages.invalidEmail;

    case "too_many_requests":
      return messages.tooManyRequests;

    default:
      return (
        firstError?.longMessage ||
        firstError?.message ||
        e?.message ||
        messages.somethingWentWrong
      );
  }
}

export default function LoginRegisterForm({
  messages,
}: {
  messages: AuthMessages;
}) {
  const router = useRouter();
  const params = useParams();

  const langFromParams = params?.lang;

  const lang = (
    Array.isArray(langFromParams) ? langFromParams[0] : langFromParams
  ) as Locale | undefined;

  const effectiveLang = (lang || "en") as Locale;

  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState<Strength | null>(
    null,
  );

  const [awaitingVerification, setAwaitingVerification] = useState(false);

  const [verificationCode, setVerificationCode] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  /*
   * LOGIN
   */
  const {
    isLoaded: signInLoaded,
    signIn,
    setActive: setActiveSignIn,
  } = useSignIn();

  /*
   * REGISTER
   */
  const {
    isLoaded: signUpLoaded,
    signUp,
    setActive: setActiveSignUp,
  } = useSignUp();

  /*
   * Сохраняем актуальный sign-up attempt.
   */
  const signUpAttemptRef = useRef<NonNullable<typeof signUp> | null>(null);

  const { label: strengthLabel, className: strengthClass } = strengthMeta(
    passwordStrength,
    messages,
  );

  const normalizedEmail = email.trim().toLowerCase();

  const passwordsMatch = !confirmPassword || password === confirmPassword;

  function clearPasswordFields() {
    setPassword("");
    setConfirmPassword("");
    setPasswordStrength(null);
    setShowPassword(false);
  }

  function resetFormFields() {
    clearPasswordFields();

    setVerificationCode("");
    setAwaitingVerification(false);

    signUpAttemptRef.current = null;
  }

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);

    setError(null);
    setSuccess(null);

    resetFormFields();
  }

  /*
   * =========================================
   * LOGIN / REGISTER
   * =========================================
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      /*
       * REGISTER
       */
      if (mode === "register") {
        const strength = getPasswordStrength(password);

        if (strength === "weak") {
          setError(messages.weakPassword);
          return;
        }

        if (password !== confirmPassword) {
          setError(messages.passwordsDontMatch);

          return;
        }

        if (!signUpLoaded || !signUp) {
          return;
        }

        /*
         * Создаём signup attempt.
         */
        const signUpAttempt = await signUp.create({
          emailAddress: normalizedEmail,

          password,
        });

        /*
         * Сохраняем актуальный attempt.
         */
        signUpAttemptRef.current = signUpAttempt;

        console.log("Sign-up attempt created:", {
          status: signUpAttempt.status,

          missingFields: signUpAttempt.missingFields,

          unverifiedFields: signUpAttempt.unverifiedFields,
        });

        /*
         * Если вдруг регистрация уже complete,
         * не пытаемся отправлять verification-код.
         */
        if (signUpAttempt.status === "complete") {
          if (signUpAttempt.createdSessionId && setActiveSignUp) {
            await setActiveSignUp({
              session: signUpAttempt.createdSessionId,
            });

            router.push(`/${effectiveLang}/account`);

            router.refresh();
          }

          return;
        }

        /*
         * Отправляем код подтверждения.
         */
        await signUpAttempt.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        /*
         * Показываем verification screen.
         */
        setAwaitingVerification(true);

        return;
      }

      /*
       * LOGIN
       */
      if (!signInLoaded || !signIn || !setActiveSignIn) {
        return;
      }

      const result = await signIn.create({
        identifier: normalizedEmail,

        password,
      });

      if (result.status === "complete") {
        await setActiveSignIn({
          session: result.createdSessionId,
        });

        resetFormFields();

        router.push(`/${effectiveLang}/account`);

        router.refresh();

        return;
      }

      console.log("Sign-in incomplete:", {
        status: result.status,
      });

      setError(messages.signInFlowIncomplete);
    } catch (err: unknown) {
      console.error("Authentication error:", err);

      setError(getErrorMessage(err, messages));
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================
   * VERIFY EMAIL
   * =========================================
   */
  async function handleVerifyEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    const code = verificationCode.trim();

    if (!code) {
      return;
    }

    if (!signUpLoaded || !setActiveSignUp) {
      return;
    }

    const currentSignUp = signUpAttemptRef.current ?? signUp;

    if (!currentSignUp) {
      setError(messages.signUpFlowIncomplete);

      return;
    }

    setLoading(true);

    try {
      /*
       * Проверяем OTP.
       */
      const result = await currentSignUp.attemptEmailAddressVerification({
        code,
      });

      signUpAttemptRef.current = result;

      console.log("Email verification result:", {
        status: result.status,

        missingFields: result.missingFields,

        unverifiedFields: result.unverifiedFields,
      });

      /*
       * Всё подтверждено.
       */
      if (result.status === "complete") {
        if (!result.createdSessionId) {
          setError(messages.signUpFlowIncomplete);

          return;
        }

        await setActiveSignUp({
          session: result.createdSessionId,
        });

        clearPasswordFields();

        setVerificationCode("");
        setAwaitingVerification(false);

        signUpAttemptRef.current = null;

        router.push(`/${effectiveLang}/account`);

        router.refresh();

        return;
      }

      console.log("Sign-up is not complete:", {
        status: result.status,

        missingFields: result.missingFields,

        unverifiedFields: result.unverifiedFields,
      });

      setError(messages.signUpFlowIncomplete);
    } catch (err: unknown) {
      console.error("Email verification error:", err);

      setError(getErrorMessage(err, messages));
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================
   * RESEND CODE
   * =========================================
   */
  async function handleResendCode() {
    const currentSignUp = signUpAttemptRef.current ?? signUp;

    if (!signUpLoaded || !currentSignUp) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await currentSignUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      signUpAttemptRef.current = result;

      setSuccess(messages.resendCodeSuccess);
    } catch (err: unknown) {
      console.error("Resend verification code error:", err);

      setError(getErrorMessage(err, messages));
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================
   * CHANGE EMAIL
   * =========================================
   */
  function handleChangeEmail() {
    setAwaitingVerification(false);

    setVerificationCode("");

    setError(null);
    setSuccess(null);

    signUpAttemptRef.current = null;
  }

  /*
   * =========================================
   * EMAIL VERIFICATION SCREEN
   * =========================================
   */
  if (mode === "register" && awaitingVerification) {
    return (
      <div className="mt-6 px-8 py-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <AuthTabs
          mode={mode}
          onChange={switchMode}
          signInLabel={messages.signIn}
          signUpLabel={messages.signUp}
        />

        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold text-white">
            {messages.verifyEmailTitle}
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            {messages.verificationCodeSentTo}
          </p>

          <p className="mt-1 font-medium text-white">{normalizedEmail}</p>
        </div>

        <form onSubmit={handleVerifyEmail} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="verification-code"
              className="block text-sm/6 font-medium text-gray-300"
            >
              {messages.verificationCodeLabel}
            </label>

            <div className="mt-2">
              <input
                id="verification-code"
                name="verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                maxLength={6}
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);

                  setVerificationCode(value);

                  setError(null);

                  setSuccess(null);
                }}
                className="block w-full rounded-md bg-white px-3 py-2 text-center text-xl tracking-[0.35em] text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
              />
            </div>
          </div>

          <AuthAlert error={error} success={success} />

          <button
            type="submit"
            disabled={loading || verificationCode.length !== 6}
            className="flex w-full items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "..." : messages.verifyEmailButton}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-sm text-gray-400 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {messages.resendCodeButton}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleChangeEmail}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {messages.changeEmailButton}
            </button>
          </div>

          <div id="clerk-captcha" className="mt-4" />
        </form>
      </div>
    );
  }

  /*
   * =========================================
   * LOGIN / REGISTER FORM
   * =========================================
   */
  return (
    <div className="mt-6 px-8 py-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <AuthTabs
        mode={mode}
        onChange={switchMode}
        signInLabel={messages.signIn}
        signUpLabel={messages.signUp}
      />

      <p className="mt-6 text-center text-base text-gray-300">
        {mode === "login" ? messages.welcomeBack : messages.createAccount}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* EMAIL */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm/6 font-medium text-gray-300"
          >
            {messages.email}
          </label>

          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);

                setError(null);

                setSuccess(null);
              }}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <PasswordField
          id="password"
          name="password"
          label={messages.password}
          value={password}
          onChange={(value) => {
            setPassword(value);

            setPasswordStrength(getPasswordStrength(value));

            setError(null);

            setSuccess(null);
          }}
          showPassword={showPassword}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          showPasswordLabel={messages.showPasswordAria}
          hidePasswordLabel={messages.hidePasswordAria}
          hint={mode === "register" ? messages.passwordHint : undefined}
        />

        {/* PASSWORD STRENGTH */}
        {mode === "register" && password && passwordStrength && (
          <p className={`mt-1 text-xs font-medium ${strengthClass}`}>
            {messages.passwordStrength}: {strengthLabel}
          </p>
        )}

        {/* CONFIRM PASSWORD */}
        {mode === "register" && (
          <div>
            <PasswordField
              id="confirm-password"
              name="confirm-password"
              label={messages.confirmPassword}
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);

                setError(null);

                setSuccess(null);
              }}
              showPassword={showPassword}
              onToggleShow={() => setShowPassword((prev) => !prev)}
              autoComplete="new-password"
              showPasswordLabel={messages.showPasswordAria}
              hidePasswordLabel={messages.hidePasswordAria}
            />

            {confirmPassword && !passwordsMatch && (
              <p className="mt-2 text-sm text-red-500">
                {messages.passwordsDontMatch}
              </p>
            )}
          </div>
        )}

        <AuthAlert error={error} success={success} />

        <button
          type="submit"
          disabled={
            loading ||
            !normalizedEmail ||
            !password ||
            (mode === "register" && (!confirmPassword || !passwordsMatch))
          }
          className="flex w-full items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "..."
            : mode === "login"
              ? messages.submitSignIn
              : messages.submitSignUp}
        </button>

        {mode === "register" && <div id="clerk-captcha" className="mt-4" />}

        {mode === "login" && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => router.push(`/${effectiveLang}/forgot-password`)}
              className="text-center text-base text-gray-500 hover:text-yellow-500"
            >
              {messages.forgotPassword}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
