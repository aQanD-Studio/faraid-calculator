import type { HeirId, HeirInput } from "./types";

export interface HijabResult {
  id: HeirId;
  count: number;
  mode: "ELIGIBLE" | "BLOCKED";
  reason: string;
}

function countOf(heirs: HeirInput[], id: HeirId): number {
  return heirs.find((h) => h.id === id)?.count ?? 0;
}

function has(heirs: HeirInput[], id: HeirId): boolean {
  return countOf(heirs, id) > 0;
}

function hasMaleDescendant(heirs: HeirInput[]): boolean {
  return has(heirs, "son") || has(heirs, "sonsSon");
}

function hasFemaleDescendant(heirs: HeirInput[]): boolean {
  return has(heirs, "daughter") || has(heirs, "sonsDaughter");
}

function hasAnyDescendant(heirs: HeirInput[]): boolean {
  return hasMaleDescendant(heirs) || hasFemaleDescendant(heirs);
}

function hasFather(heirs: HeirInput[]): boolean {
  return has(heirs, "father") || has(heirs, "paternalGrandfather");
}

function hasMaleSibling(heirs: HeirInput[]): boolean {
  return has(heirs, "fullBrother") || has(heirs, "paternalBrother");
}

function hasAnySibling(heirs: HeirInput[]): boolean {
  return (
    hasMaleSibling(heirs) ||
    has(heirs, "fullSister") ||
    has(heirs, "paternalSister") ||
    has(heirs, "maternalBrother") ||
    has(heirs, "maternalSister")
  );
}

