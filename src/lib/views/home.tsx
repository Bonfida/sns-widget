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
  const domains = useSearch({ connection: connection!, domain: searchQuery });
  const suggestions = useDomainSuggestions({
    connection: connection!,
    domain: searchQuery,
  });
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
        "flex flex-col w-[93svw] h-[560px] max-h-[75svh] max-w-[400px] bg-background-primary rounded-lg absolute bottom-16 right-0 text-text-primary overflow-auto",
        "shadow-xl dark:border dark:border-interactive-border",
        className,
      )}
      style={style}
      aria-label="SNS widget allows you to quickly search and buy .sol domains"
    >
      {status && <GlobalStatusCard status={status} />}

      <div className="flex items-center px-3 pt-3">
        {!isHomeView && (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-center text-text-primary">
            <span className="h-[26px]">
              <FidaLogo />
            </span>
          </div>
        )}

        <ConnectWalletButton />
      </div>

      <div className="flex flex-col flex-grow overflow-auto">
        {(isHomeView || isSearchView) && (
          <>
            <div
              className={twMerge(
                "translate-y-[80px] transition-all duration-700 px-3",
                isSearchView && "-translate-y-[22px]",
              )}
            >
              <h1
                className={twMerge(
                  "block max-h-[32px] text-2xl font-medium text-center font-primary transition-[opacity] ease-out duration-200",
                  isSearchView && "opacity-0 invisible",
                  finished && "max-h-0",
                )}
                onTransitionEnd={() => {
                  if (isSearchView) toggleTransitionFinish(true);
                }}
              >
                Secure a custom domain
              </h1>

              <form className="flex gap-2 mt-10" onSubmit={search}>
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
                  className="
                    rounded-[10px] bg-theme-primary h-[56px] w-[56px] p-2
                    flex items-center justify-center text-base-button-content
                  "
                  tabIndex={0}
                >
                  <SearchShort width={24} height={24} />
                </button>
              </form>
            </div>

            {isSearchView && (
              <>
                <div className="px-3 mb-3 overflow-auto animate-fade-in">
                  {domains.loading ? (
                    <DomainCardSkeleton />
                  ) : (
                    <>
                      {domains.result?.map((domain) => (
                        <DomainSearchResultRow
                          key={domain.domain}
                          domain={domain.domain}
                          available={domain.available}
                        />
                      ))}
                    </>
                  )}
                  <div className="mt-4">
                    {suggestions.status !== "error" && (
                      <p className="mb-2 ml-4 text-sm text-text-secondary font-primary">
                        You might also like
                      </p>
                    )}

                    <div className="flex flex-col gap-2 pb-14">
                      {suggestions.status === "error" && (
                        <div>
                          <p className="mb-6 text-sm tracking-widest text-center">
                            Looks like we have an issue helping you with domain
                            suggestions.
                          </p>

                          <button
                            type="button"
                            className="m-auto flex items-center gap-2 px-3 h-[32px] w-max py-1 text-xs tracking-wide rounded-lg bg-theme-secondary font-primary text-theme-primary"
                            tabIndex={0}
                            aria-label={`Try load suggestions for ${searchQuery} again`}
                            onClick={() => suggestions.execute()}
                          >
                            Try again '{searchQuery}'
                          </button>

                          <p className="my-6 text-sm tracking-widest text-center">
                            ...and if the problem persists
                          </p>

                          <div className="flex justify-center">
                            <a
                              className="flex items-center gap-2 justify-center text-theme-primary text-[11px] tracking-wider dark:text-theme-secondary"
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
                      {suggestions.loading ? (
                        <>
                          {new Array(5).fill(0).map((_, index) => (
                            <DomainCardSkeleton key={index} />
                          ))}
                        </>
                      ) : (
                        <>
                          {suggestions.result?.map((domain) => (
                            <DomainSearchResultRow
                              key={domain.domain}
                              domain={domain.domain}
                              available={domain.available}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {!isCartEmpty && (
                  <CustomButton
                    className="absolute left-3 right-3 bottom-3 text-base-button-content"
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
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-center text-text-primary">
            Powered by
            <span className="h-[20px] flex">
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
