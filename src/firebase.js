// =======================================================================
// IAAS NÖHÜ Web Platformu - Firebase Entegrasyon Modülü
// =======================================================================
// Bu dosya, Firebase Auth ve Cloud Firestore entegrasyonu için yapılandırılmıştır.
// .env dosyasında geçerli Firebase anahtarları tanımlandığında otomatik olarak devreye girer.
// Tanımlanmadığında sistem kesintisiz olarak yerel (localStorage / mock) modda çalışmaya devam eder.
// =======================================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

/**
 * Firebase ortam değişkenlerinin doldurulup doldurulmadığını kontrol eder.
 * @returns {boolean}
 */
export const isFirebaseConfigured = () => {
  const key = firebaseConfig.apiKey?.trim();
  const projectId = firebaseConfig.projectId?.trim();
  return Boolean(
    key &&
    !key.includes("Dummy") &&
    !key.includes("Replace") &&
    key.length > 10 &&
    projectId &&
    projectId.length > 2
  );
};

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.info("[Firebase] IAAS NÖHÜ Firebase bağlantısı başarıyla kuruldu.");
  } catch (error) {
    console.warn("[Firebase] Başlatma sırasında hata:", error);
  }
}

export { app, auth, db };
