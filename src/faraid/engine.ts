import type {
  FaraidCase,
  FaraidResult,
  HeirInput,
  HeirResult,
} from "./types";

import { calculateBasicFurudh } from "./furudh";
import { calculateMasalah } from "./masalah";
import { findAshabah } from "./ashabah";
import { analyzeBasicHijab } from "./hijab";

/**
 * Menjalankan mesin faraid.
 *
 * Urutan utama:
 *
 * 1. Validasi input
 * 2. Analisis hijab dasar
 * 3. Menentukan furudh
 * 4. Menentukan أصل المسألة
 * 5. Menentukan العصبة
 * 6. Menghitung sisa
 *
 * Catatan:
 * Engine ini masih tahap fondasi.
 * العول، الرد، الانكسار، التصحيح dan kasus khusus
 * akan ditambahkan setelah tahap ini diuji.
 */
export function calculateFaraid(
  caseData: FaraidCase
): FaraidResult {
  validateCase(caseData);

  const heirs = normalizeHeirs(caseData.heirs);

  /*
   * ==========================================
   * STEP 1
   * HIJAB
   * ==========================================
   */

  const hijab = analyzeBasicHijab(heirs);

  /*
   * Ahli waris yang mahjub tidak boleh
   * ikut perhitungan selanjutnya.
   */

  const eligibleHeirs: HeirInput[] =
    heirs.filter((heir) => {
      const status = hijab.find(
        (item) => item.id === heir.id
      );

      return status?.mode !== "BLOCKED";
    });

  /*
   * ==========================================
   * STEP 2
   * FURUDH
   * ==========================================
   */

  const furudh =
    calculateBasicFurudh(eligibleHeirs);

  /*
   * ==========================================
   * STEP 3
   * ASAL MASALAH
   * ==========================================
   */

  const masalah =
    calculateMasalah(
      eligibleHeirs,
      furudh
    );

  /*
   * ==========================================
   * STEP 4
   * ASHABAH
   * ==========================================
   */

  const ashabah =
    findAshabah(eligibleHeirs);

  /*
   * ==========================================
   * STEP 5
   * HASIL AWAL
   * ==========================================
   */

  const resultMap =
    new Map<string, HeirResult>();

  /*
   * Masukkan ahli waris yang mahjub.
   */

  for (const status of hijab) {
    if (status.mode === "BLOCKED") {
      resultMap.set(status.id, {
        id: status.id,
        count: status.count,
        shareType: "BLOCKED",
        blocked: true,
        reason: status.reason,
      });
    }
  }

  /*
   * Masukkan أصحاب الفروض.
   */

  for (const item of masalah.shares) {
    resultMap.set(item.heirId, {
      id: item.heirId,
      count: item.count,
      shareType: "FARD",
      blocked: false,
      fraction: item.fardh,
      shares: item.shares,
      reason: item.reason,
    });
  }

  /*
   * Masukkan calon عصبة.
   *
   * Belum mengambil sisa di sini.
   * Pemilihan عصبة terkuat akan dilakukan
   * pada tahap engine berikutnya.
   */

  for (const item of ashabah) {
    const existing =
      resultMap.get(item.heirId);

    if (existing) {
      /*
       * Misalnya anak perempuan telah mendapat
       * fardh pada kondisi tertentu, kemudian
       * dapat berubah menjadi عصبة بالغير.
       */
      resultMap.set(item.heirId, {
        ...existing,
        shareType:
          item.type === "BIL_GHAIR"
            ? "FARD_AND_ASHABAH"
            : existing.shareType,
        blocked: false,
        reason:
          existing.reason
            ? `${existing.reason} ${item.reason}`
            : item.reason,
      });

      continue;
    }

    resultMap.set(item.heirId, {
      id: item.heirId,
      count: item.count,
      shareType: "ASHABAH",
      blocked: false,
      shares: 0,
      reason: item.reason,
    });
  }

  /*
   * ==========================================
   * STEP 6
   * AHLI WARIS LAIN
   * ==========================================
   */

  for (const heir of heirs) {
    if (!resultMap.has(heir.id)) {
      resultMap.set(heir.id, {
        id: heir.id,
        count: heir.count,
        shareType: "NONE",
        blocked: false,
        shares: 0,
        reason:
          "Belum memiliki bagian pada tahap engine saat ini.",
      });
    }
  }

  /*
   * ==========================================
   * CATATAN
   * ==========================================
   */

  const notes: string[] = [];

  notes.push(
    "Engine faraid tahap fondasi."
  );

  notes.push(
    "العول، الرد، الانكسار dan التصحيح belum diaktifkan."
  );

  if (masalah.hasRemainder) {
    notes.push(
      `Terdapat sisa ${masalah.remainder} saham yang harus dianalisis oleh العصبة.`
    );
  }

  /*
   * ==========================================
   * RETURN
   * ==========================================
   */

  return {
    caseData,
    heirs: Array.from(
      resultMap.values()
    ),
    origin: masalah.origin,
    totalShares: masalah.usedShares,
    notes,
  };
}

/**
 * Normalisasi input.
 *
 * Jika ahli waris yang sama dimasukkan dua kali,
 * jumlahnya digabung.
 */
function normalizeHeirs(
  heirs: HeirInput[]
): HeirInput[] {
  const map =
    new Map<HeirInput["id"], number>();

  for (const heir of heirs) {
    if (heir.count <= 0) continue;

    const previous =
      map.get(heir.id) ?? 0;

    map.set(
      heir.id,
      previous + heir.count
    );
  }

  return Array.from(
    map.entries()
  ).map(([id, count]) => ({
    id,
    count,
  }));
}

/**
 * Validasi dasar kasus.
 */
function validateCase(
  caseData: FaraidCase
): void {
  if (!caseData) {
    throw new Error(
      "Data kasus tidak ditemukan."
    );
  }

  if (caseData.estate < 0) {
    throw new Error(
      "Nilai harta tidak boleh negatif."
    );
  }

  if (caseData.funeralCost < 0) {
    throw new Error(
      "Biaya pemakaman tidak boleh negatif."
    );
  }

  if (caseData.debt < 0) {
    throw new Error(
      "Utang tidak boleh negatif."
    );
  }

  if (caseData.bequest < 0) {
    throw new Error(
      "Wasiat tidak boleh negatif."
    );
  }

  if (!Array.isArray(caseData.heirs)) {
    throw new Error(
      "Data ahli waris harus berupa array."
    );
  }

  const totalHeirs =
    caseData.heirs.reduce(
      (total, heir) =>
        total + heir.count,
      0
    );

  if (totalHeirs <= 0) {
    throw new Error(
      "Minimal harus terdapat satu ahli waris."
    );
  }
}
