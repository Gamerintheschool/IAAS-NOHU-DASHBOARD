// =======================================================================
// IAAS NÖHÜ Web Platformu - Kimlik Doğrulama & Üyelik Servisi
// =======================================================================
// Hem mevcut yerel depolama (localStorage) hem de Firebase Auth & Cloud Firestore
// ile hibrit çalışabilen mimari servis adaptörü.
// =======================================================================

import { auth, db, isFirebaseConfigured } from "../firebase";
import { isAdminUser, isFeritUser } from "../utils.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Bilinen öğrenci numarası - e-posta haritası (gecikmesiz ve hatasız doğrudan çözümleme)
 */
export const KNOWN_STUDENT_MAP = {
  "admintr": "admintr@ohu.edu.tr",
  "admin": "admintr@ohu.edu.tr",
  "240102020": "admintr@ohu.edu.tr",
  "240102015": "feritefeturksadcolak@ohu.edu.tr",
  "ferit": "feritefeturksadcolak@ohu.edu.tr",
  "210405001": "colakferit21@gmail.com",
  "250102009": "arda.torna@ohu.edu.tr",
  "arda": "arda.torna@ohu.edu.tr",
  "210405012": "deniz.yilmaz@ohu.edu.tr",
  "220405034": "ahmet.cetin@ohu.edu.tr",
  "230405088": "zeynep.kaya@ohu.edu.tr",
};

/**
 * Öğrenci numarasını yerel önbellek veya bilinen haritadan çözer.
 */
export const getCachedEmailForStudent = (studentNo) => {
  if (!studentNo) return null;
  const clean = studentNo.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  if (KNOWN_STUDENT_MAP[clean]) return KNOWN_STUDENT_MAP[clean];
  try {
    const map = JSON.parse(localStorage.getItem("iaas_student_map") || "{}");
    if (map[clean]) return map[clean];
  } catch {}
  return null;
};

/**
 * Öğrenci numarası ve e-posta eşleşmesini tarayıcı önbelleğine kaydeder.
 */
export const cacheStudentEmail = (studentNo, email) => {
  if (!studentNo || !email) return;
  const clean = studentNo.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  try {
    const map = JSON.parse(localStorage.getItem("iaas_student_map") || "{}");
    map[clean] = cleanEmail;
    localStorage.setItem("iaas_student_map", JSON.stringify(map));
  } catch {}
};

/**
 * Şifre kuralı doğrulaması: En az 6, en fazla 12 karakter
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export const validatePassword = (password) => {
  if (typeof password !== "string") {
    return { valid: false, message: "Geçersiz şifre formatı." };
  }
  if (password.length < 6 || password.length > 12) {
    return {
      valid: false,
      message: "Belirleyeceğiniz şifre 6 ile 12 karakter arasında olmalıdır.",
    };
  }
  return { valid: true, message: "" };
};

/**
 * Firebase hata kodlarını Türkçe kullanıcı dostu mesajlara çevirir.
 * @param {Error|Object} error
 * @returns {string}
 */
export const getFirebaseErrorMessage = (error) => {
  if (!error) return "Bilinmeyen bir hata oluştu.";
  const code = error.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Bu e-posta adresiyle kayıtlı bir hesap zaten mevcut. Lütfen giriş yapın.";
    case "auth/invalid-email":
      return "Lütfen geçerli bir e-posta adresi girin.";
    case "auth/weak-password":
      return "Şifre güvenlik kriterlerini karşılamıyor. En az 6 karakter olmalıdır.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Girdiğiniz e-posta veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.";
    case "auth/network-request-failed":
      return "İnternet bağlantınızı kontrol edin. Firebase sunucusuna ulaşılamadı.";
    case "auth/too-many-requests":
      return "Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.";
    case "auth/operation-not-allowed":
      return "E-posta ile giriş henüz Firebase Console üzerinden aktif edilmemiş. Lütfen Authentication > Sign-in method sekmesini kontrol edin.";
    case "permission-denied":
      return "Veritabanı erişim izni reddedildi. Lütfen Firestore kurallarını kontrol edin.";
    default:
      return error.message || "İşlem sırasında bir hata oluştu.";
  }
};

