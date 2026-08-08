import type { HeirId, HeirInput } from "./types";

export type FurudhValue =
  | "1/2"
  | "1/4"
  | "1/8"
  | "2/3"
  | "1/3"
  | "1/6";

export interface FurudhResult {
  heirId: HeirId;
  count: number;
  fardh: FurudhValue;
  reason: string;
}

/**
 * Mengambil jumlah ahli waris tertentu.
 */
function countOf(heirs: HeirInput[], id: HeirId): number {
  return heirs.find((h) => h.id === id)?.count ?? 0;
}

/**
 * Apakah terdapat فرع وارث?
 *
 * Untuk tahap awal:
 * - anak laki-laki
 * - anak perempuan
 * - cucu laki-laki dari jalur anak laki-laki
 * - cucu perempuan dari jalur anak laki-laki
 */
function hasWarithDescendant(heirs: HeirInput[]): boolean {
  return (
    countOf(heirs, "son") > 0 ||
    countOf(heirs, "daughter") > 0 ||
    countOf(heirs, "sonsSon") > 0 ||
    countOf(heirs, "sonsDaughter") > 0
  );
}

/**
 * Apakah terdapat فرع وارث laki-laki?
 */
function hasMaleDescendant(heirs: HeirInput[]): boolean {
  return (
    countOf(heirs, "son") > 0 ||
    countOf(heirs, "sonsSon") > 0
  );
}

/**
 * Apakah terdapat anak perempuan?
 */
function hasDaughter(heirs: HeirInput[]): boolean {
  return countOf(heirs, "daughter") > 0;
}

/**
 * Apakah terdapat anak laki-laki?
 */
function hasSon(heirs: HeirInput[]): boolean {
  return countOf(heirs, "son") > 0;
}

/**
 * Menentukan bagian suami.
 *
 * الزوج:
 *
 * 1/2 jika tidak ada فرع وارث
 * 1/4 jika ada فرع وارث
 */
function getHusbandFardh(
  heirs: HeirInput[]
): FurudhResult | null {
  const count = countOf(heirs, "husband");

  if (count === 0) return null;

  const descendant = hasWarithDescendant(heirs);

  if (descendant) {
    return {
      heirId: "husband",
      count,
      fardh: "1/4",
      reason: "Mendapat 1/4 karena terdapat فرع وارث.",
    };
  }

  return {
    heirId: "husband",
    count,
    fardh: "1/2",
    reason: "Mendapat 1/2 karena tidak terdapat فرع وارث.",
  };
}

/**
 * Menentukan bagian istri/istri-istri.
 *
 * الزوجة:
 *
 * 1/4 jika tidak ada فرع وارث
 * 1/8 jika ada فرع وارث
 *
 * Jika istri lebih dari satu, bagian tersebut
 * menjadi bagian kolektif dan dibagi rata di antara mereka.
 */
function getWifeFardh(
  heirs: HeirInput[]
): FurudhResult | null {
  const count = countOf(heirs, "wife");

  if (count === 0) return null;

  const descendant = hasWarithDescendant(heirs);

  if (descendant) {
    return {
      heirId: "wife",
      count,
      fardh: "1/8",
      reason:
        "Para istri secara kolektif mendapat 1/8 karena terdapat فرع وارث.",
    };
  }

  return {
    heirId: "wife",
    count,
    fardh: "1/4",
    reason:
      "Para istri secara kolektif mendapat 1/4 karena tidak terdapat فرع وارث.",
  };
}

/**
 * Menentukan bagian ibu.
 *
 * Aturan dasar:
 *
 * 1/3:
 * - tidak ada فرع وارث
 * - dan tidak terdapat dua atau lebih saudara
 *
 * 1/6:
 * - terdapat فرع وارث
 * - atau terdapat dua atau lebih saudara
 *
 * Catatan:
 * Kasus العمريتين / الغراوين akan ditangani
 * oleh engine khusus, bukan di sini.
 */
function getMotherFardh(
  heirs: HeirInput[]
): FurudhResult | null {
  const count = countOf(heirs, "mother");

  if (count === 0) return null;

  const descendant = hasWarithDescendant(heirs);

  const siblings =
    countOf(heirs, "fullBrother") +
    countOf(heirs, "fullSister") +
    countOf(heirs, "paternalBrother") +
    countOf(heirs, "paternalSister") +
    countOf(heirs, "maternalBrother") +
    countOf(heirs, "maternalSister");

  if (descendant || siblings >= 2) {
    return {
      heirId: "mother",
      count,
      fardh: "1/6",
      reason:
        descendant
          ? "Mendapat 1/6 karena terdapat فرع وارث."
          : "Mendapat 1/6 karena terdapat dua atau lebih saudara.",
    };
  }

  return {
    heirId: "mother",
    count,
    fardh: "1/3",
    reason:
      "Mendapat 1/3 karena tidak terdapat فرع وارث dan tidak terdapat dua atau lebih saudara.",
  };
}

/**
 * Menentukan bagian anak perempuan.
 *
 * البنت:
 *
 * 1/2 jika seorang diri dan tidak ada anak laki-laki.
 *
 * 2/3 jika dua atau lebih dan tidak ada anak laki-laki.
 *
 * Jika bersama anak laki-laki:
 * menjadi عصبة بالغير
 * dan tidak diberikan fardh tetap.
 */
