import { CartContextProvider } from "./contexts/cart";
import type { WidgetProps } from "./types";
import { GlobalStatusContextProvider } from "./contexts/status-messages";
import { SolanaProvider } from "./contexts/solana";
import { WidgetHome } from "./views/home";

const Widget = ({
  endpoint,
  connection,
  passthroughWallet,
  containerClassNames,
  containerStyles,
  referrerCode,
  partnerLogo,
}: WidgetProps) => {
  return (
    <SolanaProvider
      endpoint={endpoint}
      connection={connection}
      passthroughWallet={passthroughWallet}
    >
      <CartContextProvider referrerCode={referrerCode}>
        <GlobalStatusContextProvider>
          <WidgetHome
            className={containerClassNames}
            style={containerStyles}
            partnerLogo={partnerLogo}
          />
        </GlobalStatusContextProvider>
      </CartContextProvider>
    </SolanaProvider>
  );
};

export default Widget;