/**
 * E-posta adresinin yalnızca '@mail.ohu.edu.tr' uzantılı olup olmadığını denetler.
 * Yeni üye kayıtları için '@mail.ohu.edu.tr' formatı zorunludur.
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
export const validateOhuEmail = (email) => {
  if (typeof email !== "string" || !email.trim()) {
    return { valid: false, message: "Lütfen bir e-posta adresi girin." };
  }
  const clean = email.trim().toLowerCase();
  const domain = "@mail.ohu.edu.tr";
  if (!clean.endsWith(domain) || clean.length <= domain.length) {
    return {
      valid: false,
      message: "Kulüp üyeliği için yalnızca '@mail.ohu.edu.tr' uzantılı öğrenci e-posta adresinizi kullanabilirsiniz.",
    };
  }
  return { valid: true, message: "" };
};

/**
 * Firebase ile yeni üye kaydı oluşturur ve Firestore 'users' koleksiyonuna profili kaydeder.
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const registerWithFirebase = async ({
  email,
  password,
  name,
  studentNo,
  faculty,
  department,
  phone = "",
}) => {
  // E-posta uzantı kontrolü (@mail.ohu.edu.tr)
  const emailCheck = validateOhuEmail(email);
  if (!emailCheck.valid) {
    const err = new Error(emailCheck.message);
    err.code = "custom/invalid-email-domain";
    throw err;
  }

  // Şifre kuralı kontrolü
  const pwCheck = validatePassword(password);
  if (!pwCheck.valid) {
    throw new Error(pwCheck.message);
  }

  if (!isFirebaseConfigured() || !auth || !db) {
    throw new Error(
      "Firebase henüz yapılandırılmamış. Lütfen .env dosyasındaki anahtarları tanımlayın."
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanStudentNo = studentNo.trim().replace(/[^a-zA-Z0-9]/g, "");
  const isAdmin = isAdminUser({ email: cleanEmail, studentNo, name });

  // 1. Öğrenci numarası Firestore'da zaten kayıtlı mı kontrol et
  try {
    const sNoDoc = await getDoc(doc(db, "studentNumbers", cleanStudentNo));
    if (sNoDoc.exists()) {
      const existingData = sNoDoc.data();
      const existingEmail = (existingData?.email || "").trim().toLowerCase();
      const isSameUser = existingEmail === cleanEmail;

      if (!isSameUser) {
        const err = new Error(
          "Bu öğrenci numarası ile kayıtlı bir üye zaten mevcut. Lütfen bilgilerinizi kontrol edin veya giriş yapın."
        );
        err.code = "custom/duplicate-student-no";
        throw err;
      }
    }
  } catch (e) {
    if (e.code === "custom/duplicate-student-no") throw e;
    // Kural izin vermiyorsa veya offline ise devam et
  }

  // 2. Firebase Auth üzerinde kullanıcı oluştur
  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  // 3. Auth profilini isim ile güncelle
  try {
    await updateProfile(user, { displayName: name.trim() });
  } catch (e) {
    console.warn("Display name güncellenemedi:", e);
  }

  // 4. Firestore 'users' koleksiyonunda üye dokümanı oluştur
  const userDocRef = doc(db, "users", user.uid);
  
  const userData = {
    uid: user.uid,
    id: user.uid,
    name: name.trim(),
    email: cleanEmail,
    studentNo: studentNo.trim(),
    cleanStudentNo,
    faculty: faculty.trim(),
    department: department.trim(),
    phone: phone ? phone.trim() : "Belirtilmedi",
    role: isAdmin ? "admin" : "member",
    status: "Aktif",
    avatar: name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
    joinedDate: new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date()),
    createdAt: serverTimestamp(),
  };

  await setDoc(userDocRef, userData);

  // 4b. Admin yetkisine sahipse Firestore 'admins' koleksiyonuna da kaydet
  if (isAdmin) {
    try {
      await setDoc(
        doc(db, "admins", user.uid),
        {
          uid: user.uid,
          id: user.uid,
          name: name.trim(),
          email: cleanEmail,
          studentNo: studentNo.trim(),
          cleanStudentNo,
          role: "admin",
          status: "Aktif",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (adminErr) {
      console.warn("Admin tablosu yazma uyarısı:", adminErr);
    }
  }

  // 5. Öğrenci no tekillik indeksine kaydet ve yerel önbelleğe al
  try {
    await setDoc(doc(db, "studentNumbers", cleanStudentNo), {
      uid: user.uid,
      email: cleanEmail,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Öğrenci numarası indeksi yazılamadı:", e);
  }
  cacheStudentEmail(cleanStudentNo, cleanEmail);

  return userData;
};

/**
 * Firebase ile e-posta veya öğrenci numarası ve şifre kullanarak giriş yapar.
 * @param {string} identifier (E-posta veya Öğrenci No)
 * @param {string} password
 * @returns {Promise<Object>}
 */
