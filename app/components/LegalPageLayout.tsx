// app/components/LegalPageLayout.tsx
import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  title: string;
  html?: string; // HTML из Shopify
  children?: ReactNode; // на всякий случай, если захочешь писать руками
};

export function LegalPageLayout({
  title,
  html,
  children,
}: LegalPageLayoutProps) {
  //   console.log(html);

  return (
    <div className="lg:py-20 w-full mx-auto py-6">
      <div className="">
        <h1 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:mb-16 mb-4 text-center md:text-left">
          {title}
        </h1>

        <div className=" text-gray-300 text-base/7">
          {html ? (
            //           <div
            //             className="
            //   prose prose-invert max-w-none w-full text-balance
            //   prose-headings:text-white
            //   prose-a:text-indigo-400
            //   prose-strong:text-white

            //   [&_p]:my-6 [&_p]:text-gray-300

            //   [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-10 [&_ul]:text-gray-300
            //   [&_ul>li]:py-0 [&_ul>li]:my-2
            //   [&_ul>li>p]:my-0

            //   [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-10 [&_ol]:text-gray-300
            //   [&_ol>li]:my-2
            //   [&_ol>li>p]:my-0

            //   [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:my-10 [&_h2]:text-white
            //   [&_h3]:text-lg  [&_h3]:font-semibold [&_h3]:my-8  [&_h3]:text-white [&_h3]:max-w-2xl
            // "
            //             dangerouslySetInnerHTML={{ __html: html }}
            //           />
            <div
              className="
    prose prose-invert max-w-none w-full
    prose-headings:text-white
    prose-a:text-indigo-400
    prose-strong:text-white

    text-balance

    columns-1 md:columns-2
    gap-16
    [column-fill:balance]

    [&_p]:my-6 [&_p]:text-gray-300

    [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-gray-300
    [&_ul>li]:py-0 [&_ul>li]:my-2
    [&_ul>li>p]:my-0

    [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-gray-300
    [&_ol>li]:my-2
    [&_ol>li>p]:my-0

    [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:my-10 [&_h2]:text-white
    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-8 [&_h3]:text-white
  "
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
