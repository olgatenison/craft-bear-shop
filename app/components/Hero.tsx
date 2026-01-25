"use client";
import Image from "next/image";
import { useState } from "react";

type HeroProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref?: string;
  imageUrl?: string;
  videoUrl?: string;
};

export default function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref = "/en/shop",
  imageUrl = "/category/hero.webp",
  videoUrl = "/category/578e8b9f.mp4",
}: HeroProps) {
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative overflow-hidden max-w-7xl mx-auto  rounded-b-0 md:rounded-b-3xl mt-2 mb-12">
      <div className="absolute inset-0">
        {/* ВИДЕО только на lg+ и только если не упало */}
        {videoUrl && !videoError && (
          <video
            key={videoUrl}
            className="hidden lg:block h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={imageUrl}
            onError={() => setVideoError(true)}
            aria-hidden="true"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}

        {/* ФОТО на мобилке всегда + на lg если видео упало */}
        <Image
          src={imageUrl}
          alt=""
          width={640}
          height={480}
          priority
          className={[
            "h-full w-full object-cover",
            // на мобилке показываем всегда
            "block lg:hidden",
            // на lg показываем только если видео не доступно
            videoUrl && !videoError ? "lg:hidden" : "lg:block",
          ].join(" ")}
        />

        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-30  ">
        <div className="pl-0 sm:pl-10 lg:pl-20">
          {" "}
          <p className="mt-6 text-xl text-white/90 max-w-sm text-balance">
            {subtitle}
          </p>
          <h1
            className="max-w-3xl mx-autorelative font-extrabold uppercase leading-none text-balance
               text-transparent transform translate-all duration-300 group-hover:text-yellow-500  text-5xl sm:text-6xl lg:text-7xl/22 
               [-webkit-text-stroke:2px_white] 
               [paint-order:stroke_fill] pt-8 wrap-break-word"
          >
            {title}
          </h1>
          <a
            href={ctaHref}
            className="
            mt-12 inline-block rounded-sm
            bg-stone-950/40 px-6 py-3 text-sm font-medium uppercase text-white
            border-2 border-white
            hover:bg-white hover:text-gray-900
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80
            transition-colors w-full sm:w-sm transform translate-all duration-300
          "
          >
            {ctaLabel}
          </a>{" "}
        </div>
      </div>
    </section>
  );
}
