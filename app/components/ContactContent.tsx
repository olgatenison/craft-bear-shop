"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/app/lib/locale";

type ValidationMessages = {
  firstNameRequired: string;
  firstNameMin: string;
  lastNameRequired: string;
  lastNameMin: string;
  nameInvalid: string;
  emailRequired: string;
  emailInvalid: string;
  emailDisposable: string;
  messageRequired: string;
  messageMin: string;
  messageMax: string;
  phoneInvalid: string;
  phoneMin: string;
  phoneMax: string;
};

type ContactMessages = {
  title: string;
  subtitle: string;
  wholesaleLink: string;
  firstname: string;
  lastname: string;
  emailLabel: string;
  company: string;
  phone: string;
  optional: string;
  message: string;
  messageLimit: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
};

type Props = {
  lang: Locale;
  messages: {
    Contact: ContactMessages;
    validation: ValidationMessages;
  };
};

type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  message: string;
};

type FormErrors = Partial<Record<keyof ContactFormData, string>>;

const initialFormData: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  phone: "",
  message: "",
};

/*
 * --------------------------------------------------
 * UNICODE NAME VALIDATION
 * --------------------------------------------------
 *
 * Поддерживаются буквы всех языков:
 * украинский, русский, эстонский,
 * финский, английский и другие.
 *
 * Разрешены пробелы, дефисы и апострофы
 * между частями имени.
 */

const nameRegex = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phoneRegex = /^[\d\s\-+()]+$/;

const disposableEmails = [
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "throwaway.email",
  "temp-mail.org",
];

function countLetters(value: string): number {
  return Array.from(value.matchAll(/\p{L}/gu)).length;
}

