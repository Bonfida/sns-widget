import { twMerge } from "tailwind-merge";
import { getDomainPriceFromName } from "@bonfida/spl-name-service";
import { ShoppingBasketHorizontal, TrashBent, Tick } from "../components/icons";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../contexts/cart";
import { DomainCardBase } from "./domain-card-base";
export const DomainSearchResultRow = ({
  domain,
  available = false,
  price,
}: {
  domain: string;
  available?: boolean;
  price?: number;
}) => {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  price = price ?? getDomainPriceFromName(domain);
  const isInCart = Boolean(cart[domain]);

  const [showRemoveButton, toggleRemoveButton] = useState(isInCart);

  const remove = (domain: string) => {
    toggleRemoveButton(false);
    removeFromCart(domain);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isInCart && !showRemoveButton) {
      timer = setTimeout(() => {
        toggleRemoveButton(true);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isInCart, showRemoveButton]);

  return (
    <DomainCardBase domain={domain} available={available} price={price}>
      {!available && (
        <div className="rounded-lg bg-accent bg-opacity-10 px-3">
          <span className="text-xs font-semibold leading-6 tracking-widest text-accent">
            Registered
          </span>
        </div>
      )}
      {available && (
        <div
          className={twMerge(
            "flex min-w-[93px] flex-row items-center justify-between",
            available ? "gap-2" : "gap-1",
          )}
        >
          <button
            type="button"
            className={twMerge(
              "flex items-center gap-2 rounded-lg bg-theme-primary px-3 py-1 font-primary text-sm text-base-button-content",
              isInCart &&
                showRemoveButton &&
                "bg-transparent text-theme-primary dark:text-theme-secondary",
            )}
            tabIndex={0}
            onClick={() =>
              isInCart
                ? remove(domain)
                : addToCart({ domain, storage: 1_000, price: Number(price) })
            }
          >
            {!isInCart ? (
              <>
                Add to cart
                <ShoppingBasketHorizontal width={20} height={20} />
              </>
            ) : (
              <>
                {showRemoveButton ? (
                  <>
                    Remove
                    <TrashBent width={24} height={24} />
                  </>
                ) : (
                  <>
                    Added
                    <Tick width={24} height={24} />
                  </>
                )}
              </>
            )}
          </button>
        </div>
      )}
    </DomainCardBase>
  );
};
