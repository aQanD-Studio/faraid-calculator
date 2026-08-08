import type { HeirId, HeirInput } from "./types";
import type { FurudhResult } from "./furudh";
import { lcm } from "./utils";

export interface ShareCalculation {
  heirId: HeirId;
  count: number;
  fardh?: string;

  /**
   * Jumlah saham kolektif untuk kelompok ahli waris.
   */
  shares: number;

  /**
   * Pembilang bagian.
   */
  numerator?: number;

  /**
   * Penyebut bagian.
   */
  denominator?: number;

  reason?: string;
}

export interface MasalahResult {
  /**
   * أصل المسألة
   */
  origin: number;

  /**
   * Total saham yang sudah digunakan oleh أصحاب الفروض.
   */
  usedShares: number;

  /**
   * Sisa saham.
   */
  remainder: number;

  /**
   * Perincian saham setiap ahli waris.
   */
  shares: ShareCalculation[];

  /**
   * Apakah masih ada sisa untuk عصبة.
   */
  hasRemainder: boolean;
}

function parseFraction(
  fraction: string
): { numerator: number; denominator: number } {
  const [n, d] = fraction.split("/").map(Number);

  if (!n || !d) {
    throw new Error(`Pecahan tidak valid: ${fraction}`);
  }

  return {
    numerator: n,
    denominator: d,
  };
}

/**
 * Mengambil semua penyebut dari bagian fardh.
 */
function getDenominators(
  furudh: FurudhResult[]
): number[] {
  return furudh.map((item) => {
    return parseFraction(item.fardh).denominator;
  });
}

/**
 * Menghitung أصل المسألة.
 *
 * Contoh:
 *
 * زوجة = 1/8
 * أم    = 1/6
 *
 * KPK dari 8 dan 6 = 24.
 *
 * Maka:
 *
 * أصل المسألة = 24
 */
export function calculateOrigin(
  furudh: FurudhResult[]
): number {
  if (furudh.length === 0) {
    return 1;
  }

  const denominators = getDenominators(furudh);

  return denominators.reduce(
    (current, denominator) => lcm(current, denominator),
    1
  );
}

/**
 * Mengubah satu fardh menjadi jumlah saham.
 *
 * Contoh:
 *
 * أصل المسألة = 24
 * الزوجة = 1/8
 *
 * 24 × 1/8 = 3
 */
function calculateShares(
  origin: number,
  furdh: FurudhResult
): ShareCalculation {
  const { numerator, denominator } =
    parseFraction(furdh.fardh);

  const shares =
    (origin * numerator) / denominator;

  if (!Number.isInteger(shares)) {
    throw new Error(
      `Saham tidak bulat untuk ${furdh.heirId}: ${origin} × ${numerator}/${denominator}`
    );
  }

  return {
    heirId: furdh.heirId,
    count: furdh.count,
    fardh: furdh.fardh,
    shares,
    numerator,
    denominator,
    reason: furdh.reason,
  };
}

/**
 * Menghitung seluruh saham أصحاب الفروض.
 */
export function calculateMasalah(
  heirs: HeirInput[],
  furudh: FurudhResult[]
): MasalahResult {
  const origin = calculateOrigin(furudh);

  const shares = furudh.map((item) =>
    calculateShares(origin, item)
  );

  const usedShares = shares.reduce(
    (total, item) => total + item.shares,
    0
  );

  const remainder = origin - usedShares;

  /*
   * Jika jumlah fardh melebihi أصل المسألة,
   * ini akan ditangani oleh العول.
   *
   * Untuk sementara kita tandai sebagai error
   * agar masalah dapat diperbaiki oleh modul 'aul.
   */
  if (remainder < 0) {
    throw new Error(
      `Jumlah saham melebihi أصل المسألة. Diperlukan analisis العول.`
    );
  }

  return {
    origin,
    usedShares,
    remainder,
    shares,
    hasRemainder: remainder > 0,
  };
}
