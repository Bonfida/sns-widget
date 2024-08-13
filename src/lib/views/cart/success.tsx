import { CheckMarkCircle } from "../../components/icons";

export const CartSuccess = () => {
  return (
    <div className="flex grow-[0.5] flex-col items-center justify-center gap-6 px-3 text-center">
      <CheckMarkCircle
        width={90}
        height={90}
        className="text-theme-primary text-opacity-60"
      />

      <p className="font-primary text-lg font-bold">
        Congrats on registering your domains!
      </p>

      <p className="font-primary text-sm">
        Head over to
        <a
          href="https://www.sns.id/"
          rel="noopener"
          target="_blank"
          className="mx-1 text-theme-primary"
        >
          sns.id
        </a>
        to learn how to take full advantage of your domains
      </p>
    </div>
  );
};
