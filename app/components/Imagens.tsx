/**
 * Ilustrações genéricas (SVG inline). Não são fotos de produtos: servem para o usuário reconhecer o tipo de equipamento.
 */

export type TipoImagem =
  | "caixa"
  | "coluna"
  | "sub"
  | "monitor"
  | "micMao"
  | "micSemFio"
  | "headset"
  | "kitBateria"
  | "mesa"
  | "inEar"
  | "di"
  | "cabo"
  | "pedestal"
  | "regua"
  | "multicabo"
  | "caixaPequena";

const base = { viewBox: "0 0 64 64", fill: "none", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function Imagem({ tipo, tamanho = 56, titulo }: { tipo: TipoImagem; tamanho?: number; titulo?: string }) {
  const st = { stroke: "var(--ink)" };
  const ac = "var(--accent)";
  const soft = "var(--accent-soft)";
  const c = (() => {
    switch (tipo) {
      case "caixa":
      case "caixaPequena":
        return (
          <>
            <rect x="16" y="6" width="32" height="50" rx="5" fill={soft} {...st} />
            <circle cx="32" cy="18" r="5" {...st} />
            <circle cx="32" cy="38" r="11" {...st} />
            <circle cx="32" cy="38" r="4" fill={ac} stroke="none" />
            <line x1="32" y1="56" x2="32" y2="62" {...st} />
          </>
        );
      case "coluna":
        return (
          <>
            <rect x="25" y="3" width="14" height="38" rx="3" fill={soft} {...st} />
            {[9, 15, 21, 27, 33].map((y) => (
              <circle key={y} cx="32" cy={y} r="2.4" fill={ac} stroke="none" />
            ))}
            <rect x="18" y="43" width="28" height="18" rx="3" fill={soft} {...st} />
            <circle cx="32" cy="52" r="5" {...st} />
          </>
        );
      case "sub":
        return (
          <>
            <rect x="8" y="14" width="48" height="44" rx="5" fill={soft} {...st} />
            <circle cx="32" cy="36" r="15" {...st} />
            <circle cx="32" cy="36" r="6" fill={ac} stroke="none" />
          </>
        );
      case "monitor":
        return (
          <>
            <path d="M6 54 L20 22 H58 V54 Z" fill={soft} {...st} />
            <circle cx="40" cy="38" r="9" {...st} />
            <circle cx="40" cy="38" r="3" fill={ac} stroke="none" />
          </>
        );
      case "micMao":
        return (
          <>
            <circle cx="40" cy="18" r="11" fill={soft} {...st} />
            <path d="M33 26 L14 56" {...st} strokeWidth={6} />
            <path d="M34 12 L46 24 M30 16 L42 28" stroke={ac} strokeWidth={1.6} />
          </>
        );
      case "micSemFio":
        return (
          <>
            <circle cx="38" cy="20" r="10" fill={soft} {...st} />
            <path d="M32 27 L16 54" {...st} strokeWidth={6} />
            <path d="M48 6 a10 10 0 0 1 8 8 M48 1 a15 15 0 0 1 13 13" stroke={ac} />
          </>
        );
      case "headset":
        return (
          <>
            <path d="M14 34 a18 18 0 0 1 36 0" {...st} />
            <rect x="9" y="32" width="8" height="14" rx="3" fill={soft} {...st} />
            <rect x="47" y="32" width="8" height="14" rx="3" fill={soft} {...st} />
            <path d="M13 46 C14 56 24 58 32 56" {...st} />
            <circle cx="34" cy="56" r="3" fill={ac} stroke="none" />
          </>
        );
      case "kitBateria":
        return (
          <>
            <ellipse cx="32" cy="44" rx="16" ry="12" fill={soft} {...st} />
            <ellipse cx="14" cy="24" rx="9" ry="4" {...st} />
            <ellipse cx="50" cy="20" rx="10" ry="4" {...st} />
            <line x1="14" y1="28" x2="14" y2="60" {...st} />
            <line x1="50" y1="24" x2="50" y2="60" {...st} />
            <circle cx="32" cy="44" r="4" fill={ac} stroke="none" />
          </>
        );
      case "mesa":
        return (
          <>
            <path d="M4 50 L12 18 H52 L60 50 Z" fill={soft} {...st} />
            {[20, 28, 36, 44].map((x) => (
              <g key={x}>
                <line x1={x} y1="24" x2={x} y2="44" {...st} strokeWidth={1.4} />
                <rect x={x - 2.5} y={x % 16 === 4 ? 30 : 36} width="5" height="4" rx="1" fill={ac} stroke="none" />
              </g>
            ))}
          </>
        );
      case "inEar":
        return (
          <>
            <rect x="8" y="10" width="20" height="30" rx="4" fill={soft} {...st} />
            <line x1="18" y1="10" x2="18" y2="3" stroke={ac} />
            <path d="M28 30 C40 30 40 46 48 50" {...st} />
            <circle cx="50" cy="52" r="5" fill={ac} stroke="none" />
          </>
        );
      case "di":
        return (
          <>
            <rect x="10" y="18" width="44" height="30" rx="4" fill={soft} {...st} />
            <circle cx="22" cy="33" r="5" {...st} />
            <circle cx="42" cy="33" r="5" {...st} />
            <circle cx="42" cy="33" r="1.8" fill={ac} stroke="none" />
          </>
        );
      case "cabo":
        return (
          <>
            <path d="M8 50 C20 50 18 16 32 16 C46 16 44 48 56 48" {...st} />
            <rect x="2" y="46" width="10" height="8" rx="2" fill={ac} stroke="none" />
            <rect x="52" y="44" width="10" height="8" rx="2" fill={ac} stroke="none" />
          </>
        );
      case "pedestal":
        return (
          <>
            <line x1="32" y1="12" x2="32" y2="50" {...st} />
            <path d="M32 50 L16 60 M32 50 L48 60 M32 50 V60" {...st} />
            <line x1="32" y1="14" x2="50" y2="6" {...st} />
            <circle cx="52" cy="5" r="3" fill={ac} stroke="none" />
          </>
        );
      case "regua":
        return (
          <>
            <rect x="6" y="24" width="52" height="16" rx="4" fill={soft} {...st} />
            {[16, 28, 40].map((x) => (
              <circle key={x} cx={x} cy="32" r="3" {...st} />
            ))}
            <circle cx="52" cy="32" r="2" fill={ac} stroke="none" />
          </>
        );
      case "multicabo":
        return (
          <>
            <rect x="8" y="10" width="26" height="22" rx="3" fill={soft} {...st} />
            {[14, 21, 28].map((x) => (
              <circle key={x} cx={x} cy="21" r="2.2" fill={ac} stroke="none" />
            ))}
            <path d="M34 26 C46 26 44 52 58 52" {...st} strokeWidth={4} />
          </>
        );
    }
  })();
  return (
    <svg {...base} width={tamanho} height={tamanho} role={titulo ? "img" : undefined} aria-hidden={titulo ? undefined : true} aria-label={titulo} className="ilustracao">
      {c}
    </svg>
  );
}

/** Escolhe a ilustração a partir da categoria/subcategoria/papel. */
export function imagemPara(o: { papel?: string; ref?: string; categoria?: string; subcategoria?: string; id?: string }): TipoImagem {
  const ref = (o.ref ?? o.id ?? "").toLowerCase();
  if (o.papel === "sub" || o.categoria === "subwoofer" || ref.includes("sub")) return "sub";
  if (o.categoria === "vertical_array" || ref.includes("coluna") || ref.includes("line") || ref.includes("la1221") || ref.includes("neo-pro")) return "coluna";
  if (o.categoria === "monitor_chao" || ref === "monitor") return "monitor";
  if (o.papel === "front_fill") return "caixaPequena";
  if (ref.startsWith("voz-sem-fio") || o.categoria === "microfone_sem_fio") return o.subcategoria === "headset" ? "headset" : "micSemFio";
  if (ref.startsWith("kit-bateria") || o.subcategoria === "kit_bateria") return "kitBateria";
  if (ref.startsWith("voz-fio") || ref.startsWith("inst-mic") || o.categoria === "microfone_com_fio") return "micMao";
  if (ref.startsWith("in-ear") || o.categoria === "in_ear") return "inEar";
  if (ref === "di" || o.categoria === "di") return "di";
  if (ref.startsWith("xlr")) return "cabo";
  if (ref.startsWith("pedestal") || ref.startsWith("suporte")) return "pedestal";
  if (ref === "regua") return "regua";
  if (ref === "multicabo") return "multicabo";
  if (o.categoria === "mesa" || ref.startsWith("mesa")) return "mesa";
  return "caixa";
}
