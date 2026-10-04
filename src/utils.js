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

/**
 * Yönetici (Admin) hesaplarını tespit eder.
 * AdminTR veya Ferit Çolak hesapları ve Firestore'da rolü 'admin' olan kullanıcılar tam yetkiye sahip olur.
 */
export function isAdminUser(target) {
  if (!target) return false;
  if (typeof target === "string") {
    const clean = target.trim().toLowerCase();
    const cleanDigits = clean.replace(/[^a-zA-Z0-9]/g, "");
    return (
      clean === "admintr@ohu.edu.tr" ||
      clean === "admin" ||
      clean === "admintr" ||
      clean === "drj92uslignftnleopd2umd9hoh2" ||
      cleanDigits === "240102020" ||
      clean === "colakferit21@gmail.com" ||
      clean === "feritefeturksadcolak@ohu.edu.tr" ||
      clean.startsWith("feritefeturksadcolak") ||
      cleanDigits === "240102015" ||
      cleanDigits === "210405001" ||
      (clean.includes("ferit") && (clean.includes("colak") || clean.includes("çolak")))
    );
  }

  if (target.role === "admin") return true;

  const em = (target.email || "").trim().toLowerCase();
  const sNo = normalizeStudentNo(target.studentNo || target.cleanStudentNo);
  const name = (target.name || "").trim().toLowerCase();
  const uid = (target.uid || target.id || "").trim();

  return (
    uid === "dRJ92UsligNfTNlEopd2UMd9HOH2" ||
    em === "admintr@ohu.edu.tr" ||
    name === "admintr" ||
    name.includes("admintr") ||
    sNo === "240102020" ||
    em === "colakferit21@gmail.com" ||
    em === "feritefeturksadcolak@ohu.edu.tr" ||
    em.startsWith("feritefeturksadcolak") ||
    sNo === "240102015" ||
    sNo === "210405001" ||
    (name.includes("ferit") && (name.includes("colak") || name.includes("çolak")))
  );
}

/**
 * Geriye dönük uyumluluk için alias
 */
export function isFeritUser(target) {
  return isAdminUser(target);
}

