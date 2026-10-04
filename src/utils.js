/**
 * IAAS NÖHÜ Platform - Utility Functions
 */

/**
 * Normalizes student numbers for consistent comparisons and duplicate prevention.
 * Strips whitespace, hyphens, dots, and non-alphanumeric characters, converts to lowercase.
 * Example: " 2104 05012 " -> "210405012"
 * Example: "2104-05-012" -> "210405012"
 */
export function normalizeStudentNo(val) {
  if (!val) return "";
  return String(val)
    .replace(/[^a-zA-Z0-9]/g, "")
    .trim()
    .toLowerCase();
}
