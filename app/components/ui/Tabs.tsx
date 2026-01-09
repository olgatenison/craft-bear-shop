// app/components/ui/Tabs.tsx
"use client";

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  labels?: {
    all: string;
    beer: string;
    draftBeer?: string;
    cider: string;
    snacks: string;
    nonAlcoholic?: string;
    giftsSets?: string;
  };
}

export default function Tabs({
  activeTab,
  onTabChange,
  labels = {
    all: "All Products",
    beer: "Beer",
    draftBeer: "Draft beer",
    cider: "Cider",
    snacks: "Snacks",
    nonAlcoholic: "Non-alcoholic",
    giftsSets: "Gifts & Sets",
  },
}: TabsProps) {
  const tabs = [
    { id: "all", label: labels.all },
    { id: "beer", label: labels.beer },
    { id: "draft-beer", label: labels.draftBeer ?? "Draft beer" },
    { id: "cider", label: labels.cider },
    { id: "non-alcoholic", label: labels.nonAlcoholic ?? "Non-alcoholic" },
    { id: "snacks", label: labels.snacks },
    { id: "gifts-sets", label: labels.giftsSets ?? "Gifts & Sets" },
  ];

  return (
    <div className="mb-4">
      {/* ✅ Phone + Tablet (< md): wrapped chips */}
      <div className="md:hidden">
        <div
          role="tablist"
          aria-label="Shop categories"
          className="flex flex-wrap gap-2"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`
                  rounded-full px-3 py-2 text-sm transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950
                  ${
                    isActive
                      ? "text-yellow-400 border border-yellow-400 bg-yellow-400/10"
                      : "text-gray-300 border border-gray-700 hover:border-gray-500 hover:text-white"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ Desktop (>= md): underline tabs */}
      <div className="hidden md:block">
        <div
          role="tablist"
          aria-label="Shop categories"
          className="flex gap-4 border-b border-gray-700"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`
                  pb-3 px-1 transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950
                  ${
                    isActive
                      ? "text-yellow-400 border-b-2 border-yellow-400"
                      : "text-gray-400 hover:text-white border-b-2 border-transparent"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// // app/components/ui/Tabs.tsx
// "use client";

// interface TabsProps {
//   activeTab: string;
//   onTabChange: (tab: string) => void;
//   labels?: {
//     all: string;
//     beer: string;
//     draftBeer?: string; // ✅ додали
//     cider: string;
//     snacks: string;
//     nonAlcoholic?: string;
//     giftsSets?: string;
//   };
// }

// export default function Tabs({
//   activeTab,
//   onTabChange,
//   labels = {
//     all: "All Products",
//     beer: "Beer",
//     draftBeer: "Draft beer", // ✅ дефолт
//     cider: "Cider",
//     snacks: "Snacks",
//     nonAlcoholic: "Non-alcoholic",
//     giftsSets: "Gifts & Sets",
//   },
// }: TabsProps) {
//   const tabs = [
//     { id: "all", label: labels.all },
//     { id: "beer", label: labels.beer },
//     { id: "draft-beer", label: labels.draftBeer ?? "Draft beer" }, // ✅ новий таб
//     { id: "cider", label: labels.cider },
//     { id: "non-alcoholic", label: labels.nonAlcoholic ?? "Non-alcoholic" },
//     { id: "snacks", label: labels.snacks },
//     { id: "gifts-sets", label: labels.giftsSets ?? "Gifts & Sets" },
//   ];

//   return (
//     <div className="mb-4">
//       <div className="flex gap-4 border-b border-gray-700">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => onTabChange(tab.id)}
//             className={`pb-3 px-1 transition-colors ${
//               activeTab === tab.id
//                 ? "text-yellow-400 border-b-2 border-yellow-400"
//                 : "text-gray-400 hover:text-white"
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }
