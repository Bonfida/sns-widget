import { type ReactNode, createContext } from "react";
import { useSessionStorageState } from "ahooks";
import type { WidgetProps } from "../types";
import type { PublicKey } from "@solana/web3.js";

interface CartItem {
  domain: string;
  storage: number;
  price: number;
}

type Domain = string;
type Cart = Record<Domain, CartItem>;

export interface CartContextValue {
  cart: Cart;
  isCartEmpty: boolean;
  addToCart: (x: CartItem) => void;
  emptyCart: () => void;
  removeFromCart: (x: Domain) => void;
  referrerCode?: PublicKey;
}

export const CartContext = createContext<CartContextValue>({
  cart: {},
  isCartEmpty: true,
  addToCart: () => {},
  emptyCart: () => {},
  removeFromCart: () => {},
  referrerCode: undefined,
});

export const CartContextProvider = ({
  children,
  referrerCode,
}: {
  children?: ReactNode;
  referrerCode?: WidgetProps["referrerCode"];
} = {}) => {
  const [cart = {}, updateCart] = useSessionStorageState<Cart>(
    "bonfida-widget-cart",
    {
      defaultValue: {},
    },
  );

  const addToCart = (item: CartItem) => {
    updateCart({
      ...cart,
      [item.domain]: item,
    });
  };

  const removeFromCart = (domain: Domain) => {
    const tempCart = { ...cart };
    delete tempCart[domain];
    updateCart(tempCart);
  };

  const emptyCart = () => updateCart({});

  const isCartEmpty = !Object.values(cart).length;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        isCartEmpty,
        emptyCart,
        referrerCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
