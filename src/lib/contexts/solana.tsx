import { ReactNode, useMemo, Fragment } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import type { WalletPassThroughProps } from "../types";
import { WalletPassthroughProvider } from "./wallet-passthrough-provider";
import { ConnectionPassthroughProvider } from "./connection-passthrough-provider";

import "@solana/wallet-adapter-react-ui/styles.css";
import type { Connection } from "@solana/web3.js";

export const SolanaProvider = ({
  children,
  endpoint,
  connection,
  passthroughWallet,
}: {
  endpoint?: string;
  connection?: Connection;
  children: ReactNode;
  passthroughWallet?: WalletPassThroughProps;
}) => {
  const ShouldWrapConnectionProvider = useMemo(() => {
    if (endpoint && !connection) {
      return ({ children }: { children: ReactNode }) => (
        <ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>
      );
    }
    return Fragment;
  }, [endpoint, connection]);

  const ShouldWrapWalletProvider = useMemo(() => {
    if (!passthroughWallet) {
      return ({ children }: { children: ReactNode }) => (
        <WalletProvider wallets={[new SolflareWalletAdapter()]} autoConnect>
          {children}
        </WalletProvider>
      );
    }
    return Fragment;
  }, [passthroughWallet]);

  return (
    <ShouldWrapConnectionProvider>
      <ShouldWrapWalletProvider>
        <WalletModalProvider>
          <ConnectionPassthroughProvider connection={connection}>
            <WalletPassthroughProvider passthroughWallet={passthroughWallet}>
              {children}
            </WalletPassthroughProvider>
          </ConnectionPassthroughProvider>
        </WalletModalProvider>
      </ShouldWrapWalletProvider>
    </ShouldWrapConnectionProvider>
  );
};
