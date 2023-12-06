"use client";

import "./index.css";

import { useState, lazy, Suspense } from "react";
import type { WidgetProps, WalletPassThroughProps } from "./types";
import { twMerge } from "tailwind-merge";
import { FidaIcon } from "./components/fida-icon";

const LazyWidget = lazy(() => import("./widget"));

const EntryPoint = ({
  rootWrapperClassNames,
  rootWrapperStyles,
  isDark,
  ...props
}: WidgetProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={twMerge(
        "bonfida-widget-root sns-bw",
        rootWrapperClassNames,
        isDark && "dark",
      )}
      style={rootWrapperStyles}
    >
      <button
        onClick={() => setVisible(!visible)}
        className="w-[50px] h-[50px] rounded-full bg-background-primary overflow-hidden text-text-primary p-2 flex items-center justify-center shadow-xl dark:border dark:border-interactive-border"
        type="button"
        aria-label={visible ? "Close SNS widget" : "Open SNS widget"}
        aria-haspopup="true"
        tabIndex={0}
      >
        <FidaIcon className="w-full h-full" />
      </button>

      {visible && (
        <Suspense>
          <LazyWidget {...props} />
        </Suspense>
      )}
    </div>
  );
};

export type { WidgetProps, WalletPassThroughProps };
export default EntryPoint;
