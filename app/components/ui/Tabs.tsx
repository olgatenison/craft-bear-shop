// app/components/ui/Tabs.tsx
"use client";

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  labels?: {
    all: string;
    beer: string;
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
    cider: "Cider",
    snacks: "Snacks",
    nonAlcoholic: "Non-alcoholic",
    giftsSets: "Gifts & Sets",
  },
}: TabsProps) {
  const tabs = [
    { id: "all", label: labels.all },
    { id: "beer", label: labels.beer },
    { id: "cider", label: labels.cider },
    { id: "non-alcoholic", label: labels.nonAlcoholic ?? "Non-alcoholic" },
    { id: "snacks", label: labels.snacks },
    { id: "gifts-sets", label: labels.giftsSets ?? "Gifts & Sets" },
  ];

  return (
    <div className="mb-8">
      <div className="flex gap-4 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 px-1 transition-colors ${
              activeTab === tab.id
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
