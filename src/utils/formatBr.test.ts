import { describe, it, expect } from 'vitest';
import {
  formatBrCurrency,
  parseBrCurrency,
  maskBrCurrencyInput,
} from './formatBr';

describe('formatBrCurrency', () => {
  it('formata valor inteiro corretamente', () => {
    expect(formatBrCurrency(1000)).toBe('1.000,00');
    expect(formatBrCurrency(1)).toBe('1,00');
  });

  it('formata valor com decimais corretamente', () => {
    expect(formatBrCurrency(1234.56)).toBe('1.234,56');
    expect(formatBrCurrency(0.5)).toBe('0,50');
  });

  it('retorna 0,00 para valor zero', () => {
    expect(formatBrCurrency(0)).toBe('0,00');
  });

  it('retorna 0,00 para valor negativo', () => {
    expect(formatBrCurrency(-100)).toBe('0,00');
  });

  it('retorna 0,00 para NaN', () => {
    expect(formatBrCurrency(NaN)).toBe('0,00');
  });

  it('arredonda para duas casas decimais', () => {
    expect(formatBrCurrency(10.999)).toBe('11,00');
    expect(formatBrCurrency(10.994)).toBe('10,99');
  });

  it('formata valores grandes com pontos de milhar', () => {
    expect(formatBrCurrency(1_000_000)).toBe('1.000.000,00');
  });
});

describe('parseBrCurrency', () => {
  it('converte string no formato BR para número', () => {
    expect(parseBrCurrency('1.000,00')).toBe(1000);
    expect(parseBrCurrency('1.234,56')).toBe(1234.56);
  });

  it('interpreta dígitos como centavos quando há dois decimais', () => {
    expect(parseBrCurrency('10,50')).toBe(10.5);
    expect(parseBrCurrency('0,99')).toBe(0.99);
  });

  it('retorna NaN para string vazia', () => {
    expect(parseBrCurrency('')).toBe(NaN);
  });

  it('ignora caracteres não numéricos e interpreta como centavos', () => {
    expect(parseBrCurrency('R$ 1.000,00')).toBe(1000);
    expect(parseBrCurrency('1.000')).toBe(10); // "1000" = 10,00
  });

  it('valor só com vírgula (centavos)', () => {
    expect(parseBrCurrency(',50')).toBe(0.5);
  });
});

describe('maskBrCurrencyInput', () => {
  it('aplica máscara estilo Nubank (dígitos como centavos)', () => {
    expect(maskBrCurrencyInput('1000')).toBe('10,00');
    expect(maskBrCurrencyInput('123456')).toBe('1.234,56');
  });

  it('retorna string vazia para input vazio', () => {
    expect(maskBrCurrencyInput('')).toBe('');
  });

  it('ignora caracteres não numéricos', () => {
    expect(maskBrCurrencyInput('1a2b3')).toBe('1,23');
  });

  it('formata valor zero digitado', () => {
    expect(maskBrCurrencyInput('0')).toBe('0,00');
  });
});