export default function ContactContent({ lang, messages }: Props) {
  // Основные переводы формы
  const t = messages.Contact;

  // Переводы ошибок — отдельный объект
  // в корне messages.json
  const v = messages.validation;

  const [formData, setFormData] = useState<ContactFormData>({
    ...initialFormData,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null,
  );

  /*
   * --------------------------------------------------
   * VALIDATION
   * --------------------------------------------------
   */

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const firstName = formData.firstName.trim().normalize("NFC");

    const lastName = formData.lastName.trim().normalize("NFC");

    const email = formData.email.trim();
    const message = formData.message.trim();
    const phone = formData.phone.trim();

    /*
     * FIRST NAME
     */

    if (!firstName) {
      newErrors.firstName = v.firstNameRequired;
    } else if (countLetters(firstName) < 2) {
      newErrors.firstName = v.firstNameMin;
    } else if (!nameRegex.test(firstName)) {
      newErrors.firstName = v.nameInvalid;
    }

    /*
     * LAST NAME
     */

    if (!lastName) {
      newErrors.lastName = v.lastNameRequired;
    } else if (countLetters(lastName) < 2) {
      newErrors.lastName = v.lastNameMin;
    } else if (!nameRegex.test(lastName)) {
      newErrors.lastName = v.nameInvalid;
    }

    /*
     * EMAIL
     */

    if (!email) {
      newErrors.email = v.emailRequired;
    } else if (!emailRegex.test(email)) {
      newErrors.email = v.emailInvalid;
    } else {
      const domain = email.split("@")[1]?.toLowerCase();

      if (domain && disposableEmails.includes(domain)) {
        newErrors.email = v.emailDisposable;
      }
    }

    /*
     * MESSAGE
     */

    if (!message) {
      newErrors.message = v.messageRequired;
    } else if (Array.from(message).length < 10) {
      newErrors.message = v.messageMin;
    } else if (Array.from(formData.message).length > 500) {
      newErrors.message = v.messageMax;
    }

    /*
     * PHONE (OPTIONAL)
     */

    if (phone) {
      if (!phoneRegex.test(phone)) {
        newErrors.phone = v.phoneInvalid;
      } else {
        const digitsOnly = phone.replace(/\D/g, "");

        if (digitsOnly.length < 7) {
          newErrors.phone = v.phoneMin;
        } else if (digitsOnly.length > 15) {
          newErrors.phone = v.phoneMax;
        }
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * --------------------------------------------------
   * HANDLE CHANGE
   * --------------------------------------------------
   */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  /*
   * --------------------------------------------------
   * HANDLE SUBMIT
   * --------------------------------------------------
   */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setSubmitStatus(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/${lang}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          firstName: formData.firstName.trim().normalize("NFC"),
          lastName: formData.lastName.trim().normalize("NFC"),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSubmitStatus("success");
      setErrors({});
      setFormData({ ...initialFormData });
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <div className="relative mx-auto mt-2 mb-24 max-w-7xl overflow-hidden">
      {/* Image */}
      <div className="lg:absolute lg:inset-0 lg:left-1/2 lg:pl-4">
        <Image
          width={640}
          height={850}
          alt=""
          src="/category/pouring-beer-into-mug.webp"
          className="h-64 w-full bg-gray-800 object-cover sm:h-80 lg:absolute lg:h-full"
        />
      </div>

      <div className="pt-12 sm:pt-24 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-2">
        <div className="px-6">
          <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
            {/* Main title */}
            <h1 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {t.title}
            </h1>

            {/* Subtitle + wholesale link */}
            <p className="mt-4 text-base/8 text-gray-400">
              {t.subtitle}{" "}
              <Link
                href={`/${lang}/wholesale`}
                className="border-b border-gray-400 text-gray-300 transition-colors hover:border-yellow-400 hover:text-yellow-400"
              >
                {t.wholesaleLink}
              </Link>
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="mt-12">
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                {/* First name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="text-base tracking-wide text-gray-400"
                  >
                    {t.firstname}
                  </label>

                  <div className="mt-2.5">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      aria-invalid={!!errors.firstName}
                      aria-describedby={
                        errors.firstName ? "firstName-error" : undefined
                      }
                      className={`w-full border-b ${
                        errors.firstName
                          ? "border-red-500"
                          : "border-gray-400/50"
                      } bg-transparent pb-1 text-white outline-none`}
                    />

                    {errors.firstName && (
                      <p
                        id="firstName-error"
                        className="mt-1 text-sm text-red-400"
                      >
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Last name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="text-base tracking-wide text-gray-400"
                  >
                    {t.lastname}
                  </label>

                  <div className="mt-2.5">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      aria-invalid={!!errors.lastName}
                      aria-describedby={
                        errors.lastName ? "lastName-error" : undefined
                      }
                      className={`w-full border-b ${
                        errors.lastName
                          ? "border-red-500"
                          : "border-gray-400/50"
                      } bg-transparent pb-1 text-white outline-none`}
                    />

                    {errors.lastName && (
                      <p
                        id="lastName-error"
                        className="mt-1 text-sm text-red-400"
                      >
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="text-base tracking-wide text-gray-400"
                  >
                    {t.emailLabel}
                  </label>

                  <div className="mt-2.5">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      aria-invalid={!!errors.email}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                      className={`w-full border-b ${
                        errors.email ? "border-red-500" : "border-gray-400/50"
                      } bg-transparent pb-1 text-white outline-none`}
                    />

                    {errors.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="company"
                    className="text-base tracking-wide text-gray-400"
                  >
                    {t.company}
                  </label>

                  <div className="mt-2.5">
                    <input
                      id="company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full border-b border-gray-400/50 bg-transparent pb-1 text-white outline-none"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between text-sm/6">
                    <label
                      htmlFor="phone"
                      className="text-base tracking-wide text-gray-400"
                    >
                      {t.phone}
                    </label>

                    <p id="phone-description" className="text-gray-500">
                      {t.optional}
                    </p>
                  </div>

                  <div className="mt-2.5">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      aria-invalid={!!errors.phone}
                      aria-describedby={
                        errors.phone
                          ? "phone-description phone-error"
                          : "phone-description"
                      }
                      className={`w-full border-b ${
                        errors.phone ? "border-red-500" : "border-gray-400/50"
                      } bg-transparent pb-1 text-white outline-none`}
                    />

                    {errors.phone && (
                      <p id="phone-error" className="mt-1 text-sm text-red-400">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between text-sm/6">
                    <label
                      htmlFor="message"
                      className="text-base tracking-wide text-gray-400"
                    >
                      {t.message}
                    </label>

                    <p id="message-description" className="text-gray-500">
                      {t.messageLimit}
                    </p>
                  </div>

                  <div className="mt-2.5">
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      maxLength={500}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      aria-invalid={!!errors.message}
                      aria-describedby={
                        errors.message
                          ? "message-description message-error"
                          : "message-description"
                      }
                      className={`mt-2 w-full rounded-md border ${
                        errors.message ? "border-red-500" : "border-gray-400/40"
                      } bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500`}
                    />

                    {errors.message && (
                      <p
                        id="message-error"
                        className="mt-1 text-sm text-red-400"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="mt-10 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-base font-semibold text-gray-900 duration-300 hover:border-yellow-600 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto lg:w-full"
                >
                  {isSubmitting ? t.submitting : t.submit}
                </button>
              </div>

              {/* Success */}
              {submitStatus === "success" && (
                <div
                  role="status"
                  className="mt-8 rounded-md border border-green-500/50 bg-green-500/10 p-4"
                >
                  <p className="text-sm text-green-400">{t.success}</p>
                </div>
              )}

              {/* Error */}
              {submitStatus === "error" && (
                <div
                  role="alert"
                  className="mt-8 rounded-md border border-red-500/50 bg-red-500/10 p-4"
                >
                  <p className="text-sm text-red-400">{t.error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
