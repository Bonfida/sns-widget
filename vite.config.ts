import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
import { type UserConfig, defineConfig } from "vite";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import terser from "@rollup/plugin-terser";

const resolvePath = (str: string) => path.resolve(__dirname, str);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const libConfig = {
    build: {
      lib: {
        entry: resolvePath("src/lib/index.tsx"),
        name: "SNS Widget",
        formats: ["es", "cjs", "umd"],
        fileName: (format) =>
          `sns-widget.${
            format === "cjs" ? "cjs" : format === "es" ? "mjs" : "umd.js"
          }`,
      },
      rollupOptions: {
        external: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "@solana/web3.js",
          "@solana/spl-token",
          "@solana/wallet-adapter-react",
          "@solana/wallet-adapter-react-ui",
          "@solana/wallet-adapter-wallets",
          "tailwind-merge",
        ],
        output: {
          // Provide global variables to use in the UMD build for externalized deps
          globals: {
            react: "react",
            "react-dom": "react-dom",
            "react/jsx-runtime": "react/jsx-runtime",
            "@solana/web3.js": "@solana/web3.js",
            "@solana/spl-token": "@solana/spl-token",
            "@solana/wallet-adapter-react": "@solana/wallet-adapter-react",
            "@solana/wallet-adapter-react-ui":
              "@solana/wallet-adapter-react-ui",
            "@solana/wallet-adapter-wallets": "@solana/wallet-adapter-wallets",
            "tailwind-merge": "tailwind-merge",
          },
        },
        plugins: [terser({ compress: true })],
      },
    },
    plugins: [
      react(),
      nodePolyfills(),
      dts({ rollupTypes: true, include: ["src/lib"] }),
    ],
  };
  const previewConfig = {
    base: "/sns-widget/",
    build: {
      outDir: "./preview-build",
    },
    plugins: [react(), nodePolyfills()],
  };

  let buildConfig = {};

  if (mode === "lib" || mode === "production") buildConfig = libConfig;
  if (mode === "preview") buildConfig = previewConfig;

  return {
    server: {
      port: 3000,
    },
    ...buildConfig,
  } as UserConfig;
});
