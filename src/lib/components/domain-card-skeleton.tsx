export const DomainCardSkeleton = () => {
  return (
    <div className="flex h-[72px] animate-pulse flex-row items-center justify-between gap-4 rounded-xl bg-background-secondary px-4 py-3 shadow-domain dark:shadow-none">
      <div className="h-4 w-20 rounded-full bg-background-skeleton"></div>
      <div className="h-4 w-[120px] rounded-full bg-background-skeleton"></div>
    </div>
  );
};