export function analyzeBasicHijab(heirs: HeirInput[]): HijabResult[] {
  const results: HijabResult[] = [];

  for (const heir of heirs) {
    const { id, count } = heir;
    let blocked = false;
    let reason = "Layak mewarisi.";

    switch (id) {
      case "husband":
        blocked = false;
        reason = "Suami selalu mewarisi, tidak ada yang menghalangi.";
        break;

      case "wife":
        blocked = false;
        reason = "Istri selalu mewarisi, tidak ada yang menghalangi.";
        break;

      case "son":
        blocked = false;
        reason = "Anak laki-laki selalu mewarisi.";
        break;

      case "daughter":
        blocked = false;
        reason = "Anak perempuan mewarisi kecuali jika ada anak laki-laki (menjadi عصبة بالغير).";
        break;

      case "sonsSon":
        blocked = has(heirs, "son");
        reason = blocked
          ? "Terhalang oleh anak laki-laki yang lebih dekat."
          : "Cucu laki-laki dari jalur anak laki-laki mewarisi jika tidak ada anak laki-laki.";
        break;

      case "sonsDaughter":
        blocked = hasMaleDescendant(heirs) && !has(heirs, "sonsSon");
        if (has(heirs, "sonsSon")) {
          blocked = false;
          reason = "Cucu perempuan bersama cucu laki-laki (عصبة بالغير).";
        } else if (has(heirs, "son")) {
          blocked = true;
          reason = "Terhalang oleh anak laki-laki.";
        } else if (countOf(heirs, "daughter") >= 2) {
          blocked = true;
          reason = "Terhalang oleh dua atau lebih anak perempuan.";
        } else {
          blocked = false;
          reason = "Cucu perempuan dari jalur anak laki-laki mewarisi.";
        }
        break;

      case "father":
        blocked = false;
        reason = "Ayah selalu mewarisi (fardh atau عصبة).";
        break;

      case "mother":
        blocked = false;
        reason = "Ibu selalu mewarisi (1/3 atau 1/6).";
        break;

      case "paternalGrandfather":
        blocked = has(heirs, "father");
        reason = blocked
          ? "Terhalang oleh ayah."
          : "Kakek dari jalur ayah mewarisi jika tidak ada ayah.";
        break;

      case "maternalGrandmother":
        blocked = has(heirs, "mother");
        reason = blocked
          ? "Terhalang oleh ibu."
          : "Nenek dari jalur ibu mewarisi jika tidak ada ibu.";
        break;

      case "paternalGrandmother":
        blocked = has(heirs, "mother") || has(heirs, "father");
        reason = blocked
          ? "Terhalang oleh ibu atau ayah."
          : "Nenek dari jalur ayah mewarisi jika tidak ada ibu atau ayah.";
        break;

      case "fullBrother":
        blocked = hasFather(heirs) || hasMaleDescendant(heirs);
        reason = blocked
          ? "Terhalang oleh ayah/kakek atau فرع وارث laki-laki."
          : "Saudara laki-laki kandung mewarisi jika tidak ada ayah/kakek atau anak laki-laki.";
        break;

      case "fullSister":
        blocked = hasFather(heirs) || hasMaleDescendant(heirs) || has(heirs, "fullBrother");
        reason = blocked
          ? "Terhalang oleh ayah, anak laki-laki, atau saudara laki-laki kandung."
          : "Saudari kandung mewarisi jika tidak ada penghalang.";
        break;

      case "paternalBrother":
        blocked =
          hasFather(heirs) ||
          hasMaleDescendant(heirs) ||
          has(heirs, "fullBrother");
        reason = blocked
          ? "Terhalang oleh ayah, anak laki-laki, atau saudara kandung."
          : "Saudara seayah mewarisi jika tidak ada penghalang.";
        break;

      case "paternalSister":
        blocked =
          hasFather(heirs) ||
          hasMaleDescendant(heirs) ||
          has(heirs, "fullBrother") ||
          (has(heirs, "fullSister") && countOf(heirs, "fullSister") >= 2);
        reason = blocked
          ? "Terhalang oleh ayah, anak laki-laki, saudara kandung, atau dua saudari kandung."
          : "Saudari seayah mewarisi jika tidak ada penghalang.";
        break;

      case "maternalBrother":
      case "maternalSister":
        blocked = hasAnyDescendant(heirs) || hasFather(heirs);
        reason = blocked
          ? "Terhalang oleh فرع وارث atau ayah."
          : "Saudara seibu mewarisi jika tidak ada فرع وارث atau ayah.";
        break;

      case "fullBrothersSon":
        blocked =
          hasFather(heirs) ||
          hasMaleDescendant(heirs) ||
          hasMaleSibling(heirs);
        reason = blocked
          ? "Terhalang oleh ayah, anak laki-laki, atau saudara laki-laki."
          : "Anak saudara kandung mewarisi jika tidak ada penghalang.";
        break;

      case "paternalBrothersSon":
        blocked =
          hasFather(heirs) ||
          hasMaleDescendant(heirs) ||
          hasMaleSibling(heirs) ||
          has(heirs, "fullBrothersSon");
        reason = blocked
          ? "Terhalang oleh penghalang yang lebih dekat."
          : "Anak saudara seayah mewarisi jika tidak ada penghalang.";
        break;

      case "fullUncle":
        blocked =
          hasFather(heirs) ||
          hasMaleDescendant(heirs) ||
          hasMaleSibling(heirs) ||
          has(heirs, "fullBrothersSon") ||
          has(heirs, "paternalBrothersSon");
        reason = blocked
          ? "Terhalang oleh penghalang yang lebih dekat."
          : "Paman kandung mewarisi jika tidak ada penghalang.";
        break;

      case "paternalUncle":
        blocked =
          hasFather(heirs) ||
          hasMaleDescendant(heirs) ||
          hasMaleSibling(heirs) ||
          has(heirs, "fullBrothersSon") ||
          has(heirs, "paternalBrothersSon") ||
          has(heirs, "fullUncle");
        reason = blocked
          ? "Terhalang oleh penghalang yang lebih dekat."
          : "Paman seayah mewarisi jika tidak ada penghalang.";
        break;

      case "fullUnclesSon":
        blocked =
          hasFather(heirs) ||
          hasMaleDescendant(heirs) ||
          hasMaleSibling(heirs) ||
          has(heirs, "fullBrothersSon") ||
          has(heirs, "paternalBrothersSon") ||
          has(heirs, "fullUncle") ||
          has(heirs, "paternalUncle");
        reason = blocked
          ? "Terhalang oleh penghalang yang lebih dekat."
          : "Anak paman kandung mewarisi jika tidak ada penghalang.";
        break;

      case "paternalUnclesSon":
        blocked =
          hasFather(heirs) ||
          hasMaleDescendant(heirs) ||
          hasMaleSibling(heirs) ||
          has(heirs, "fullBrothersSon") ||
          has(heirs, "paternalBrothersSon") ||
          has(heirs, "fullUncle") ||
          has(heirs, "paternalUncle") ||
          has(heirs, "fullUnclesSon");
        reason = blocked
          ? "Terhalang oleh penghalang yang lebih dekat."
          : "Anak paman seayah mewarisi jika tidak ada penghalang.";
        break;

      case "wala":
        blocked =
          hasFather(heirs) ||
          hasMaleDescendant(heirs) ||
          hasMaleSibling(heirs) ||
          hasAnySibling(heirs);
        reason = blocked
          ? "Terhalang oleh ahli waris yang lebih dekat."
          : "Wala' mewarisi jika tidak ada ahli waris lain.";
        break;

      default:
        blocked = false;
        reason = "Layak mewarisi.";
    }

    results.push({
      id,
      count,
      mode: blocked ? "BLOCKED" : "ELIGIBLE",
      reason,
    });
  }

  return results;
}
