import { InformationCircle } from "../components/icons";
import { useContext, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { GlobalStatus, GlobalStatusContext } from "../contexts/status-messages";

export const GlobalStatusCard = ({ status }: { status: GlobalStatus }) => {
  const { setStatus } = useContext(GlobalStatusContext);

  useMemo(() => {
    setTimeout(() => {
      setStatus(null);
    }, 4000);
  }, [setStatus]);

  return (
    <div
      className={twMerge(
        "bg-background-primary dark:border dark:border-interactive-border",
        "shadow-xl dark:shadow-none",
        "absolute left-3 right-3 top-2.5 z-10 flex gap-2 overflow-hidden rounded-lg px-4 py-3",
      )}
    >
      <div
        className={twMerge(
          "absolute left-0 right-0 top-0 h-0.5 animate-width-to-zero",
          status.status === "error" && "bg-error",
          status.status === "success" && "bg-success",
        )}
      ></div>
      <button
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center"
        type="button"
        tabIndex={0}
        onClick={() => setStatus(null)}
      >
        <div className="absolute h-px w-4 rotate-45 bg-text-primary"></div>
        <div className="absolute h-px w-4 -rotate-45 bg-text-primary"></div>
      </button>
      {status.status === "error" && (
        <InformationCircle
          width={20}
          height={20}
          className="mt-0.5 shrink-0 rotate-180 text-error"
        />
      )}
      <span className="font-primary font-medium">{status.message}</span>
    </div>
  );
};
