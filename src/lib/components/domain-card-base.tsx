import type { ReactNode } from "react";
import { abbreviate, tokenIconBySymbol } from "../utils";

export const DomainCardBase = ({
  domain,
  available = false,
  price,
  children,
}: {
  domain: string;
  available?: boolean;
  price?: number | string;
  children: ReactNode;
}) => {
  return (
    <div className="flex min-h-[72px] flex-row items-center gap-4 rounded-xl bg-background-secondary px-4 py-3 shadow-domain dark:shadow-none">
      <div className="mr-auto flex flex-col">
        <span className="text-content-secondary font-primary text-base">
          {abbreviate(`${domain}.sol`, 25, 3)}
        </span>
        {available && (
          <span className="flex items-center gap-1 text-sm font-medium">
            <img className="h-4 w-4" src={tokenIconBySymbol("USDC")} alt="$" />
            {price}
          </span>
        )}
      </div>

      {children}
    </div>
  );
};
