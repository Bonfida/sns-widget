export const CartProcessing = () => {
  return (
    <div className="flex grow flex-col items-center justify-center gap-10">
      <div className="size-[76px] animate-spin rounded-full border-4 border-theme-secondary border-t-theme-primary"></div>
      <span className="max-w-[225px] text-center font-primary font-medium tracking-wider">
        Your transaction is being processed...
      </span>
    </div>
  );
};
