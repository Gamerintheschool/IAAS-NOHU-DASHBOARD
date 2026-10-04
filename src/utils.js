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
 * Ferit Çolak'a ait hesapları (e-posta, öğrenci no veya isim) tespit eder.
 * Bu kriterlere uyan tüm hesaplar platform genelinde otomatik olarak Kulüp Yöneticisi (Admin) yetkisine sahip olur.
 *
 * Eşleşmeler:
 *  - E-posta: feritefeturksadcolak@ohu.edu.tr, Colakferit21@gmail.com, feritefeturksadcolak...
 *  - Öğrenci No: 240102015, 210405001
 *  - İsim: Ferit Efe Türkşad Çolak, Ferit Çolak
 */
export function isFeritUser(target) {
  if (!target) return false;
  if (typeof target === "string") {
    const clean = target.trim().toLowerCase();
    const cleanDigits = clean.replace(/[^a-zA-Z0-9]/g, "");
    return (
      clean === "colakferit21@gmail.com" ||
      clean === "feritefeturksadcolak@ohu.edu.tr" ||
      clean.startsWith("feritefeturksadcolak") ||
      cleanDigits === "240102015" ||
      cleanDigits === "210405001" ||
      (clean.includes("ferit") && (clean.includes("colak") || clean.includes("çolak")))
    );
  }
  const em = (target.email || "").trim().toLowerCase();
  const sNo = normalizeStudentNo(target.studentNo || target.cleanStudentNo);
  const name = (target.name || "").trim().toLowerCase();
  return (
    em === "colakferit21@gmail.com" ||
    em === "feritefeturksadcolak@ohu.edu.tr" ||
    em.startsWith("feritefeturksadcolak") ||
    sNo === "240102015" ||
    sNo === "210405001" ||
    (name.includes("ferit") && (name.includes("colak") || name.includes("çolak")))
  );
}

