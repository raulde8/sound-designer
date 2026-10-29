// Servidor estático mínimo para testar o build (`out/`). Uso: node scripts/serve-static.mjs [porta]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(fileURLToPath(new URL(".", import.meta.url)), "..", "out");
const porta = Number(process.argv[2] ?? 3100);
const tipos = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain", ".woff2": "font/woff2" };

createServer(async (req, res) => {
  try {
    const caminho = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
    let arq = normalize(join(raiz, caminho));
    if (!arq.startsWith(raiz)) throw new Error("fora");
    const s = await stat(arq).catch(() => null);
    if (s?.isDirectory()) arq = join(arq, "index.html");
    else if (!s) arq = (await stat(arq + ".html").catch(() => null)) ? arq + ".html" : join(raiz, "404.html");
    const corpo = await readFile(arq);
    res.writeHead(arq.endsWith("404.html") && !caminho.endsWith("404.html") ? 404 : 200, { "content-type": tipos[extname(arq)] ?? "application/octet-stream" });
    res.end(corpo);
  } catch {
    res.writeHead(404);
    res.end("404");
  }
}).listen(porta, () => console.log(`http://localhost:${porta}`));
