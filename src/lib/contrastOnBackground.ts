/**
 * Escolhe #000 ou #fff sobre um fundo sólido.
 * Usa luminosidade percebida (YIQ / fórmula tipo Bootstrap), não só contraste WCAG
 * entre L do fundo e L do preto — evita casos em que o preto “ganha” em azuis saturados
 * onde o branco é o que o olho lê melhor.
 */
function parseHex6(input: string): { r: number; g: number; b: number } | null {
  const raw = input.trim().replace(/^#/, '');
  if (raw.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
}

/** 0–255: quanto maior, mais “claro” o fundo percebido em RGB. */
function perceivedBrightness(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/** Retorna `#000000` em fundos claros e `#ffffff` em fundos escuros (limiar 128). */
export function contrastForegroundForHex(backgroundHex: string): '#000000' | '#ffffff' {
  const rgb = parseHex6(backgroundHex);
  if (!rgb) return '#000000';
  const yiq = perceivedBrightness(rgb.r, rgb.g, rgb.b);
  return yiq >= 128 ? '#000000' : '#ffffff';
}
