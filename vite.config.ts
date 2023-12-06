import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
import { type UserConfig, defineConfig } from "vite";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import banner2 from "rollup-plugin-banner2";

const resolvePath = (str: string) => path.resolve(__dirname, str);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const libConfig = {
    build: {
      lib: {
        entry: resolvePath("src/lib/index.tsx"),
        name: "SNS Widget",
        // The exact order is somehow important to prevent `terser` errors.
        formats: ["es", "umd", "cjs"],
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
          "@pythnetwork/client",
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
            "@pythnetwork/client": "@pythnetwork/client",
          },
        },
        plugins: [
          terser({ compress: true }),
          // Need it for Next.js
          banner2(() => `"use client";`),
        ],
      },
    },
    plugins: [
      react(),
      nodePolyfills(),
      babel({ babelHelpers: "bundled" }),
      nodeResolve({ browser: true, preferBuiltins: false }),
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
