import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  referrerKey,
  partnerLogo,
}: WidgetProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 1_000 * 10 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider
        endpoint={endpoint}
        connection={connection}
        passthroughWallet={passthroughWallet}
      >
        <CartContextProvider referrerKey={referrerKey}>
          <GlobalStatusContextProvider>
            <WidgetHome
              className={containerClassNames}
              style={containerStyles}
              partnerLogo={partnerLogo}
            />
          </GlobalStatusContextProvider>
        </CartContextProvider>
      </SolanaProvider>
    </QueryClientProvider>
  );
};

export default Widget;
