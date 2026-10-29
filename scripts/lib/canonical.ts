import { createHash } from "node:crypto";

/** JSON com chaves ordenadas, para hash estável. */
export function jsonCanonico(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(jsonCanonico).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o)
    .filter((k) => o[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${jsonCanonico(o[k])}`)
    .join(",")}}`;
}

export function hashConteudo(v: unknown): string {
  return createHash("sha256").update(jsonCanonico(v)).digest("hex").slice(0, 16);
}
