/**
 * Bilingual (EN ⇄ BN) text helpers.
 *
 * Bengali locale renders its own digits (০১২৩৪৫৬৭৮৯) and unit words.
 * Every user-visible number/quantifier on the site flows through here so
 * that switching language localizes the WHOLE page — digits included.
 */

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Convert every Western digit in a string/number to Bengali digits. */
export function toBnDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** Localize digits only — Western digits stay for English. */
export function localizeDigits(input: string | number, isBn: boolean): string {
  return isBn ? toBnDigits(input) : String(input);
}

/**
 * Known English unit words that can appear inside data-driven suffixes
 * (e.g. the " Years" suffix of a stat). Maps them to Bengali equivalents
 * so legacy Firebase data without `suffixBn` still localizes.
 */
const SUFFIX_WORD_MAP: Record<string, string> = {
  years: "বছর",
  year: "বছর",
  months: "মাস",
  month: "মাস",
  days: "দিন",
  day: "দিন",
  hours: "ঘন্টা",
  hour: "ঘন্টা",
  people: "জন",
  clients: "জন",
  projects: "টি",
  percent: "%",
};

/**
 * Localize a data-driven suffix like " Years", "+", "K", "%".
 * - English mode → unchanged.
 * - Bengali mode → replaces known English words with Bengali equivalents.
 */
export function localizeSuffix(suffix: string | undefined, isBn: boolean): string {
  const s = suffix ?? "";
  if (!isBn || !s) return s;
  return s.replace(/[A-Za-z]+/g, (word) => {
    const mapped = SUFFIX_WORD_MAP[word.toLowerCase()];
    return mapped ?? word;
  });
}

/** Pick the Bengali suffix when available (data field wins over the word map). */
export function pickSuffix(
  isBn: boolean,
  suffix: string | undefined,
  suffixBn?: string | null
): string {
  if (isBn && suffixBn !== undefined && suffixBn !== null && suffixBn !== "") return suffixBn;
  return localizeSuffix(suffix, isBn);
}
