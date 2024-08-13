import { InformationCircle } from "../../components/icons";

export const CartError = () => {
  return (
    <div className="flex grow-[0.5] flex-col items-center justify-center gap-6 px-3 text-center">
      <InformationCircle
        width={90}
        height={90}
        className="rotate-180 text-theme-primary text-opacity-60"
      />

      <p className="font-primary text-lg font-bold">Something went wrong</p>

      <p className="font-primary text-sm">Please retry the process</p>
    </div>
  );
};
