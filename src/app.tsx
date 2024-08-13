import { ReactNode, useState } from "react";
import { WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import {
  SolflareWalletAdapter,
  Coin98WalletAdapter,
  CloverWalletAdapter,
  TorusWalletAdapter,
  MathWalletAdapter,
  CoinbaseWalletAdapter,
  HuobiWalletAdapter,
  BitKeepWalletAdapter,
  NekoWalletAdapter,
  TrustWalletAdapter,
  SalmonWalletAdapter,
  NightlyWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { FoxWalletWalletAdapter } from "@foxwallet/wallet-adapter-foxwallet";
import {
  WalletModalProvider,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import Widget from "./lib";

import "./index.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const PUBLIC_RPC = import.meta.env.VITE_PUBLIC_RPC as string;

const SolanaProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WalletProvider
      autoConnect
      wallets={[
        new SolflareWalletAdapter(),
        new TorusWalletAdapter(),
        new MathWalletAdapter(),
        new Coin98WalletAdapter(),
        new CloverWalletAdapter(),
        new HuobiWalletAdapter(),
        new CoinbaseWalletAdapter(),
        new BitKeepWalletAdapter(),
        new NekoWalletAdapter(),
        new TrustWalletAdapter(),
        new NightlyWalletAdapter(),
        new SalmonWalletAdapter(),
        new FoxWalletWalletAdapter(),
      ]}
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
};

const Content = () => {
  const wallet = useWallet();
  const { visible, setVisible } = useWalletModal();
  const [isDark, toggleDark] = useState(false);

  return (
    <div className="p-10">
      <h1 className="text-white text-center text-[40px] font-medium">
        SNS Widget Demo
      </h1>

      <div className="mt-10">
        <button
          className="bg-white rounded-3xl p-3 font-medium"
          onClick={() => toggleDark(!isDark)}
        >
          Toggle dark
        </button>
      </div>

      <Widget
        endpoint={PUBLIC_RPC}
        passthroughWallet={{ ...wallet, visible, setVisible }}
        isDark={isDark}
      />
    </div>
  );
};

function App() {
  return (
    <SolanaProvider>
      <Content />
    </SolanaProvider>
  );
}

export default App;
