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
 * Dinamik Admin Veritabanı Kayıtları (Firestore 'admins' koleksiyonu & yerel önbellek)
 */
const dynamicAdminSet = new Set();

// Başlangıçta localStorage'dan dinamik admin kayıtlarını yükle
try {
  const cached = JSON.parse(localStorage.getItem("iaas_dynamic_admins") || "[]");
  if (Array.isArray(cached)) {
    cached.forEach((item) => {
      if (typeof item === "string") {
        const cl = item.trim().toLowerCase();
        dynamicAdminSet.add(cl);
        const digits = cl.replace(/[^a-zA-Z0-9]/g, "");
        if (digits) dynamicAdminSet.add(digits);
      } else if (item && typeof item === "object") {
        if (item.uid) dynamicAdminSet.add(String(item.uid).trim().toLowerCase());
        if (item.id) dynamicAdminSet.add(String(item.id).trim().toLowerCase());
        if (item.email) dynamicAdminSet.add(String(item.email).trim().toLowerCase());
        if (item.studentNo) dynamicAdminSet.add(normalizeStudentNo(item.studentNo));
        if (item.cleanStudentNo) dynamicAdminSet.add(normalizeStudentNo(item.cleanStudentNo));
        if (item.name) dynamicAdminSet.add(String(item.name).trim().toLowerCase());
      }
    });
  }
} catch {}

/**
 * Firestore'dan gelen admin listesini dinamik olarak kaydeder ve yerel hafızayı günceller.
 */
export function setDynamicAdmins(adminsList) {
  dynamicAdminSet.clear();
  if (Array.isArray(adminsList)) {
    try {
      localStorage.setItem("iaas_dynamic_admins", JSON.stringify(adminsList));
    } catch {}
    adminsList.forEach((item) => {
      if (typeof item === "string") {
        const cl = item.trim().toLowerCase();
        dynamicAdminSet.add(cl);
        const digits = cl.replace(/[^a-zA-Z0-9]/g, "");
        if (digits) dynamicAdminSet.add(digits);
      } else if (item && typeof item === "object") {
        if (item.uid) dynamicAdminSet.add(String(item.uid).trim().toLowerCase());
        if (item.id) dynamicAdminSet.add(String(item.id).trim().toLowerCase());
        if (item.email) dynamicAdminSet.add(String(item.email).trim().toLowerCase());
        if (item.studentNo) dynamicAdminSet.add(normalizeStudentNo(item.studentNo));
        if (item.cleanStudentNo) dynamicAdminSet.add(normalizeStudentNo(item.cleanStudentNo));
        if (item.name) dynamicAdminSet.add(String(item.name).trim().toLowerCase());
      }
    });
  }
}

/**
 * Dinamik admin hafızasına anlık olarak yeni bir yönetici ekler ve yerel önbelleğe yazar.
 */
export function addDynamicAdmin(item) {
  if (!item) return;
  if (typeof item === "string") {
    const cl = item.trim().toLowerCase();
    dynamicAdminSet.add(cl);
    const digits = cl.replace(/[^a-zA-Z0-9]/g, "");
    if (digits) dynamicAdminSet.add(digits);
  } else if (typeof item === "object") {
    if (item.uid) dynamicAdminSet.add(String(item.uid).trim().toLowerCase());
    if (item.id) dynamicAdminSet.add(String(item.id).trim().toLowerCase());
    if (item.email) dynamicAdminSet.add(String(item.email).trim().toLowerCase());
    if (item.studentNo) dynamicAdminSet.add(normalizeStudentNo(item.studentNo));
    if (item.cleanStudentNo) dynamicAdminSet.add(normalizeStudentNo(item.cleanStudentNo));
    if (item.name) dynamicAdminSet.add(String(item.name).trim().toLowerCase());
  }
  try {
    const existing = JSON.parse(localStorage.getItem("iaas_dynamic_admins") || "[]");
    const updated = Array.isArray(existing) ? [...existing, item] : [item];
    localStorage.setItem("iaas_dynamic_admins", JSON.stringify(updated));
  } catch {}
}

/**
 * Dinamik admin hafızasından ve yerel önbellekten bir yöneticiyi siler.
 */
export function removeDynamicAdmin(item) {
  if (!item) return;
  const toRemove = new Set();
  if (typeof item === "string") {
    const cl = item.trim().toLowerCase();
    toRemove.add(cl);
    const digits = cl.replace(/[^a-zA-Z0-9]/g, "");
    if (digits) toRemove.add(digits);
  } else if (typeof item === "object") {
    if (item.uid) toRemove.add(String(item.uid).trim().toLowerCase());
    if (item.id) toRemove.add(String(item.id).trim().toLowerCase());
    if (item.email) toRemove.add(String(item.email).trim().toLowerCase());
    if (item.studentNo) toRemove.add(normalizeStudentNo(item.studentNo));
    if (item.cleanStudentNo) toRemove.add(normalizeStudentNo(item.cleanStudentNo));
  }
  toRemove.forEach((key) => dynamicAdminSet.delete(key));
  try {
    const existing = JSON.parse(localStorage.getItem("iaas_dynamic_admins") || "[]");
    if (Array.isArray(existing)) {
      const filtered = existing.filter((admin) => {
        if (typeof admin === "string") return !toRemove.has(admin.trim().toLowerCase());
        const uid = String(admin.uid || admin.id || "").toLowerCase();
        const em = String(admin.email || "").toLowerCase();
        const sNo = normalizeStudentNo(admin.studentNo || admin.cleanStudentNo);
        return !toRemove.has(uid) && !toRemove.has(em) && !toRemove.has(sNo);
      });
      localStorage.setItem("iaas_dynamic_admins", JSON.stringify(filtered));
    }
  } catch {}
}

/**
 * Mevcut dinamik admin listesini döndürür.
 */
export function getDynamicAdmins() {
  return Array.from(dynamicAdminSet);
}

/**
 * Yönetici (Admin) hesaplarını tespit eder.
 * Veritabanındaki 'admins' tablosu, 'admin' rolü veya yetkili hesaplar kontrol edilir.
 */
export function isAdminUser(target) {
  if (!target) return false;
  if (typeof target === "string") {
    const clean = target.trim().toLowerCase();
    const cleanDigits = clean.replace(/[^a-zA-Z0-9]/g, "");
    if (
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
    ) {
      return true;
    }
    return dynamicAdminSet.has(clean) || (!!cleanDigits && dynamicAdminSet.has(cleanDigits));
  }

  if (target.role === "admin") return true;

  const em = (target.email || "").trim().toLowerCase();
  const sNo = normalizeStudentNo(target.studentNo || target.cleanStudentNo);
  const name = (target.name || "").trim().toLowerCase();
  const uid = (target.uid || target.id || "").trim().toLowerCase();

  if (
    uid === "drj92uslignftnleopd2umd9hoh2" ||
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
  ) {
    return true;
  }

  return (
    (!!uid && dynamicAdminSet.has(uid)) ||
    (!!em && dynamicAdminSet.has(em)) ||
    (!!sNo && dynamicAdminSet.has(sNo)) ||
    (!!name && dynamicAdminSet.has(name))
  );
}

/**
 * Geriye dönük uyumluluk için alias
 */
export function isFeritUser(target) {
  return isAdminUser(target);
}


