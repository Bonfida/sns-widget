import { InputHTMLAttributes, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { RemoveThin } from "../components/icons";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string;
  onClear?: () => void;
}

export const InputField = ({
  type = "text",
  value,
  className,
  errorMessage,
  onClear,
  ...params
}: InputProps = {}) => {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={twMerge("flex-grow", type === "search" && "relative")}>
      <input
        {...params}
        ref={input}
        value={value}
        className={twMerge(
          "h-full w-full text-ellipsis rounded-xl border border-field-border border-opacity-25 bg-background-secondary px-3 py-4 text-sm dark:border-interactive-border",
          className,
          type === "search" && "pr-8",
        )}
        type={type === "search" ? "text" : type}
      />

      {type === "search" && value && onClear && (
        <button
          type="button"
          className="absolute right-1 top-3 p-1"
          aria-label="Clear"
          tabIndex={0}
          onClick={() => {
            onClear();
            input.current?.focus();
          }}
        >
          <RemoveThin width={24} height={24} />
        </button>
      )}

      {errorMessage && (
        <p className="absolute top-[calc(100%+4px)] animate-[fade-in_300ms_ease-out] pl-3 text-xs font-medium tracking-widest text-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
