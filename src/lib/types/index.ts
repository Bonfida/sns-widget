import type { CSSProperties, ReactNode } from "react";
import type { Connection, PublicKey } from "@solana/web3.js";
import type {
  WalletName,
  SignerWalletAdapterProps,
} from "@solana/wallet-adapter-base";
import type { Wallet } from "@solana/wallet-adapter-react";

export interface WalletPassThroughProps {
  publicKey: PublicKey | null | undefined;
  wallets: Wallet[];
  wallet: Wallet | null;
  connect: () => Promise<void>;
  select: (walletName: WalletName) => void;
  connecting: boolean;
  connected: boolean;
  disconnect: () => Promise<void>;
  signAllTransactions:
    | SignerWalletAdapterProps["signAllTransactions"]
    | undefined;

  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export type WidgetProps = (EndpointOnly | ConnectionOnly) & CommonProps;

interface EndpointOnly {
  endpoint: string;
  connection?: never;
}

interface ConnectionOnly {
  endpoint?: never;
  connection: Connection;
}

interface CommonProps {
  // Props to pass through to the wallet component for additional configuration
  passthroughWallet?: WalletPassThroughProps;
  // Raw CSS class names to apply to the widget container for custom styling
  containerClassNames?: string;
  // Inline styles to apply to the widget container
  containerStyles?: CSSProperties;
  // Raw CSS class names to apply to the root wrapper of the widget for custom styling
  rootWrapperClassNames?: string;
  // Inline styles to apply to the root wrapper of the widget
  rootWrapperStyles?: CSSProperties;
  // Toggles the dark mode appearance of the widget
  isDark?: boolean;
  // Public Key for referral tracking to create a share of the transaction for the referrer
  referrerKey?: PublicKey;
  // React node to display a partner’s logo within the widget interface
  partnerLogo?: ReactNode;
}
