// import "server-only";

// const loaders = {
//   en: () => import("../messages/en.json").then((m) => m.default),
//   et: () => import("../messages/et.json").then((m) => m.default),
//   fi: () => import("../messages/fi.json").then((m) => m.default),
//   uk: () => import("../messages/uk.json").then((m) => m.default),
//   ru: () => import("../messages/ru.json").then((m) => m.default),
// } as const;

// export type Locale = keyof typeof loaders;

// export const getMessages = async (locale: Locale) => {
//   const load = loaders[locale] ?? loaders.en; // фолбек
//   return load();
// };

import "server-only";

const loaders = {
  en: () => import("../messages/en.json").then((m) => m.default),
  et: () => import("../messages/et.json").then((m) => m.default),
  fi: () => import("../messages/fi.json").then((m) => m.default),
  uk: () => import("../messages/uk.json").then((m) => m.default),
  ru: () => import("../messages/ru.json").then((m) => m.default),
} as const;

export type Locale = keyof typeof loaders;

export const getMessages = async (locale: Locale) => {
  const load = loaders[locale] ?? loaders.en; // фолбек
  return load();
};
