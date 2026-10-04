// =======================================================================
// IAAS NÖHÜ Web Platformu - Kimlik Doğrulama & Üyelik Servisi
// =======================================================================
// Hem mevcut yerel depolama (localStorage) hem de Firebase Auth & Cloud Firestore
// ile hibrit çalışabilen mimari servis adaptörü.
// =======================================================================

import { auth, db, isFirebaseConfigured } from "../firebase";
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

  // 1. Öğrenci numarası Firestore'da zaten kayıtlı mı kontrol et
  try {
    const sNoDoc = await getDoc(doc(db, "studentNumbers", cleanStudentNo));
    if (sNoDoc.exists()) {
      const err = new Error(
        "Bu öğrenci numarası ile kayıtlı bir üye zaten mevcut. Lütfen bilgilerinizi kontrol edin veya giriş yapın."
      );
      err.code = "custom/duplicate-student-no";
      throw err;
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
  const isFerit = cleanEmail === "colakferit21@gmail.com";
  
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
    role: isFerit ? "admin" : "member",
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

  // 5. Öğrenci no tekillik indeksine kaydet
  try {
    await setDoc(doc(db, "studentNumbers", cleanStudentNo), {
      uid: user.uid,
      email: cleanEmail,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Öğrenci numarası indeksi yazılamadı:", e);
  }

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

  // Eğer girilen değer e-posta değilse (öğrenci no ise), Firestore'dan e-postasını bul
  if (!emailToUse.includes("@")) {
    const cleanNo = emailToUse.replace(/[^a-zA-Z0-9]/g, "");
    try {
      const sNoDoc = await getDoc(doc(db, "studentNumbers", cleanNo));
      if (sNoDoc.exists() && sNoDoc.data().email) {
        emailToUse = sNoDoc.data().email;
      } else {
        // studentNumbers'ta bulunamazsa users koleksiyonunda ara
        const q = query(collection(db, "users"), where("cleanStudentNo", "==", cleanNo));
        const snap = await getDocs(q);
        if (!snap.empty) {
          emailToUse = snap.docs[0].data().email;
        }
      }
    } catch (e) {
      console.warn("Öğrenci no ile e-posta aranırken hata:", e);
    }
  }

  const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
  const user = userCredential.user;

  // Firestore'dan kullanıcı profilini al
  const userDocRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userDocRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      id: user.uid,
      uid: user.uid,
      ...data,
    };
  }

  return {
    id: user.uid,
    uid: user.uid,
    name: user.displayName || user.email.split("@")[0],
    email: user.email,
    role: user.email === "colakferit21@gmail.com" ? "admin" : "member",
    status: "Aktif",
  };
};

/**
 * Firebase oturumunu kapatır.
 */
export const logoutWithFirebase = async () => {
  if (isFirebaseConfigured() && auth) {
    await signOut(auth);
  }
};
