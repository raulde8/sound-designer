/** Nome de exibição: "Marca Modelo", sem repetir a marca quando o modelo já começa com ela. */
export function nomeProduto(p: { marca: string; modelo: string }): string {
  return p.modelo.toLowerCase().startsWith(p.marca.toLowerCase()) ? p.modelo : `${p.marca} ${p.modelo}`;
}
