import type { HeirId, HeirInput } from "./types";

export type AshabahType =
  | "NAFS"
  | "BIL_GHAIR"
  | "MAAL_GHAIR";

export interface AshabahResult {
  heirId: HeirId;
  count: number;
  type: AshabahType;
  ratio?: number;
  reason: string;
}

function countOf(heirs: HeirInput[], id: HeirId): number {
  return heirs.find((h) => h.id === id)?.count ?? 0;
}

function has(heirs: HeirInput[], id: HeirId): boolean {
  return countOf(heirs, id) > 0;
}

/**
 * Apakah terdapat فرع وارث laki-laki?
 */
function hasMaleDescendant(heirs: HeirInput[]): boolean {
  return (
    has(heirs, "son") ||
    has(heirs, "sonsSon")
  );
}

/**
 * Apakah terdapat فرع وارث perempuan?
 */
function hasFemaleDescendant(heirs: HeirInput[]): boolean {
  return (
    has(heirs, "daughter") ||
    has(heirs, "sonsDaughter")
  );
}

/**
 * Apakah terdapat keturunan laki-laki yang lebih dekat?
 */
function hasCloserMaleDescendant(heirs: HeirInput[]): boolean {
  return has(heirs, "son");
}

/**
 * Menentukan عصبة anak laki-laki dan anak perempuan.
 *
 * الابن مع البنت:
 *
 * للذكر مثل حظ الأنثيين
 *
 * Jadi:
 *
 * anak laki-laki = 2 bagian
 * anak perempuan = 1 bagian
 */
function getChildrenAshabah(
  heirs: HeirInput[]
): AshabahResult[] {
  const sons = countOf(heirs, "son");
  const daughters = countOf(heirs, "daughter");

  if (sons === 0) return [];

  const results: AshabahResult[] = [];

  results.push({
    heirId: "son",
    count: sons,
    type: daughters > 0 ? "BIL_GHAIR" : "NAFS",
    ratio: 2,
    reason:
      daughters > 0
        ? "Anak laki-laki menjadi عصبة بالغير bersama anak perempuan."
        : "Anak laki-laki menjadi عصبة بالنفس.",
  });

  if (daughters > 0) {
    results.push({
      heirId: "daughter",
      count: daughters,
      type: "BIL_GHAIR",
      ratio: 1,
      reason:
        "Anak perempuan menjadi عصبة بالغير bersama anak laki-laki.",
    });
  }

  return results;
}

/**
 * Cucu laki-laki dari anak laki-laki.
 *
 * ابن الابن
 *
 * Menjadi عصبة بالنفس jika tidak ada anak laki-laki
 * yang lebih dekat.
 */
function getSonsSonAshabah(
  heirs: HeirInput[]
): AshabahResult[] {
  const count = countOf(heirs, "sonsSon");

  if (count === 0) return [];

  if (hasCloserMaleDescendant(heirs)) {
    return [];
  }

  const result: AshabahResult = {
    heirId: "sonsSon",
    count,
    type: "NAFS",
    ratio: 1,
    reason:
      "Cucu laki-laki dari jalur anak laki-laki menjadi عصبة بالنفس.",
  };

  return [result];
}

/**
 * Cucu perempuan bersama cucu laki-laki.
 */
function getSonsDaughterAshabah(
  heirs: HeirInput[]
): AshabahResult[] {
  const daughters = countOf(heirs, "sonsDaughter");
  const sons = countOf(heirs, "sonsSon");

  if (daughters === 0 || sons === 0) {
    return [];
  }

  if (hasCloserMaleDescendant(heirs)) {
    return [];
  }

  return [
    {
      heirId: "sonsSon",
      count: sons,
      type: "BIL_GHAIR",
      ratio: 2,
      reason:
        "Cucu laki-laki menjadi عصبة بالغير bersama cucu perempuan.",
    },
    {
      heirId: "sonsDaughter",
      count: daughters,
      type: "BIL_GHAIR",
      ratio: 1,
      reason:
        "Cucu perempuan menjadi عصبة بالغير bersama cucu laki-laki.",
    },
  ];
}

/**
 * Ayah.
 *
 * الأب:
 *
 * Dalam beberapa kondisi ayah mendapat:
 *
 * 1/6 sebagai فرض
 * atau
 * 1/6 + sisa
 * atau
 * sisa sebagai عصبة
 *
 * Di sini kita hanya mendeteksi status عصبة.
 *
 * Penentuan fardh ayah dilakukan di modul furudh
 * dan integrasi final dilakukan oleh engine.
 */
