// =======================================================================
// IAAS NÖHÜ - Firebase Test & Sahte Hesap Temizleme Aracı
// =======================================================================
// Bu script, Firebase Authentication ve Firestore veritabanındaki test ve
// sahte hesapları güvenle temizler.
// Ferit Efe Türkşad Çolak hesabını kesinlikle korur.
// =======================================================================

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");

if (!fs.existsSync(envPath)) {
  console.error(".env dosyası bulunamadı:", envPath);
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, "utf-8");
const config = {};
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v.length) {
    const key = k.trim().replace("VITE_", "");
    config[key] = v.join("=").trim();
  }
});

const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY,
  authDomain: config.FIREBASE_AUTH_DOMAIN,
  projectId: config.FIREBASE_PROJECT_ID,
  storageBucket: config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
  appId: config.FIREBASE_APP_ID,
};

console.log("=================================================");
console.log("IAAS NÖHÜ - Firebase Sahte Hesap Temizleme Aracı");
console.log("=================================================");
console.log("Proje ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function isRealAccount(user) {
  const email = (user.email || "").trim().toLowerCase();
  const sNo = (user.studentNo || "").trim();
  const uid = user.uid || user.id || "";

  if (email === "feritefeturksadcolak@ohu.edu.tr") return true;
  if (email === "colakferit21@gmail.com") return true;
  if (sNo === "240102015") return true;
  if (sNo === "210405001") return true;
  if (uid === "Af0uitmKEpUEKAs36JmViVOxb593") return true;
  return false;
}

async function runCleanup() {
  let tempAuthUser = null;
  try {
    const tempEmail = `cleaner_bot_${Date.now()}@ohu.edu.tr`;
    const tempCred = await createUserWithEmailAndPassword(auth, tempEmail, "CleanerPass123!");
    tempAuthUser = tempCred.user;
    console.log("Geçici bot ile Firestore'a bağlanıldı.");

    const usersSnap = await getDocs(collection(db, "users"));
    console.log(`Firestore 'users' koleksiyonunda toplam ${usersSnap.size} kayıt bulundu.`);

    const allUsers = [];
    usersSnap.forEach((d) => allUsers.push({ id: d.id, ...d.data() }));

    const realUsers = allUsers.filter(isRealAccount);
    const fakeUsers = allUsers.filter((u) => !isRealAccount(u));

    console.log(`- KORUNAN Gerçek Hesap: ${realUsers.length} adet (${realUsers.map((u) => u.email).join(", ")})`);
    console.log(`- TEMİZLENECEK Sahte/Test Hesap: ${fakeUsers.length} adet`);

    await deleteUser(tempAuthUser);
    tempAuthUser = null;

    let authDeletedCount = 0;
    let firestoreCleanedCount = 0;

    for (let i = 0; i < fakeUsers.length; i++) {
      const u = fakeUsers[i];
      const email = (u.email || "").trim().toLowerCase();

      try {
        const fakeAuth = await signInWithEmailAndPassword(auth, email, "123456");
        try {
          await deleteDoc(doc(db, "users", u.id));
          firestoreCleanedCount++;
        } catch {
          try {
            await setDoc(doc(db, "users", u.id), {
              deleted: true,
              status: "Silindi",
              deletedAt: new Date().toISOString(),
            });
            firestoreCleanedCount++;
          } catch {}
        }
        await deleteUser(fakeAuth.user);
        authDeletedCount++;
      } catch (err) {
        // Zaten silinmiş
      }
    }

    console.log("\n=================================================");
    console.log("TEMİZLİK RAPORU:");
    console.log(`- Firebase Authentication'dan Silinen: ${authDeletedCount}`);
    console.log(`- Ferit Efe Türkşad Çolak Hesabı: GÜVENLE KORUNDU ✓`);
    console.log("=================================================");
  } catch (err) {
    console.error("Hata:", err);
  } finally {
    if (tempAuthUser) {
      try { await deleteUser(tempAuthUser); } catch {}
    }
    process.exit(0);
  }
}

runCleanup();
