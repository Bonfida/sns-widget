import { useState } from "react";
import { WalletClose, DirectionDown } from "../components/icons";
import { useWalletPassThrough } from "../contexts/wallet-passthrough-provider";
import { abbreviate } from "../utils";
import { twMerge } from "tailwind-merge";

export const ConnectWalletButton = () => {
  const { visible, setVisible, connected, publicKey, disconnect } =
    useWalletPassThrough();

  const [isDropdownVisible, toggleDropdown] = useState(false);

  const handleClick = () => {
    if (!connected) {
      setVisible(!visible);
    } else {
      toggleDropdown(!isDropdownVisible);
    }
  };

  const onDisconnect = () => {
    disconnect();
    toggleDropdown(false);
  };

  return (
    <div className="relative ml-auto flex">
      <button
        type="button"
        className="relative flex h-8 items-center gap-2 rounded-lg bg-theme-secondary px-3 py-1 font-primary text-xs tracking-wide text-theme-primary"
        tabIndex={0}
        aria-label="Connect wallet"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <WalletClose width={16} height={16} />
        {connected ? abbreviate(publicKey?.toString(), 8, 4) : "Connect wallet"}
        {connected && (
          <DirectionDown
            className={twMerge(
              "transition-transform",
              isDropdownVisible && "rotate-180",
            )}
          />
        )}
      </button>

      <button
        type="button"
        tabIndex={0}
        aria-label="Disconnect wallet"
        className={twMerge(
          !isDropdownVisible && "invisible -translate-y-1 opacity-0",
          "absolute left-0 right-0 top-full z-10 h-12 w-full",
          "transition-[transform,opacity] duration-300",
          "flex items-center justify-center rounded-xl bg-background-secondary text-base text-text-primary",
          "shadow-domain dark:border dark:border-interactive-border dark:shadow-none",
          "active:opacity-70 active:transition-none",
        )}
        onClick={onDisconnect}
      >
        Disconnect
      </button>
    </div>
  );
};
