import type { HeirDefinition } from "./types";

export const HEIRS: HeirDefinition[] = [
  {
    id: "husband",
    arabic: "الزوج",
    name: "Suami",
    category: "spouse",
    gender: "male",
  },
  {
    id: "wife",
    arabic: "الزوجة",
    name: "Istri",
    category: "spouse",
    gender: "female",
  },

  {
    id: "son",
    arabic: "الابن",
    name: "Anak laki-laki",
    category: "descendant",
    gender: "male",
  },
  {
    id: "daughter",
    arabic: "البنت",
    name: "Anak perempuan",
    category: "descendant",
    gender: "female",
  },
  {
    id: "sonsSon",
    arabic: "ابن الابن",
    name: "Cucu laki-laki",
    category: "descendant",
    gender: "male",
  },
  {
    id: "sonsDaughter",
    arabic: "بنت الابن",
    name: "Cucu perempuan",
    category: "descendant",
    gender: "female",
  },

  {
    id: "father",
    arabic: "الأب",
    name: "Ayah",
    category: "ascendant",
    gender: "male",
  },
  {
    id: "mother",
    arabic: "الأم",
    name: "Ibu",
    category: "ascendant",
    gender: "female",
  },
  {
    id: "paternalGrandfather",
    arabic: "الجد",
    name: "Kakek dari ayah",
    category: "ascendant",
    gender: "male",
  },
  {
    id: "maternalGrandmother",
    arabic: "الجدة من الأم",
    name: "Nenek dari ibu",
    category: "ascendant",
    gender: "female",
  },
  {
    id: "paternalGrandmother",
    arabic: "الجدة من الأب",
    name: "Nenek dari ayah",
    category: "ascendant",
    gender: "female",
  },

  {
    id: "fullBrother",
    arabic: "الأخ الشقيق",
    name: "Saudara laki-laki kandung",
    category: "sibling",
    gender: "male",
  },
  {
    id: "fullSister",
    arabic: "الأخت الشقيقة",
    name: "Saudari kandung",
    category: "sibling",
    gender: "female",
  },

  {
    id: "paternalBrother",
    arabic: "الأخ لأب",
    name: "Saudara laki-laki seayah",
    category: "sibling",
    gender: "male",
  },
  {
    id: "paternalSister",
    arabic: "الأخت لأب",
    name: "Saudari seayah",
    category: "sibling",
    gender: "female",
  },

  {
    id: "maternalBrother",
    arabic: "الأخ لأم",
    name: "Saudara laki-laki seibu",
    category: "sibling",
    gender: "male",
  },
  {
    id: "maternalSister",
    arabic: "الأخت لأم",
    name: "Saudari seibu",
    category: "sibling",
    gender: "female",
  },

  {
    id: "fullBrothersSon",
    arabic: "ابن الأخ الشقيق",
    name: "Anak saudara laki-laki kandung",
    category: "nephew",
    gender: "male",
  },
  {
    id: "paternalBrothersSon",
    arabic: "ابن الأخ لأب",
    name: "Anak saudara laki-laki seayah",
    category: "nephew",
    gender: "male",
  },

  {
    id: "fullUncle",
    arabic: "العم الشقيق",
    name: "Paman kandung",
    category: "uncle",
    gender: "male",
  },
  {
    id: "paternalUncle",
    arabic: "العم لأب",
    name: "Paman seayah",
    category: "uncle",
    gender: "male",
  },
  {
    id: "fullUnclesSon",
    arabic: "ابن العم الشقيق",
    name: "Anak paman kandung",
    category: "uncle",
    gender: "male",
  },
  {
    id: "paternalUnclesSon",
    arabic: "ابن العم لأب",
    name: "Anak paman seayah",
    category: "uncle",
    gender: "male",
  },

  {
    id: "wala",
    arabic: "المولى",
    name: "Wala'",
    category: "wala",
    gender: "male",
  },
];
