import { useState, useContext, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  getDomainPriceFromName,
  registerDomainNameV2,
  REFERRERS,
} from "@bonfida/spl-name-service";
import {
  PublicKey,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import { WalletSignTransactionError } from "@solana/wallet-adapter-base";
import {
  ArrowLeft,
  WalletClose,
  RemoveThin,
  Information,
} from "../../components/icons";
import { DomainCartItem } from "../../components/domain-cart-item";
import { CartContext } from "../../contexts/cart";
import { GlobalStatusContext } from "../../contexts/status-messages";
import { CustomButton } from "../../components/button";
import { BaseModal } from "../../components/modal";
import {
  tokenList,
  FIDA_MINT,
  formatPrice,
  wrapSol,
  unwrapSol,
  chunkIx,
} from "../../utils";
import { usePyth, useWalletBalances } from "../../hooks";
import { useWalletPassThrough } from "../../contexts/wallet-passthrough-provider";
import { CartProcessing } from "./processing";
import { CartSuccess } from "./success";
import { CartError } from "./error";

type Step = 1 | 2 | 3;

interface CartViewProps {
  backHandler: (hard?: boolean) => void;
}

const SIZES_LIST = [
  { label: "1kb", value: 1_000 },
  { label: "2kb", value: 2_000 },
  { label: "3kb", value: 3_000 },
  { label: "4kb", value: 4_000 },
  { label: "5kb", value: 5_000 },
  { label: "6kb", value: 6_000 },
  { label: "7kb", value: 7_000 },
  { label: "8kb", value: 8_000 },
  { label: "9kb", value: 9_000 },
  { label: "10kb", value: 10_000 },
];

export const CartView = ({ backHandler }: CartViewProps) => {
  const pyth = usePyth();
  const { publicKey, connection, signAllTransactions } = useWalletPassThrough();
  const { balances } = useWalletBalances();

  const [step, setStep] = useState<Step>(1);
  const { cart, emptyCart, addToCart, referrerKey } = useContext(CartContext);
  const { setError } = useContext(GlobalStatusContext);
  const [selectedToken, selectToken] = useState(tokenList[0]);
  const [isTokenSelectorOpen, toggleTokenSelector] = useState(false);
  const [selectedStorageDomain, editStorageForDomain] = useState("");

  const [formState, setFormState] = useState<
    "registering" | "processing" | "success" | "error"
  >("registering");

  const isSelectedTokenFIDA = selectedToken.mintAddress === FIDA_MINT;
  const discountMul = isSelectedTokenFIDA ? 0.95 : 1;
  const totalUsd = Object.values(cart).reduce(
    (acc, v) => acc + getDomainPriceFromName(v.domain) * discountMul,
    0,
  );

  useEffect(() => {}, [publicKey, connection]);

  const getTotalPrice = (mintAddress: string) => {
    const price = pyth.result?.get(mintAddress)?.price;

    return totalUsd / (price || 1);
  };

  const getTotalPriceWithDiscount = (mintAddress: string) => {
    const total = getTotalPrice(mintAddress);
    if (mintAddress === FIDA_MINT) return total * 0.95;
    return total;
  };

  useEffect(() => {
    if (!Object.keys(cart).length) {
      backHandler();
    }
  }, [cart, backHandler]);

  const progressWidth: Record<Step, string> = {
    1: "w-[33%]",
    2: "w-[66%]",
    3: "w-full",
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      backHandler();
    }
  };

  const processStep = async () => {
    switch (step) {
      case 2:
        await handle();
        break;
      case 3:
        if (formState === "error") await handle();
        if (formState === "success") {
          emptyCart();
          backHandler(true);
        }
        break;
      default:
        setStep((step + 1) as Step);
        break;
    }
  };

  const selectedTokenTotal = getTotalPriceWithDiscount(
    selectedToken.mintAddress,
  );

  const handle = async () => {
    if (!connection || !publicKey || !signAllTransactions) return;
    if (balances[selectedToken.tokenSymbol] < selectedTokenTotal) {
      setError("You don’t have enough funds");
      return;
    }
    try {
      setFormState("processing");
      let ixs: TransactionInstruction[] = [];

      const buyer = new PublicKey(publicKey);
      const mintKey = new PublicKey(selectedToken.mintAddress);

      const ata = getAssociatedTokenAddressSync(mintKey, buyer);
      for (const item of Object.values(cart)) {
        const ix = await registerDomainNameV2(
          connection,
          item.domain,
          item.storage,
          buyer,
          ata,
          mintKey,
          referrerKey
            ? REFERRERS.find((e) => referrerKey.equals(e))
            : undefined,
        );
        ixs.push(...ix);
      }

      // Wrap/Unwrap SOL
      if (NATIVE_MINT.equals(mintKey)) {
        const wrap = await wrapSol(
          connection,
          ata,
          buyer,
          Math.ceil(selectedTokenTotal * 1.01 * Math.pow(10, 9)),
        );
        const unwrap = unwrapSol(ata, buyer);
        ixs = [...wrap, ...ixs, ...unwrap];
      }

      const chunked = chunkIx(ixs, buyer);
      const { blockhash } = await connection.getLatestBlockhash();
      let txs = chunked.map((e) => new Transaction().add(...e));
      txs.forEach((e) => {
        e.feePayer = buyer;
        e.recentBlockhash = blockhash;
      });

      txs = await signAllTransactions(txs);
      for (const tx of txs) {
        const sig = await connection.sendRawTransaction(tx.serialize());
        await connection.confirmTransaction(sig);
        console.log(sig);
      }

      setFormState("success");
      setStep(3);
    } catch (err) {
      console.error(err);
      if (err instanceof WalletSignTransactionError) {
        setError(err.message);
        setFormState("registering");
        return;
      }
      setStep(3);
      setFormState("error");
    }
  };

  return (
    <div className="flex flex-grow flex-col pb-14">
      <div className="sticky -top-1 flex h-12 items-center justify-center bg-background-primary px-3">
        <button
          type="button"
          tabIndex={0}
          onClick={goBack}
          disabled={formState === "processing"}
          className="absolute left-3 top-0 border-0 p-3 text-theme-primary dark:text-theme-secondary"
        >
          <ArrowLeft width={24} height={24} />
        </button>

        <div className="h-[5px] w-[175px] rounded-md bg-background-interactive bg-gradient-to-r dark:bg-background-secondary">
          <div
            className={twMerge(
              "h-full rounded-md bg-theme-primary transition-[width] duration-500 dark:bg-theme-secondary",
              progressWidth[step],
            )}
          ></div>
        </div>
      </div>
      <div className="body flex flex-grow flex-col pt-6">
        {formState === "success" && <CartSuccess />}
        {formState === "error" && <CartError />}
        {formState === "processing" && <CartProcessing />}
        {formState === "registering" && (
          <>
            {step === 1 && (
              <>
                <p className="mb-2 ml-4 px-3 font-primary text-sm text-text-secondary">
                  You are registering
                </p>

                <div className="flex flex-col gap-2 px-3 pb-4">
                  {Object.values(cart).map((item) => (
                    <DomainCartItem
                      key={item.domain}
                      domain={item.domain}
                      onEdit={() => editStorageForDomain(item.domain)}
                    />
                  ))}
                </div>

                <BaseModal
                  isVisible={!!selectedStorageDomain}
                  toggleVisibility={() => editStorageForDomain("")}
                >
                  {!!selectedStorageDomain && (
                    <div className="p flex w-[320px] flex-col gap-3 rounded-xl bg-background-primary p-4">
                      <p className="flex items-start justify-between font-primary text-lg font-medium">
                        Storage size
                        <button
                          type="button"
                          tabIndex={0}
                          className="-mr-3 -mt-3 p-1"
                          onClick={() => editStorageForDomain("")}
                        >
                          <RemoveThin width={24} height={24} />
                        </button>
                      </p>

                      <div className="text-xs">
                        <p className="mb-2">
                          The storage size will determine the maximum amount of
                          data you can store on your domain.
                        </p>

                        <p className="">
                          <Information
                            width={16}
                            height={16}
                            className="mb-0.5 mr-1 inline text-accent"
                          />
                          Each additional kb of memory costs around 0.007 SOL
                          (0.001 USDC)
                        </p>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {SIZES_LIST.map((size) => {
                          const domain = cart[selectedStorageDomain];
                          // TODO: autofous selected on modal open
                          const selected = size.value === domain?.storage;

                          return (
                            <button
                              type="button"
                              tabIndex={0}
                              key={size.value}
                              className={twMerge(
                                "rounded-lg border-2 border-solid border-theme-primary border-opacity-10 px-2 py-2 text-sm",
                                selected && "border-opacity-100",
                              )}
                              onClick={() => {
                                addToCart({ ...domain, storage: size.value });
                                editStorageForDomain("");
                              }}
                            >
                              {size.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </BaseModal>
              </>
            )}
            {step === 2 && (
              <div className="flex flex-grow flex-col px-3 pb-5">
                <div className="mb-auto">
                  <p className="mb-3 ml-4 font-primary font-medium">Pay with</p>
                  <div>
                    <button
                      type="button"
                      tabIndex={0}
                      className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-interactive-border bg-background-interactive p-4"
                      onClick={() => toggleTokenSelector(!isTokenSelectorOpen)}
                    >
                      <img
                        className="h-4 w-4 rounded-[50%]"
                        src={selectedToken.icon}
                        alt={selectedToken.tokenSymbol}
                      />
                      <span className="tracking-wide text-text-primary">
                        {selectedToken.tokenSymbol}
                      </span>
                      <div className="relative ml-auto flex size-[25px] items-center justify-center">
                        <div
                          className={twMerge(
                            "absolute ml-[5px] h-0.5 w-2 -rotate-[45deg] rounded-sm bg-theme-primary transition-transform duration-200 dark:bg-theme-secondary",
                            isTokenSelectorOpen && "rotate-[45deg]",
                          )}
                        ></div>
                        <div
                          className={twMerge(
                            "absolute -ml-[4px] h-0.5 w-2 rotate-[45deg] rounded-sm bg-theme-primary transition-transform duration-200 dark:bg-theme-secondary",
                            isTokenSelectorOpen && "-rotate-[45deg]",
                          )}
                        ></div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-3 font-primary font-medium">Order summary</p>
                  <div className="mb-2 flex items-start justify-between border-b border-interactive-border text-sm font-medium leading-6">
                    <div>Total</div>
                    <div className="flex flex-col items-end">
                      <span>
                        {formatPrice(selectedTokenTotal, true)}{" "}
                        {selectedToken.tokenSymbol}
                      </span>
                      <span className="text-xs leading-6 text-text-primary text-opacity-60 dark:text-text-secondary">
                        {formatPrice(totalUsd)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between border-b border-interactive-border text-sm font-medium leading-6">
                    <div>Discount</div>
                    <div>{isSelectedTokenFIDA ? "5%" : "0%"}</div>
                  </div>
                </div>

                <BaseModal
                  isVisible={isTokenSelectorOpen}
                  toggleVisibility={toggleTokenSelector}
                >
                  <div className="flex w-[320px] flex-col gap-3 rounded-xl bg-background-primary py-3">
                    {tokenList.map((item) => {
                      const total = getTotalPriceWithDiscount(item.mintAddress);
                      const isNotEnoughFunds =
                        balances[item.tokenSymbol] < total;

                      return (
                        <button
                          key={item.tokenSymbol}
                          type="button"
                          tabIndex={0}
                          disabled={isNotEnoughFunds}
                          className={twMerge(
                            "max-w flex items-center gap-3 px-3 py-1 duration-200",
                            "font-primary transition-[background-color]",
                            selectedToken.mintAddress === item.mintAddress &&
                              "bg-background-tertiary",
                            isNotEnoughFunds && "opacity-40",
                            !isNotEnoughFunds &&
                              "cursor-pointer hover:bg-background-tertiary focus:bg-background-tertiary",
                          )}
                          onClick={() => {
                            selectToken(item);
                            toggleTokenSelector(false);
                          }}
                        >
                          <img
                            src={item.icon}
                            alt={item.tokenSymbol}
                            className="h-6 w-6 rounded-[50%]"
                          />
                          <div className="flex flex-col items-start">
                            <span>{item.tokenSymbol}</span>
                            <span className="flex items-center gap-0.5 text-xs text-text-secondary">
                              <WalletClose width={14} height={14} />
                              {balances[item.tokenSymbol]}
                            </span>
                          </div>
                          <div className="ml-auto flex flex-col text-sm">
                            <span
                              className={twMerge(
                                "tabular-nums",
                                item.mintAddress === FIDA_MINT &&
                                  "line-through",
                              )}
                            >
                              {formatPrice(
                                getTotalPrice(item.mintAddress),
                                true,
                              )}{" "}
                              {item.tokenSymbol}
                            </span>
                            <span className="tabular-nums text-success">
                              {item.mintAddress === FIDA_MINT && (
                                <>
                                  {formatPrice(
                                    getTotalPriceWithDiscount(item.mintAddress),
                                    true,
                                  )}{" "}
                                  FIDA
                                </>
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </BaseModal>
              </div>
            )}
          </>
        )}
      </div>

      {formState === "processing" ? null : (
        <div className="absolute bottom-4 left-3 right-3 flex flex-col gap-2">
          <CustomButton
            className={twMerge(
              "text-base-button-content",
              formState === "error" && "bottom-[70px]",
            )}
            onClick={processStep}
          >
            {step === 1 && "Continue to payment"}
            {step === 2 &&
              formState === "registering" &&
              "Confirm and register"}
            {formState === "success" && "Done"}
            {formState === "error" && "Retry"}
          </CustomButton>

          {formState === "error" && (
            <CustomButton
              className={twMerge("bg-transparent text-theme-primary")}
              onClick={() => backHandler()}
            >
              Close
            </CustomButton>
          )}
        </div>
      )}
    </div>
  );
};