function getDaughterFardh(
  heirs: HeirInput[]
): FurudhResult | null {
  const count = countOf(heirs, "daughter");

  if (count === 0) return null;

  if (hasSon(heirs)) {
    return null;
  }

  if (count === 1) {
    return {
      heirId: "daughter",
      count,
      fardh: "1/2",
      reason:
        "Seorang anak perempuan mendapat 1/2 karena tidak terdapat anak laki-laki.",
    };
  }

  return {
    heirId: "daughter",
    count,
    fardh: "2/3",
    reason:
      "Dua atau lebih anak perempuan mendapat 2/3 secara kolektif karena tidak terdapat anak laki-laki.",
  };
}

/**
 * Cucu perempuan dari jalur anak laki-laki.
 *
 * Implementasi tahap pertama.
 *
 * Catatan:
 * Ada beberapa kondisi khusus yang membutuhkan analisis
 * bersama anak perempuan lain atau cucu laki-laki.
 */
function getSonsDaughterFardh(
  heirs: HeirInput[]
): FurudhResult | null {
  const count = countOf(heirs, "sonsDaughter");

  if (count === 0) return null;

  if (hasMaleDescendant(heirs)) {
    return null;
  }

  /*
   * Jika terdapat anak perempuan tunggal,
   * cucu perempuan dari anak laki-laki dapat mendapat 1/6
   * sebagai penyempurna 2/3.
   *
   * Jika terdapat dua atau lebih anak perempuan,
   * cucu perempuan terhalang.
   */
  const daughters = countOf(heirs, "daughter");

  if (daughters === 1) {
    return {
      heirId: "sonsDaughter",
      count,
      fardh: "1/6",
      reason:
        "Mendapat 1/6 sebagai تكملة الثلثين bersama seorang anak perempuan.",
    };
  }

  if (daughters >= 2) {
    return null;
  }

  if (count === 1) {
    return {
      heirId: "sonsDaughter",
      count,
      fardh: "1/2",
      reason:
        "Seorang cucu perempuan dari jalur anak laki-laki mendapat 1/2.",
    };
  }

  return {
    heirId: "sonsDaughter",
    count,
    fardh: "2/3",
    reason:
      "Dua atau lebih cucu perempuan dari jalur anak laki-laki mendapat 2/3 secara kolektif.",
  };
}

/**
 * Saudara laki-laki/perempuan seibu.
 *
 * الأخ لأم / الأخت لأم
 *
 * Satu orang = 1/6
 * Dua atau lebih = 1/3 secara kolektif
 *
 * Terhalang oleh فرع وارث atau ayah.
 */
function getMaternalSiblingFardh(
  heirs: HeirInput[]
): FurudhResult[] {
  const brother = countOf(heirs, "maternalBrother");
  const sister = countOf(heirs, "maternalSister");

  const total = brother + sister;

  if (total === 0) return [];

  const descendant = hasWarithDescendant(heirs);
  const father = countOf(heirs, "father") > 0;

  if (descendant || father) {
    return [];
  }

  if (total === 1) {
    return [
      {
        heirId: brother > 0
          ? "maternalBrother"
          : "maternalSister",
        count: 1,
        fardh: "1/6",
        reason:
          "Satu saudara seibu mendapat 1/6.",
      },
    ];
  }

  /*
   * Dua atau lebih saudara seibu mendapat 1/3 secara kolektif.
   *
   * Laki-laki dan perempuan dalam kasus ini
   * dibagi sama rata.
   */
  const results: FurudhResult[] = [];

  if (brother > 0) {
    results.push({
      heirId: "maternalBrother",
      count: brother,
      fardh: "1/3",
      reason:
        "Saudara seibu dua orang atau lebih mendapat 1/3 secara kolektif.",
    });
  }

  if (sister > 0) {
    results.push({
      heirId: "maternalSister",
      count: sister,
      fardh: "1/3",
      reason:
        "Saudara seibu dua orang atau lebih mendapat 1/3 secara kolektif.",
    });
  }

  return results;
}

/**
 * Menghitung seluruh fardh dasar.
 *
 * Fungsi ini BELUM:
 * - menentukan hijab secara penuh
 * - menentukan ashabah
 * - menentukan أصل المسألة
 * - 'aul
 * - radd
 * - inkisar
 * - tashih
 *
 * Itu sengaja dipisahkan ke engine berikutnya.
 */
export function calculateBasicFurudh(
  heirs: HeirInput[]
): FurudhResult[] {
  const results: FurudhResult[] = [];

  const husband = getHusbandFardh(heirs);
  if (husband) results.push(husband);

  const wife = getWifeFardh(heirs);
  if (wife) results.push(wife);

  const mother = getMotherFardh(heirs);
  if (mother) results.push(mother);

  const daughter = getDaughterFardh(heirs);
  if (daughter) results.push(daughter);

  const sonsDaughter = getSonsDaughterFardh(heirs);
  if (sonsDaughter) results.push(sonsDaughter);

  results.push(...getMaternalSiblingFardh(heirs));

  return results;
}
