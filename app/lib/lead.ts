/**
 * Captura de contato: fora do MVP (SPEC C2). Só a interface existe.
 * Antes de implementar, fazer revisão de LGPD (SPEC C12).
 */
export interface Lead {
  /** Ex.: "orcamento". Nenhum dado pessoal é coletado no MVP. */
  origem: string;
}

export interface LeadSink {
  enviar(lead: Lead): Promise<void>;
}

export class LeadSinkNulo implements LeadSink {
  async enviar(): Promise<void> {
    // Implementação nula: não envia nada.
  }
}
