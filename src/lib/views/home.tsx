import {
  type FormEvent,
  useState,
  useContext,
  type CSSProperties,
} from "react";
import { useSearch, useDomainSuggestions } from "@bonfida/sns-react";
import { InputField } from "../components/input-field";
import { Discord, ExternalLink, SearchShort } from "../components/icons";
import { twMerge } from "tailwind-merge";
import { CartContext } from "../contexts/cart";
import { DomainSearchResultRow } from "../components/domain-search-result-row";
import { DomainCardSkeleton } from "../components/domain-card-skeleton";
import { CustomButton } from "../components/button";
import { FidaLogo } from "../components/fida-logo";
import { CartView } from "./cart";
import { useWalletPassThrough } from "../contexts/wallet-passthrough-provider";
import { sanitize } from "../utils";
import { ConnectWalletButton } from "../components/connect-wallet-button";
import { GlobalStatusCard } from "../components/global-status";
import { GlobalStatusContext } from "../contexts/status-messages";
import { WidgetProps } from "..";

type Views = "home" | "search" | "cart";

export const WidgetHome = ({
  className,
  style,
  partnerLogo,
}: {
  className?: string;
  style?: CSSProperties;
  partnerLogo?: WidgetProps["partnerLogo"];
} = {}) => {
  const {
    connected,
    setVisible,
    visible: isWalletSelectorVisible,
    connection,
  } = useWalletPassThrough();
  const [currentView, setCurrentView] = useState<Views>("home");
  const [finished, toggleTransitionFinish] = useState(false);
  const [invalidSearchQuery, setInvalidSearchQuery] = useState(false);
  const [searchInput, updateSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { isCartEmpty } = useContext(CartContext);
  const { status } = useContext(GlobalStatusContext);
  const domains = useSearch({
    connection: connection!,
    domain: searchQuery,
  });
  const suggestions = useDomainSuggestions(connection!, searchQuery);
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const onSearchQueryUpdate = (value: string) => {
    setInvalidSearchQuery(false);
    if (timeoutId) clearTimeout(timeoutId);

    updateSearchInput(
      sanitize({
        value,
        prev: searchInput,
        onError: () => {
          setInvalidSearchQuery(true);

          const timeoutId = setTimeout(() => {
            setInvalidSearchQuery(false);
          }, 3000);

          setTimeoutId(timeoutId);
        },
      }),
    );
  };

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentView("search");
    setSearchQuery(searchInput);
  };

  const resetView = (hard = false) => {
    if (hard) {
      setSearchQuery("");
      updateSearchInput("");
      toggleTransitionFinish(false);
      setCurrentView("home");
    } else {
      setCurrentView("search");
    }
  };

  const isHomeView = currentView === "home";
  const isSearchView = currentView === "search";
  const isCartView = currentView === "cart";

  return (
    <div
      className={twMerge(
        "absolute bottom-16 right-0 flex h-[560px] max-h-[75svh] w-[93svw] max-w-[400px] flex-col overflow-auto rounded-lg bg-background-primary text-text-primary",
        "shadow-xl dark:border dark:border-interactive-border",
        className,
      )}
      style={style}
      aria-label="SNS widget allows you to quickly search and buy .sol domains"
    >
      {status && <GlobalStatusCard status={status} />}

      <div className="flex items-center px-3 pt-3">
        {!isHomeView && (
          <div className="flex items-center justify-center gap-2 text-center text-sm font-medium text-text-primary">
            <span className="h-[26px]">
              <FidaLogo />
            </span>
          </div>
        )}

        <ConnectWalletButton />
      </div>

      <div className="flex flex-grow flex-col overflow-auto">
        {(isHomeView || isSearchView) && (
          <>
            <div
              className={twMerge(
                "translate-y-[80px] px-3 transition-all duration-700",
                isSearchView && "-translate-y-[22px]",
              )}
            >
              <h1
                className={twMerge(
                  "block max-h-8 text-center font-primary text-2xl font-medium transition-[opacity] duration-200 ease-out",
                  isSearchView && "invisible opacity-0",
                  finished && "max-h-0",
                )}
                onTransitionEnd={() => {
                  if (isSearchView) toggleTransitionFinish(true);
                }}
              >
                Secure a custom domain
              </h1>

              <form className="mt-10 flex gap-2" onSubmit={search}>
                <InputField
                  value={searchInput}
                  placeholder="Search your domain"
                  autoCapitalize="off"
                  spellCheck="false"
                  enterKeyHint="search"
                  className="shadow-input-field dark:shadow-none"
                  type="search"
                  required
                  errorMessage={
                    invalidSearchQuery ? "Character not allowed" : undefined
                  }
                  onChange={(e) => onSearchQueryUpdate(e.target.value)}
                />

                <button
                  className="flex size-[56px] items-center justify-center rounded-[10px] bg-theme-primary p-2 text-base-button-content"
                  tabIndex={0}
                >
                  <SearchShort width={24} height={24} />
                </button>
              </form>
            </div>

            {isSearchView && (
              <>
                <div className="mb-3 animate-fade-in overflow-auto px-3">
                  {domains.isLoading ? (
                    <DomainCardSkeleton />
                  ) : (
                    <>
                      {domains.data?.map(
                        (domain: { domain: string; available: boolean }) => (
                          <DomainSearchResultRow
                            key={domain.domain}
                            domain={domain.domain}
                            available={domain.available}
                          />
                        ),
                      )}
                    </>
                  )}
                  <div className="mt-4">
                    {suggestions.status !== "error" && (
                      <p className="mb-2 ml-4 font-primary text-sm text-text-secondary">
                        You might also like
                      </p>
                    )}

                    <div className="flex flex-col gap-2 pb-14">
                      {suggestions.status === "error" && (
                        <div>
                          <p className="mb-6 text-center text-sm tracking-widest">
                            Looks like we have an issue helping you with domain
                            suggestions.
                          </p>

                          <button
                            type="button"
                            className="m-auto flex h-8 w-max items-center gap-2 rounded-lg bg-theme-secondary px-3 py-1 font-primary text-xs tracking-wide text-theme-primary"
                            tabIndex={0}
                            aria-label={`Try load suggestions for ${searchQuery} again`}
                            onClick={() => suggestions.refetch()}
                          >
                            Try again '{searchQuery}'
                          </button>

                          <p className="my-6 text-center text-sm tracking-widest">
                            ...and if the problem persists
                          </p>

                          <div className="flex justify-center">
                            <a
                              className="flex items-center justify-center gap-2 text-[11px] tracking-wider text-theme-primary dark:text-theme-secondary"
                              href="https://discord.bonfida.org"
                              target="_blank"
                              rel="noopener"
                            >
                              <Discord width={24} />
                              Tell us on discord
                              <ExternalLink width={18} />
                            </a>
                          </div>
                        </div>
                      )}
                      {suggestions.isLoading ? (
                        <>
                          {new Array(5).fill(0).map((_, index) => (
                            <DomainCardSkeleton key={index} />
                          ))}
                        </>
                      ) : (
                        <>
                          {suggestions.data?.map(
                            (domain: {
                              domain: string;
                              available: boolean;
                            }) => (
                              <DomainSearchResultRow
                                key={domain.domain}
                                domain={domain.domain}
                                available={domain.available}
                              />
                            ),
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {!isCartEmpty && (
                  <CustomButton
                    className="absolute bottom-3 left-3 right-3 text-base-button-content"
                    onClick={() => {
                      if (connected) setCurrentView("cart");
                      else setVisible(!isWalletSelectorVisible);
                    }}
                  >
                    {connected ? "Go to cart" : "Connect your wallet"}
                  </CustomButton>
                )}
              </>
            )}
          </>
        )}

        {isCartView && <CartView backHandler={resetView} />}
      </div>

      {isHomeView && (
        <div className="p-3">
          <div className="flex items-center justify-center gap-2 text-center text-sm font-medium text-text-primary">
            Powered by
            <span className="flex h-5">
              <FidaLogo />
            </span>
            {partnerLogo && (
              <>
                <span>x</span>
                <span className="flex">{partnerLogo}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
