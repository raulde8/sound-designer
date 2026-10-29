import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [".next/**", "node_modules/**", "test-results/**", "playwright-report/**", "next-env.d.ts", "catalog/snapshots/**"],
  },
  {
    // O motor é puro: sem React, sem I/O, sem rede.
    files: ["engine/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react-dom", "next", "next/*"], message: "O motor não pode depender de React/Next." },
            { group: ["fs", "node:*", "path", "http", "https"], message: "O motor não pode fazer I/O." },
            { group: ["@/*", "../app/*", "../../app/*"], message: "O motor não pode importar da UI." },
          ],
        },
      ],
      "no-restricted-globals": ["error", "fetch", "localStorage", "window", "document", "XMLHttpRequest"],
      "no-restricted-properties": [
        "error",
        { object: "Math", property: "random", message: "O motor é determinístico." },
        { object: "Date", property: "now", message: "O motor é determinístico. Receba a data como entrada." },
      ],
    },
  },
];

export default config;
