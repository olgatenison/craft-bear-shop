// app/components/AccountContent.tsx

"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import type { Locale } from "@/app/lib/locale";
import type { AccountPageMessages } from "@/app/[lang]/account/page";

import { GenderSelect } from "./ui/GenderSelect";
import { normalizeBirthday } from "@/app/lib/utils/date";
import { validatePhone } from "@/app/lib/utils/validatePhone";
import { AccountSidebar } from "./ui/AccountSidebar";

type ProfileMetadata = {
  phone?: string;
  birthday?: string;
  gender?: string;
};

type AccountContentProps = {
  messages: AccountPageMessages;
  shopifyCustomerId: string | null;
  shopifyError?: string | null;
};

export default function AccountContent({ messages }: AccountContentProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // язык из URL
  const langFromParams = params?.lang;
  const lang = (
    Array.isArray(langFromParams) ? langFromParams[0] : langFromParams
  ) as Locale | undefined;
  const effectiveLang = (lang || "en") as Locale;

  const baseAccountPath = `/${effectiveLang}/account`;

  const navItems = [
    { href: baseAccountPath, label: messages.tabProfile },
    { href: `${baseAccountPath}/orders`, label: messages.tabOrders },
    { href: `${baseAccountPath}/reviews`, label: messages.tabReviews },
    { href: `${baseAccountPath}/addresses`, label: messages.tabAddresses },
  ];

  const rawMetadata = (user?.publicMetadata ?? {}) as ProfileMetadata;

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: rawMetadata.phone ?? "",
    birthday: normalizeBirthday(rawMetadata.birthday),
    gender: rawMetadata.gender ?? "",
  });

  // когда подгрузился / сменился user — синхронизируем форму
  useEffect(() => {
    if (!user) return;
    const m = (user.publicMetadata ?? {}) as ProfileMetadata;
    setProfileForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: m.phone ?? "",
      birthday: normalizeBirthday(m.birthday),
      gender: m.gender ?? "",
    });
  }, [user]); // ✅ зависимость — сам user

  const handleProfileChange = (
    field: keyof typeof profileForm,
    value: string
  ) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setSavingProfile(true);
    setProfileError(null);
    setPhoneError(null);

    // 1. валидация телефона
    const phoneCheck = validatePhone(profileForm.phone);
    if (phoneCheck.error) {
      const msg =
        phoneCheck.error === "invalid"
          ? messages.phoneErrorInvalid
          : phoneCheck.error === "tooShort"
          ? messages.phoneErrorTooShort
          : messages.phoneErrorTooLong;

      setPhoneError(msg);
      setSavingProfile(false);
      return;
    }

    // 2. payload: нормализованный телефон + дата
    const payload = {
      ...profileForm,
      phone: phoneCheck.normalized,
      birthday: normalizeBirthday(profileForm.birthday),
    };

    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = messages.profileSaveUnknownError;
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      await user.reload();
    } catch (err) {
      console.error(err);
      setProfileError(
        err instanceof Error ? err.message : messages.profileSaveUnknownError
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut({ redirectUrl: `/${effectiveLang}/account` });
    } catch (error) {
      console.error("Sign out error:", error);
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
        {/* LEFT: сайдбар */}
        <AccountSidebar
          user={user}
          navItems={navItems}
          baseAccountPath={baseAccountPath}
          effectiveLang={effectiveLang}
          onSignOut={handleSignOut}
          signingOutLabel={messages.signingOut}
          signOutLabel={messages.signOut}
          greetingLabel={messages.sidebarGreeting}
          loading={loading}
        />

        {/* RIGHT: основной контент */}
        <main className="mt-10 gap-12 space-y-6 lg:col-span-8 lg:mt-0">
          <section className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {messages.profileInformation}
                </h2>
                <p className="mt-4 text-base text-gray-400">
                  {messages.profileIntro}
                </p>
              </div>
            </div>

            {/* форма профиля */}
            <form
              onSubmit={handleProfileSubmit}
              className="mt-6 grid gap-8 pt-12 sm:grid-cols-2"
            >
              <div>
                <dt className="text-base tracking-wide text-gray-400">
                  {messages.name}
                </dt>
                <dd className="mt-1 text-base text-white">
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) =>
                      handleProfileChange("firstName", e.target.value)
                    }
                    className="w-full border-b border-gray-400/50 bg-transparent pb-1 outline-none"
                  />
                </dd>
              </div>

              <div>
                <dt className="text-base tracking-wide text-gray-400">
                  {messages.phone}
                </dt>
                <dd className="mt-1 text-base text-white">
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => {
                      handleProfileChange("phone", e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    className="w-full border-b border-gray-400/50 bg-transparent pb-1 outline-none"
                    placeholder={messages.phonePlaceholder}
                  />
                </dd>
                {phoneError && (
                  <p className="mt-1 text-sm text-red-400">{phoneError}</p>
                )}
              </div>

              <div>
                <dt className="text-base tracking-wide text-gray-400">
                  {messages.lastName}
                </dt>
                <dd className="mt-1 text-base text-white">
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) =>
                      handleProfileChange("lastName", e.target.value)
                    }
                    className="w-full border-b border-gray-400/50 bg-transparent outline-none"
                  />
                </dd>
              </div>

              <div>
                <dt className="text-sm tracking-wide text-gray-400">
                  {messages.email}
                </dt>
                <dd className="mt-1 border-b border-gray-400/50 pb-1 text-base text-white">
                  {user.primaryEmailAddress?.emailAddress || "—"}
                </dd>
              </div>

              <div>
                <dt className="text-base tracking-wide text-gray-400">
                  {messages.birthday}
                </dt>
                <dd className="mt-2 text-base text-white">
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.birthday || ""}
                      onChange={(e) =>
                        handleProfileChange("birthday", e.target.value)
                      }
                      className="w-full border-b border-gray-400/50 bg-transparent pb-1 pr-10 outline-none"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </dd>
              </div>

              <div>
                <dt className="text-base tracking-wide text-gray-400">
                  {messages.gender}
                </dt>
                <dd className="mt-1 border-b border-gray-400/50 pb-1 text-base text-white">
                  <GenderSelect
                    value={profileForm.gender}
                    onChange={(val) => handleProfileChange("gender", val)}
                    labels={{
                      "": messages.genderLabelNotSet,
                      female: messages.genderLabelFemale,
                      male: messages.genderLabelMale,
                      other: messages.genderLabelOther,
                    }}
                  />
                </dd>
              </div>

              {/* низ формы */}
              <div className="mt-12 flex w-full items-center justify-between sm:col-span-2">
                <div>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="mt-6 inline-flex shrink-0 items-center justify-center rounded-md border border-white/25 px-8 py-2 text-base font-semibold text-white hover:bg-white/10 disabled:opacity-60 sm:ml-8 sm:mt-0 lg:ml-0 lg:w-sm"
                  >
                    {savingProfile
                      ? messages.profileSaving
                      : messages.profileSaveButton}
                  </button>
                </div>
                <div>
                  <dt className="text-sm tracking-wide text-gray-400">
                    {messages.accountCreated}
                  </dt>
                  <dd className="mt-1 text-right text-sm text-gray-300">
                    {new Date(user.createdAt!).toLocaleDateString()}
                  </dd>
                </div>
              </div>
            </form>

            {profileError && (
              <p className="pt-6 text-sm text-red-400">{profileError}</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

{
  /* <aside className="lg:col-span-4 space-y-6">
          {/* міні-профіль *
          <div className="p-6">
            <p className="pb-6 text-base text-gray-400">
              {messages.sidebarGreeting}
              {user.firstName ? "," : ""}
            </p>
            <p className="pb-6 truncate text-2xl font-semibold text-white">
              {user.firstName || user.primaryEmailAddress?.emailAddress}
            </p>
            <p className="mt-1 truncate text-sm text-gray-500">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <nav className="rounded-xl bg-white/5 border border-white/10 px-3 pt-2 pb-0 text-sm text-gray-200">
            <div className="w-full border-b border-white/10 flex flex-col gap-6 py-3">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== baseAccountPath &&
                    pathname?.startsWith(item.href));

                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className={classNames(
                      "flex-1 pb-3 px-1 text-base transition-colors border-b-2 w-full text-left",
                      isActive
                        ? "text-yellow-400 border-yellow-400 font-semibold"
                        : "text-gray-400 hover:text-white border-transparent"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>

   
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-base font-semibold text-gray-900 duration-300 hover:border-yellow-600 hover:bg-yellow-500 sm:w-auto lg:w-full"
          >
            {loading ? messages.signingOut : messages.signOut}
          </button>
        </aside> */
}
