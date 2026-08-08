export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }

  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export function simplifyFraction(
  numerator: number,
  denominator: number
): [number, number] {
  if (denominator === 0) {
    throw new Error("Penyebut tidak boleh 0");
  }

  const divisor = gcd(numerator, denominator);

  return [
    numerator / divisor,
    denominator / divisor,
  ];
}

export function fractionToString(
  numerator: number,
  denominator: number
): string {
  const [n, d] = simplifyFraction(numerator, denominator);

  if (n === 0) return "0";
  if (n === d) return "1";

  return `${n}/${d}`;
}
