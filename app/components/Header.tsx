// // app/components/Header.tsx

import type { Locale } from "../lib/locale";
import { getMessages } from "@/app/[lang]/messages";
import HeaderClient from "./HeaderClient";

export default async function Header({ lang }: { lang: Locale }) {
  const messages = await getMessages(lang);
  return <HeaderClient lang={lang} messages={messages} />;
}
