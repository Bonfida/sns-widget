import type { ComponentPropsWithoutRef } from "react";

export const ExternalLink = (props: ComponentPropsWithoutRef<"svg">) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 4.5h-3A1.5 1.5 0 0 0 3 6v7.5A1.5 1.5 0 0 0 4.5 15H12a1.5 1.5 0 0 0 1.5-1.5v-3m-3-7.5H15m0 0v4.5M15 3l-7.5 7.5"
      />
    </svg>
  );
};