function getFatherAshabah(
  heirs: HeirInput[]
): AshabahResult[] {
  if (!has(heirs, "father")) {
    return [];
  }

  /*
   * Jika terdapat anak laki-laki, ayah tidak mengambil
   * seluruh sisa sebagai عصبة.
   *
   * Ia mempunyai فَرْض 1/6.
   *
   * Penanganan 1/6 + sisa akan dibuat di engine.
   */
  if (hasMaleDescendant(heirs)) {
    return [];
  }

  return [
    {
      heirId: "father",
      count: 1,
      type: "NAFS",
      ratio: 1,
      reason:
        "Ayah dapat menjadi عصبة بالنفس karena tidak terdapat فرع وارث laki-laki.",
    },
  ];
}

/**
 * Saudara laki-laki kandung.
 *
 * الأخ الشقيق
 *
 * Menjadi عصبة بالنفس apabila tidak terhalang.
 */
function getFullBrotherAshabah(
  heirs: HeirInput[]
): AshabahResult[] {
  const count = countOf(heirs, "fullBrother");

  if (count === 0) return [];

  /*
   * Ayah dan anak laki-laki menghalangi saudara kandung.
   */
  if (
    has(heirs, "father") ||
    hasMaleDescendant(heirs)
  ) {
    return [];
  }

  return [
    {
      heirId: "fullBrother",
      count,
      type: "NAFS",
      ratio: 1,
      reason:
        "Saudara laki-laki kandung menjadi عصبة بالنفس.",
    },
  ];
}

/**
 * Saudari kandung bersama anak perempuan.
 *
 * الأخوات الشقيقات مع البنات
 *
 * Ini adalah:
 *
 * عصبة مع الغير
 *
 * dengan syarat tidak ada saudara laki-laki kandung
 * dan tidak ada ayah/anak laki-laki.
 */
function getFullSisterWithDaughter(
  heirs: HeirInput[]
): AshabahResult[] {
  const sisters = countOf(heirs, "fullSister");

  if (sisters === 0) return [];

  if (!hasFemaleDescendant(heirs)) {
    return [];
  }

  if (
    has(heirs, "fullBrother") ||
    has(heirs, "father") ||
    hasMaleDescendant(heirs)
  ) {
    return [];
  }

  return [
    {
      heirId: "fullSister",
      count: sisters,
      type: "MAAL_GHAIR",
      ratio: 1,
      reason:
        "Saudari kandung menjadi عصبة مع الغير bersama keturunan perempuan.",
    },
  ];
}

/**
 * Saudara perempuan seayah bersama anak perempuan.
 *
 * Kondisi ini hanya dapat dipakai apabila saudari kandung
 * tidak ada/ tidak menghalangi.
 *
 * Detail prioritas akan disempurnakan dalam engine hijab.
 */
function getPaternalSisterWithDaughter(
  heirs: HeirInput[]
): AshabahResult[] {
  const sisters = countOf(heirs, "paternalSister");

  if (sisters === 0) return [];

  if (!hasFemaleDescendant(heirs)) {
    return [];
  }

  if (
    has(heirs, "father") ||
    hasMaleDescendant(heirs) ||
    has(heirs, "fullBrother") ||
    has(heirs, "fullSister")
  ) {
    return [];
  }

  return [
    {
      heirId: "paternalSister",
      count: sisters,
      type: "MAAL_GHAIR",
      ratio: 1,
      reason:
        "Saudari seayah menjadi عصبة مع الغير bersama keturunan perempuan.",
    },
  ];
}

/**
 * Mengumpulkan seluruh kandidat عصبة.
 *
 * Catatan:
 * Fungsi ini belum memilih عصبة terkuat.
 * Pemilihan prioritas dilakukan oleh engine utama.
 */
export function findAshabah(
  heirs: HeirInput[]
): AshabahResult[] {
  return [
    ...getChildrenAshabah(heirs),
    ...getSonsDaughterAshabah(heirs),
    ...getSonsSonAshabah(heirs),
    ...getFatherAshabah(heirs),
    ...getFullBrotherAshabah(heirs),
    ...getFullSisterWithDaughter(heirs),
    ...getPaternalSisterWithDaughter(heirs),
  ];
}
