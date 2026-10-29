export function Logo() {
  return (
    <span className="marca-logo" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
        <line x1="4" y1="10" x2="4" y2="14" />
        <line x1="8" y1="6" x2="8" y2="18" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="16" y1="7" x2="16" y2="17" />
        <line x1="20" y1="10" x2="20" y2="14" />
      </svg>
    </span>
  );
}

/** Ilustração genérica de um palco com duas caixas, para a página inicial. */
export function ArtePalco() {
  return (
    <svg viewBox="0 0 420 280" role="img" aria-label="Ilustração de um palco com duas caixas de som e o público">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14b8a6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d="M40 210 L380 210 L420 280 L0 280 Z" fill="#132036" />
      <rect x="40" y="150" width="340" height="60" rx="6" fill="#1c2c48" />
      <path d="M70 120 L10 270 L170 270 Z" fill="url(#g1)" opacity="0.6" />
      <path d="M350 120 L250 270 L410 270 Z" fill="url(#g1)" opacity="0.6" />
      {[60, 330].map((x) => (
        <g key={x}>
          <line x1={x + 15} y1="150" x2={x + 15} y2="128" stroke="#94a3b8" strokeWidth="3" />
          <rect x={x} y="70" width="30" height="58" rx="5" fill="#0b1324" stroke="#5eead4" strokeWidth="2" />
          <circle cx={x + 15} cy="84" r="5" fill="#5eead4" />
          <circle cx={x + 15} cy="108" r="10" fill="none" stroke="#5eead4" strokeWidth="2" />
        </g>
      ))}
      <line x1="210" y1="150" x2="210" y2="105" stroke="#94a3b8" strokeWidth="3" />
      <circle cx="210" cy="100" r="7" fill="#e2e8f0" />
      {Array.from({ length: 7 }).map((_, i) =>
        Array.from({ length: 2 }).map((__, j) => <circle key={`${i}-${j}`} cx={95 + i * 38 + j * 16} cy={240 + j * 22} r="8" fill="#64748b" opacity={0.9 - j * 0.25} />),
      )}
      <g fill="none" stroke="#5eead4" strokeWidth="2" opacity="0.8">
        <path d="M100 96 q14 -10 0 -20" />
        <path d="M108 102 q24 -16 0 -32" />
        <path d="M320 96 q-14 -10 0 -20" />
        <path d="M312 102 q-24 -16 0 -32" />
      </g>
    </svg>
  );
}
