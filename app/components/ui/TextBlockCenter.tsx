export default function TextBlockCenter({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-7xl py-2 px-6 ">
      <h2 className="text-balance text-3xl md:text-4xl font-semibold tracking-tight text-white sm:text-5xl text-center max-w-3xl mx-auto">
        {title}
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-base md:text-lg/8 text-gray-300 text-center text-balance">
        {subtitle}
      </p>
    </div>
  );
}
