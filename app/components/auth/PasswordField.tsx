// app/components/auth/PasswordField.tsx

"use client";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;

  showPassword: boolean;
  onToggleShow: () => void;

  autoComplete?: string;
  hint?: string;

  showPasswordLabel: string;
  hidePasswordLabel: string;
};

export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
  autoComplete,
  hint,
  showPasswordLabel,
  hidePasswordLabel,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm/6 font-medium text-gray-300">
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            block w-full rounded-md bg-white
            px-3 py-1.5 pr-11
            text-base text-gray-900
            outline-1 -outline-offset-1 outline-gray-300
            placeholder:text-gray-400
            focus:outline-2
            focus:-outline-offset-2
            focus:outline-indigo-600
            sm:text-sm/6
          "
        />

        <button
          type="button"
          onClick={onToggleShow}
          aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
          className="
            absolute right-3 top-1/2
            -translate-y-1/2
            flex h-6 w-6
            items-center justify-center
            border-0 bg-transparent p-0
            text-gray-500
            transition-colors
            hover:text-gray-800
            focus:outline-none
            focus:ring-0
            active:bg-transparent
          "
        >
          {showPassword ? (
            // Eye off
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 002.8 2.8" />
              <path d="M9.9 4.24A9.77 9.77 0 0112 4c5.5 0 9 5 9 5a15.7 15.7 0 01-2.2 2.8" />
              <path d="M6.7 6.7C4.4 8.2 3 10 3 10s3.5 5 9 5a9.8 9.8 0 004.1-.9" />
            </svg>
          ) : (
            // Eye
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-5 10-5 10 5 10 5-3.5 5-10 5S2 12 2 12z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          )}
        </button>
      </div>

      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
