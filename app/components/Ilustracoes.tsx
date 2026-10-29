/** Ilustrações simples (SVG inline) para opções de instalação, formato da caixa e formato do ambiente. */

const S = { width: 44, height: 44, viewBox: "0 0 44 44", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true } as const;

export function IconeForma({ tipo }: { tipo: string }) {
  switch (tipo) {
    case "pedestal":
      return (
        <svg {...S}>
          <rect x="15" y="4" width="14" height="16" rx="2" />
          <line x1="22" y1="20" x2="22" y2="36" />
          <line x1="22" y1="36" x2="12" y2="41" />
          <line x1="22" y1="36" x2="32" y2="41" />
        </svg>
      );
    case "parede":
      return (
        <svg {...S}>
          <line x1="6" y1="2" x2="6" y2="42" strokeWidth="3" />
          <line x1="6" y1="14" x2="14" y2="14" />
          <rect x="14" y="8" width="14" height="16" rx="2" />
        </svg>
      );
    case "suspensa":
      return (
        <svg {...S}>
          <line x1="2" y1="4" x2="42" y2="4" strokeWidth="3" />
          <line x1="22" y1="4" x2="22" y2="14" />
          <rect x="15" y="14" width="14" height="16" rx="2" />
        </svg>
      );
    case "chao":
      return (
        <svg {...S}>
          <rect x="14" y="20" width="16" height="18" rx="2" />
          <line x1="2" y1="40" x2="42" y2="40" strokeWidth="3" />
        </svg>
      );
    case "convencional":
      return (
        <svg {...S}>
          <rect x="12" y="6" width="20" height="30" rx="3" />
          <circle cx="22" cy="26" r="6" />
          <circle cx="22" cy="13" r="2.5" />
        </svg>
      );
    case "coluna":
      return (
        <svg {...S}>
          <rect x="17" y="2" width="10" height="34" rx="2" />
          {[7, 13, 19, 25, 31].map((y) => (
            <circle key={y} cx="22" cy={y} r="2" />
          ))}
          <rect x="13" y="36" width="18" height="6" rx="1" />
        </svg>
      );
    default:
      return (
        <svg {...S}>
          <circle cx="22" cy="22" r="14" strokeDasharray="4 3" />
          <text x="22" y="27" textAnchor="middle" fontSize="14" fill="currentColor" stroke="none">
            ?
          </text>
        </svg>
      );
  }
}

export function IconeFormato({ tipo }: { tipo: string }) {
  switch (tipo) {
    case "retangular":
      return (
        <svg {...S}>
          <rect x="6" y="8" width="32" height="28" />
        </svg>
      );
    case "recorte":
      return (
        <svg {...S}>
          <path d="M6 8 H38 V36 H24 V28 H6 Z" />
        </svg>
      );
    case "L":
      return (
        <svg {...S}>
          <path d="M6 6 H20 V24 H38 V38 H6 Z" />
        </svg>
      );
    case "irregular":
      return (
        <svg {...S}>
          <path d="M6 10 L30 6 L38 20 L32 38 L10 34 Z" />
        </svg>
      );
    default:
      return <IconeForma tipo="" />;
  }
}
