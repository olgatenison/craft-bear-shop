import Hero from "@/app/components/Hero";
import { getMessages, type Locale } from "./messages";
import ShopCategory from "../components/ShopCategory";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const t = await getMessages(lang);

  // Пример: если нужен URL магазина с текущей локалью
  const shopHref = `/${lang}/shop`;

  return (
    <main>
      <Hero
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        ctaLabel={t.hero.cta}
        ctaHref={shopHref}
        // imageUrl можешь подменять данными с бэка
      />
      <ShopCategory
        title={t.ShopCategory.title}
        browseAll={t.ShopCategory.browseAll}
        cta={t.ShopCategory.cta}
        names={t.ShopCategory.names}
        alts={t.ShopCategory.alts}
        lang={lang}
      />
    </main>
  );
}
