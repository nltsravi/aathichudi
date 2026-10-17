export interface RawKadavulVaazthu {
  line1?: string;
  line2?: string;
  [key: `poem${number}`]: string | undefined;
  meaning?: string;
  paraphrase?: string;
  paraphase?: string;
  translation?: string;
}

export interface RawAathichoodiVerse {
  number?: number;
  poem?: string;
  meaning?: string;
  paraphrase?: string;
  paraphase?: string;
  transliteration?: string;
  translation?: string;
  [key: string]: unknown;
}

export interface RawAathichudiDataset {
  kadavul_vaazthu?: RawKadavulVaazthu;
  aathichoodi?: RawAathichoodiVerse[];
}
