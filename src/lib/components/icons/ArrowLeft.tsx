import { createElement, type ComponentPropsWithoutRef } from "react";

export const ArrowLeft = (props: ComponentPropsWithoutRef<"svg">) => {
  return createElement(
    "svg",
    {
      fill: "none",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      width: "1em",
      height: "1em",
      ...props,
    },
    createElement("path", {
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 1.5,
      d: "m10 8-4 4m0 0 4 4m-4-4h12",
    }),
  );
};
