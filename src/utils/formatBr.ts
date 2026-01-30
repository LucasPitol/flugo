/**
 * Formatação padrão Brasil: valor monetário (1.000,00).
 */

/** Formata número para exibição em reais: 1.000,00 */
export function formatBrCurrency(value: number): string {
  if (Number.isNaN(value) || value < 0) return '0,00';
  const fixed = value.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots},${decPart}`;
}

/** Converte string no formato BR (1.000,00) para número. */
export function parseBrCurrency(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (digits === '') return NaN;
  return parseInt(digits, 10) / 100;
}

/** Aplica máscara enquanto digita: extrai dígitos, interpreta como centavos e formata (estilo Nubank). */
export function maskBrCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits === '') return '';
  return formatBrCurrency(parseInt(digits, 10) / 100);
}