export const loginWithFirebase = async (identifier, password) => {
  if (!isFirebaseConfigured() || !auth || !db) {
    throw new Error(
      "Firebase henüz yapılandırılmamış. Lütfen .env dosyasındaki anahtarları tanımlayın."
    );
  }

  let emailToUse = identifier.trim().toLowerCase();

  // Eğer girilen değer e-posta değilse (öğrenci no veya kullanıcı adı ise), e-postasını çözümle
  if (!emailToUse.includes("@")) {
    const cleanNo = emailToUse.replace(/[^a-zA-Z0-9]/g, "");

    // 1. Aşama: Bilinen harita ve yerel önbellek
    const cachedEmail = getCachedEmailForStudent(cleanNo);
    if (cachedEmail) {
      emailToUse = cachedEmail;
    } else {
      // 2. Aşama: Firestore 'studentNumbers' tekillik koleksiyonundan sorgula
      try {
        const sNoDoc = await getDoc(doc(db, "studentNumbers", cleanNo));
        if (sNoDoc.exists() && sNoDoc.data()?.email) {
          emailToUse = sNoDoc.data().email.trim().toLowerCase();
          cacheStudentEmail(cleanNo, emailToUse);
        } else {
          // 3. Aşama: Firestore 'users' koleksiyonunda cleanStudentNo ile ara
          const q = query(collection(db, "users"), where("cleanStudentNo", "==", cleanNo));
          const snap = await getDocs(q);
          if (!snap.empty && snap.docs[0].data()?.email) {
            emailToUse = snap.docs[0].data().email.trim().toLowerCase();
            cacheStudentEmail(cleanNo, emailToUse);
          }
        }
      } catch (e) {
        console.warn("Öğrenci no ile e-posta aranırken hata:", e);
      }

      // 4. Aşama: Yerel kütükten e-posta adresini çözümle
      if (!emailToUse.includes("@")) {
        try {
          const stored = JSON.parse(localStorage.getItem("iaas_members")) || [];
          const localFound = stored.find(
            (m) =>
              m.studentNo &&
              m.studentNo.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === cleanNo.toLowerCase()
          );
          if (localFound && localFound.email) {
            emailToUse = localFound.email.trim().toLowerCase();
            cacheStudentEmail(cleanNo, emailToUse);
          }
        } catch {}
      }
    }

    // 5. Aşama: Eğer hiçbir yerde bulunamadıysa açıklayıcı hata bildir
    if (!emailToUse.includes("@")) {
      const err = new Error(
        `"${identifier}" numaralı öğrenciye ait kayıtlı bir hesap bulunamadı. Lütfen '@mail.ohu.edu.tr' veya '@ohu.edu.tr' uzantılı öğrenci e-postanız ile giriş yapmayı deneyin veya yeni üye kaydı oluşturun.`
      );
      err.code = "custom/student-not-found";
      throw err;
    }
  }

  const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
  const user = userCredential.user;

  // Firestore'dan kullanıcı profilini al
  const userDocRef = doc(db, "users", user.uid);
  let profile = null;

  try {
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data();

      // Firestore 'admins' koleksiyonundan kontrol et
      let isDbAdmin = false;
      try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
          isDbAdmin = true;
        }
      } catch {}

      const isAdmin =
        isDbAdmin ||
        isAdminUser({ ...data, email: user.email, id: user.uid, uid: user.uid });

      profile = {
        id: user.uid,
        uid: user.uid,
        ...data,
        role: isAdmin ? "admin" : (data.role || "member"),
      };

      // Eğer Firestore'daki rol 'member' fakat hesap AdminTR gibi yetkili hesap ise, Firestore dokümanını güncelle
      if (isAdmin && data.role !== "admin") {
        try {
          await setDoc(userDocRef, { role: "admin" }, { merge: true });
          profile.role = "admin";
        } catch (syncErr) {
          console.warn("Firestore rol güncellemesi kaydedilemedi:", syncErr);
        }
      }

      // Admin ise 'admins' tablosuna kaydet
      if (isAdmin) {
        try {
          await setDoc(
            doc(db, "admins", user.uid),
            {
              uid: user.uid,
              id: user.uid,
              name: profile.name || user.displayName || "Admin",
              email: profile.email || emailToUse,
              studentNo: profile.studentNo || "",
              cleanStudentNo: profile.cleanStudentNo || "",
              role: "admin",
              status: profile.status || "Aktif",
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch {}
      }
    }
  } catch (err) {
    console.warn("Firestore profil yükleme uyarısı:", err);
  }

  if (!profile) {
    const isAdmin = isAdminUser({
      email: user.email,
      id: user.uid,
      uid: user.uid,
      name: user.displayName,
    });
    profile = {
      uid: user.uid,
      id: user.uid,
      name: user.displayName || (user.email === "admintr@ohu.edu.tr" ? "AdminTR" : user.email.split("@")[0]),
      email: user.email,
      studentNo: user.email === "admintr@ohu.edu.tr" ? "240102020" : "",
      cleanStudentNo: user.email === "admintr@ohu.edu.tr" ? "240102020" : "",
      faculty: "Tarım Bilimleri ve Teknolojileri Fakültesi",
      department: "Tarımsal Genetik Mühendisliği",
      phone: "Belirtilmedi",
      role: isAdmin ? "admin" : "member",
      status: "Aktif",
      joinedDate: new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
      avatar: (user.displayName || user.email || "ÜY").slice(0, 2).toUpperCase(),
    };

    try {
      await setDoc(userDocRef, profile, { merge: true });
    } catch {}

    if (isAdmin) {
      try {
        await setDoc(
          doc(db, "admins", user.uid),
          {
            uid: user.uid,
            id: user.uid,
            name: profile.name,
            email: profile.email,
            studentNo: profile.studentNo,
            cleanStudentNo: profile.cleanStudentNo,
            role: "admin",
            status: "Aktif",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch {}
    }
  }

  // Öğrenci numarası mevcutsa önbelleğe kaydet
  if (profile.studentNo) {
    cacheStudentEmail(profile.studentNo, profile.email);
  }

  return profile;
};

/**
 * Firebase oturumunu kapatır.
 */
export const logoutWithFirebase = async () => {
  if (isFirebaseConfigured() && auth) {
    await signOut(auth);
  }
};
