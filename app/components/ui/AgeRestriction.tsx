type AgeRestrictionProps = {
  message: string;
};

export function AgeRestriction({ message }: AgeRestrictionProps) {
  return (
    <div className="flex max-w-[325px] items-center gap-4 border border-yellow-400 bg-[#140706]/20 px-4 py-4 my-10">
      <span className="shrink-0 text-[22px] font-bold leading-none text-yellow-400">
        18+
      </span>

      <span className="text-[13px] leading-[1.45] text-yellow-400">
        {message}
      </span>
    </div>
  );
}
