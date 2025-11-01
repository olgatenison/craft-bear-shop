import Image from "next/image";
type HeroProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref?: string;
  imageUrl?: string; // можешь заменить данными с бэка
};

export default function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref = "/en/shop",
  imageUrl = "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=1600&auto=format&fit=crop",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover opacity-70"
          width={640}
          height={480}
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-white/90">{subtitle}</p>
          <a
            href={ctaHref}
            className="mt-8 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-medium text-gray-900 shadow"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
