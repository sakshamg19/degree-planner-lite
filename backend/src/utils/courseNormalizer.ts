/**
 * Pure utility for normalizing UW-Madison course codes and detecting cross-listed equivalents.
 * No external dependencies — operates entirely on strings and lookup tables.
 */

/** Maps common subject abbreviations to their canonical normalized form. */
export const ALIAS_MAP: Record<string, string> = {
  "CS": "COMPSCI",
  "COMP SCI": "COMPSCI",
  "COMPSCI": "COMPSCI",
  "E C E": "ECE",
  "ECE": "ECE",
  "MATHEMATICS": "MATH",
  "MATH": "MATH",
  "STATS": "STAT",
  "STATISTICS": "STAT",
  "STAT": "STAT",
  "PHYSICS": "PHYSICS",
  "ENGLISH": "ENGLISH",
  "PHILOS": "PHILOS",
  "PHILOSOPHY": "PHILOS",
  "HISTORY": "HISTORY",
  "SPANISH": "SPANISH",
  "ANTHRO": "ANTHRO",
  "ECON": "ECON",
  "POLISCI": "POLISCI",
  "PSYCH": "PSYCH",
  "SOC": "SOC",
  "BIOLOGY": "BIOLOGY",
  "CHEM": "CHEM",
  "INTERLS": "INTERLS",
};

/**
 * Bidirectional cross-listing equivalence table.
 * Each normalized code maps to an array of codes it is cross-listed with.
 */
export const CROSS_LISTINGS: Record<string, string[]> = {
  "COMPSCI240": ["MATH240"],
  "MATH240": ["COMPSCI240"],
  "COMPSCI252": ["ECE252"],
  "ECE252": ["COMPSCI252"],
  "COMPSCI354": ["ECE354"],
  "ECE354": ["COMPSCI354"],
  "COMPSCI506": ["ECE506"],
  "ECE506": ["COMPSCI506"],
  "COMPSCI552": ["ECE552"],
  "ECE552": ["COMPSCI552"],
  "STAT309": ["MATH309"],
  "MATH309": ["STAT309"],
  "STAT431": ["MATH431"],
  "MATH431": ["STAT431"],
};

/**
 * Normalizes a subject and course number into a canonical code.
 * @param subject - e.g. "COMP SCI", "CS", "E C E"
 * @param number - e.g. "300", "354"
 * @returns Canonical normalized code, e.g. "COMPSCI300"
 */
export function normalizeCode(subject: string, number: string): string {
  const trimmedSubject = subject.trim().toUpperCase();
  const trimmedNumber = number.trim();
  const canonical = ALIAS_MAP[trimmedSubject] || trimmedSubject.replace(/\s+/g, "");
  return `${canonical}${trimmedNumber}`;
}

/**
 * Parses a raw course code string and normalizes it.
 * @param raw - e.g. "COMP SCI 300", "CS 300", "COMPSCI300"
 * @returns Canonical normalized code, e.g. "COMPSCI300"
 */
export function normalizeRawCode(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.+?)\s*(\d+)$/);
  if (!match) {
    return trimmed.toUpperCase().replace(/\s+/g, "");
  }
  return normalizeCode(match[1], match[2]);
}

/**
 * Checks if two normalized course codes are equivalent (direct match or cross-listed).
 * @param code1 - First normalized code
 * @param code2 - Second normalized code
 * @returns true if the codes refer to the same course
 */
export function areEquivalent(code1: string, code2: string): boolean {
  if (code1 === code2) return true;
  const equivalents = CROSS_LISTINGS[code1];
  return equivalents !== undefined && equivalents.includes(code2);
}
