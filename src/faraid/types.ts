export type HeirId =
  | "husband"
  | "wife"
  | "son"
  | "daughter"
  | "father"
  | "mother"
  | "paternalGrandfather"
  | "maternalGrandmother"
  | "paternalGrandmother"
  | "fullBrother"
  | "fullSister"
  | "paternalBrother"
  | "paternalSister"
  | "maternalBrother"
  | "maternalSister"
  | "sonsSon"
  | "sonsDaughter"
  | "fullBrothersSon"
  | "paternalBrothersSon"
  | "fullUncle"
  | "paternalUncle"
  | "fullUnclesSon"
  | "paternalUnclesSon"
  | "wala";

export type ShareType =
  | "FARD"
  | "ASHABAH"
  | "FARD_AND_ASHABAH"
  | "BLOCKED"
  | "NONE";

export interface HeirDefinition {
  id: HeirId;
  arabic: string;
  name: string;
  category:
    | "spouse"
    | "descendant"
    | "ascendant"
    | "sibling"
    | "nephew"
    | "uncle"
    | "wala";
  gender: "male" | "female";
}

export interface HeirInput {
  id: HeirId;
  count: number;
}

export interface HeirResult {
  id: HeirId;
  count: number;
  shareType: ShareType;
  blocked: boolean;
  reason?: string;
  fraction?: string;
  shares?: number;
}

export interface FaraidCase {
  deceasedGender: "male" | "female";
  estate: number;
  funeralCost: number;
  debt: number;
  bequest: number;
  heirs: HeirInput[];
}

export interface FaraidResult {
  caseData: FaraidCase;
  heirs: HeirResult[];
  origin: number | null;
  totalShares: number;
  notes: string[];
}
