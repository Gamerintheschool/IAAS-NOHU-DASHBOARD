import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  Download,
  ExternalLink,
  Globe2,
  Heart,
  LayoutDashboard,
  Leaf,
  MapPin,
  Menu,
  Moon,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Ticket,
  User,
  Users,
  X,
} from "lucide-react";
import "./styles.css";
import Magazine, { MagazineArticle, magazineArticles } from "./Magazine.jsx";
import AuthPortal from "./AuthPortal.jsx";
import MembersPage from "./MembersPage.jsx";
import useAppearance from "./useAppearance.js";
import "./appearance.css";
import {
  normalizeStudentNo,
  isAdminUser,
  isFeritUser,
  setDynamicAdmins,
  getDynamicAdmins,
} from "./utils.js";
import { auth, db, isFirebaseConfigured } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { logoutWithFirebase, cacheStudentEmail } from "./services/authService.js";

const image = (prompt, size = "landscape_16_9") =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
const images = {
  hero: image(
    "Editorial fine art photograph of rolling green agricultural fields and forested hills in Tuscany at soft morning light, rich dark forest green tones, beautiful atmospheric countryside, natural film grain, no text, panoramic landscape",
  ),
  field: image(
    "Documentary photograph of a small group of university agriculture students walking through a lush green tea plantation in Turkey, warm sunlight, candid outdoor field trip, realistic editorial photography",
  ),
  workshop: image(
    "Close up editorial photograph of hands planting a small green seedling in rich dark soil in a terracotta pot, wooden table in a sunny greenhouse, warm natural light, sustainable gardening workshop",
  ),
  meeting: image(
    "Candid editorial photograph of a diverse group of university students sitting around a wooden table in a warm modern cafe, smiling and talking, afternoon sunlight, community meeting",
  ),
};
const initialEvents = [
  {
    id: 1,
    day: "12",
    month: "EKİ",
    title: "Doğaya bir adım: Teknik gezi",
    category: "Teknik Gezi",
    color: "green",
    image: images.field,
    date: "12 Ekim 2026",
    time: "09.00 – 17.00",
    place: "Atatürk Arboretumu, İstanbul",
    people: 24,
    description:
      "Şehrin temposuna bir mola veriyoruz. Uzman rehberimizle bitki çeşitliliğini keşfedeceğimiz, doğayla ve birbirimizle bağ kuracağımız bir gün bizi bekliyor.",
  },
  {
    id: 2,
    day: "18",
    month: "EKİ",
    title: "Sürdürülebilir bir gelecek",
    category: "Atölye",
    color: "orange",
    image: images.workshop,
    date: "18 Ekim 2026",
    time: "13.00 – 16.00",
    place: "İTÜ Ayazağa Kampüsü",
    people: 18,
    description:
      "Küçük adımlarla büyük değişimler mümkün. Sürdürülebilir tarım ve kent bahçeciliği üzerine uygulamalı atölyemizde kendi fideni yetiştirmeye başla.",
  },
  {
    id: 3,
    day: "24",
    month: "EKİ",
    title: "Bir kahve, yeni bağlantılar",
    category: "Buluşma",
    color: "purple",
    image: images.meeting,
    date: "24 Ekim 2026",
    time: "15.00 – 18.00",
    place: "Kolektif House, İstanbul",
    people: 32,
    description:
      "Topluluğun yeni ve eski üyeleri aynı masada! Bir kahve eşliğinde tanışıyor, yeni fikirlerimizi paylaşıyor ve gelecek projelerimizin ilk adımlarını atıyoruz.",
  },
];
export const events = initialEvents;

export const initialAnnouncements = [
  {
    id: "ann-1",
    type: "ÜYELİK",
    title: "Yeni dönem, yeni başlangıçlar!",
    text: "2026–2027 dönemi üyelik yenilemeleri başladı. Birlikte büyümeye devam edelim.",
    date: "1 Ekim 2026",
    icon: Sparkles,
    tone: "peach",
  },
  {
    id: "ann-2",
    type: "FIRSATLAR",
    title: "Dünyaya açılan bir kapı: ExPro",
    text: "Uluslararası değişim programımızla farklı ülkelerde deneyim kazan.",
    date: "29 Eylül 2026",
    icon: Globe2,
    tone: "mint",
  },
  {
    id: "ann-3",
    type: "TOPLULUK",
    title: "Bir fikrin mi var? Birlikte yapalım.",
    text: "Proje önerilerini bizimle paylaş, fikrini topluluğumuzla hayata geçir.",
    date: "26 Eylül 2026",
    icon: Sprout,
    tone: "lavender",
  },
];
export const announcements = initialAnnouncements;

const defaultAttendees = {
  1: ["mem-2"],
  2: ["mem-3"],
  3: [],
};

function getAnnouncementIcon(a) {
  if (typeof a?.icon === "function" || (a?.icon && typeof a.icon === "object")) {
    return a.icon;
  }
  if (a?.type === "ÜYELİK") return Sparkles;
  if (a?.type === "FIRSATLAR") return Globe2;
  return Sprout;
}

export const initialMembers = [
  {
    id: "mem-1",
    memberNo: "IAAS-NÖHÜ-001",
    name: "Deniz Yılmaz",
    email: "deniz.yilmaz@ohu.edu.tr",
    studentNo: "210405012",
    faculty: "Tarım Bilimleri ve Teknolojileri Fakültesi",
    department: "Bitkisel Üretim ve Teknolojileri",
    role: "admin",
    password: "123456",
    status: "Aktif",
    joinedDate: "15 Eylül 2026",
    phone: "0555 123 4567",
  },
  {
    id: "mem-2",
    memberNo: "IAAS-NÖHÜ-002",
    name: "Ahmet Çetin",
    email: "ahmet.cetin@ohu.edu.tr",
    studentNo: "220405034",
    faculty: "Tarım Bilimleri ve Teknolojileri Fakültesi",
    department: "Tarımsal Genetik Mühendisliği",
    role: "member",
    password: "123456",
    status: "Aktif",
    joinedDate: "1 Ekim 2026",
    phone: "0542 987 6543",
  },
  {
    id: "mem-3",
    memberNo: "IAAS-NÖHÜ-003",
    name: "Zeynep Kaya",
    email: "zeynep.kaya@ohu.edu.tr",
    studentNo: "230405088",
    faculty: "Mühendislik Fakültesi",
    department: "Çevre Mühendisliği",
    role: "member",
    password: "123456",
    status: "Aktif",
    joinedDate: "2 Ekim 2026",
    phone: "0533 456 7890",
  },
];
const allNavItems = [
  { label: "Genel Bakış", icon: LayoutDashboard },
  { label: "Üyeliğim", icon: CreditCard },
  { label: "Etkinlikler", icon: CalendarDays, count: "3" },
  { label: "Duyurular", icon: Bell },
  { label: "Magazin", icon: Newspaper },
  { label: "Üyeler", icon: Users, adminOnly: true },
];
function readLocal(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(fallback))
      return Array.isArray(value)
        ? value.filter((id) => initialEvents.some((event) => event.id === id) || typeof id === "number" || typeof id === "string")
        : fallback;
    return value &&
      Object.keys(fallback).every(
        (field) => typeof value[field] === "string" && value[field].trim(),
      )
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}
function App() {
  const { theme, setTheme, sidebarCollapsed, setSidebarCollapsed, isMobile } =
    useAppearance();
  const [page, setPage] = useState("Genel Bakış");

  const [members, setMembers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("iaas_members"));
      let list = Array.isArray(saved) && saved.length > 0 ? saved : initialMembers;
      let changed = false;

      // Gömülü eski mock hesapları kütükten tamamen temizle
      const prevLen = list.length;
      list = list.filter((m) => m.id !== "mem-ferit" && m.id !== "mem-ferit-gmail");
      if (list.length !== prevLen) changed = true;

      // Yönetici hesaplarının rollerini teyit et
      list = list.map((m) => {
        if (isAdminUser(m) && m.role !== "admin") {
          changed = true;
          return { ...m, role: "admin" };
        }
        return m;
      });

      // Deduplicate existing list and filter out test accounts
      const prioritized = [
        ...list.filter((m) => m.role === "admin"),
        ...list.filter((m) => m.role !== "admin"),
      ];
      const seenStudentNos = new Set();
      const seenEmails = new Set();
      const deduplicated = [];

      for (const m of prioritized) {
        const sNo = normalizeStudentNo(m.studentNo);
        const em = (m.email || "").trim().toLowerCase();

        // Otomasyon ve test kalıntısı sahte hesapları temizle
        const isTestAccount =
          !isAdminUser(m) &&
          (/\.\d{6,}@ohu\.edu\.tr/.test(em) ||
            em.startsWith("cleaner_") ||
            em.startsWith("temp_") ||
            em.startsWith("deneme."));

        if (isTestAccount) {
          changed = true;
          continue;
        }

        const isDupStudent = sNo && seenStudentNos.has(sNo);
        const isDupEmail = em && seenEmails.has(em);

        if (isDupStudent || isDupEmail) {
          changed = true;
          continue;
        }

        if (!m.password) changed = true;
        deduplicated.push({
          ...m,
          password: m.password || "123456",
        });
      }
      list = deduplicated;

      if (changed) {
        try {
          localStorage.setItem("iaas_members", JSON.stringify(list));
        } catch {}
      }
      return list;
    } catch {
      return initialMembers;
    }
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    try {
      return localStorage.getItem("iaas_current_user_id") || null;
    } catch {
      return null;
    }
  });

  const [currentUserSession, setCurrentUserSession] = useState(() => {
    try {
      const saved = localStorage.getItem("iaas_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Canlı Firebase bağlıyken Firestore 'users' koleksiyonunu gerçek zamanlı dinle (Tüm hesaplarda anlık üye senkronizasyonu)
  useEffect(() => {
    if (!isFirebaseConfigured() || !db || !currentUserId) return;
    if (typeof window !== "undefined" && (window.__PLAYWRIGHT_TEST__ || navigator.webdriver)) return;

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snap) => {
        if (!snap.empty) {
          const liveUsers = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data() || {};
            const isAdmin = isAdminUser(data);
            const email = typeof data.email === "string" ? data.email : "";
            // Eksik alanlı kayıtlar (ör. yarım kalmış profiller) arayüzü çökertmesin diye varsayılan değerler
            const userObj = {
              ...data,
              id: docSnap.id,
              uid: docSnap.id,
              name:
                typeof data.name === "string" && data.name.trim()
                  ? data.name
                  : email
                    ? email.split("@")[0]
                    : "İsimsiz Üye",
              email,
              studentNo: typeof data.studentNo === "string" ? data.studentNo : "",
              department: typeof data.department === "string" ? data.department : "",
              faculty: typeof data.faculty === "string" ? data.faculty : "",
              role: isAdmin ? "admin" : (data.role || "member"),
            };
            liveUsers.push(userObj);
            // Öğrenci numarası - e-posta önbelleğini güncelle
            if (userObj.studentNo && userObj.email) {
              cacheStudentEmail(userObj.studentNo, userObj.email);
            }
          });

          setMembers((prev) => {
            const map = new Map();
            prev.forEach((m) => {
              if (m.id !== "mem-ferit" && m.id !== "mem-ferit-gmail") {
                map.set(String(m.id), m);
              }
            });
            liveUsers.forEach((u) => {
              map.set(String(u.id), u);
              if (u.uid) map.set(String(u.uid), u);
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem("iaas_members", JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      },
      (err) => {
        // İzin reddedildiyse sessizce devam et
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  // Canlı Firebase bağlıyken Firestore 'admins' koleksiyonunu gerçek zamanlı dinle (Admin veritabanı senkronizasyonu)
  useEffect(() => {
    if (!isFirebaseConfigured() || !db) return;
    if (typeof window !== "undefined" && (window.__PLAYWRIGHT_TEST__ || navigator.webdriver)) return;

    let isSeeding = false;
    const unsubscribe = onSnapshot(
      collection(db, "admins"),
      async (snapshot) => {
        if (!snapshot.empty) {
          const liveAdmins = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() || {};
            liveAdmins.push({
              ...data,
              id: docSnap.id,
              uid: data.uid || docSnap.id,
              email: data.email || "",
              studentNo: data.studentNo || "",
              cleanStudentNo: data.cleanStudentNo || "",
              name: data.name || "",
              role: "admin",
            });
          });

          setDynamicAdmins(liveAdmins);

          // Üye listesindeki rolleri anlık admin listesine göre senkronize et
          setMembers((prev) => {
            let hasChanges = false;
            const updated = prev.map((m) => {
              const shouldBeAdmin = isAdminUser(m);
              if (shouldBeAdmin && m.role !== "admin") {
                hasChanges = true;
                return { ...m, role: "admin" };
              }
              return m;
            });
            if (hasChanges) {
              try {
                localStorage.setItem("iaas_members", JSON.stringify(updated));
              } catch {}
              return updated;
            }
            return prev;
          });
        } else if (!snapshot.metadata.fromCache && !isSeeding && auth?.currentUser) {
          // Eğer Firestore'da admins koleksiyonu henüz boşsa, ana yöneticileri veritabanına otomatik tohumla
          isSeeding = true;
          try {
            const curUid = auth.currentUser.uid;
            const curEmail = (auth.currentUser.email || "").toLowerCase();
            const curName =
              auth.currentUser.displayName ||
              (curEmail.includes("admintr") ? "AdminTR" : "Yönetici");

            await setDoc(
              doc(db, "admins", curUid),
              {
                uid: curUid,
                id: curUid,
                name: curName,
                email: curEmail,
                role: "admin",
                status: "Aktif",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );

            if (curEmail !== "admintr@ohu.edu.tr") {
              await setDoc(
                doc(db, "admins", "admintr_primary"),
                {
                  name: "AdminTR",
                  email: "admintr@ohu.edu.tr",
                  studentNo: "240102020",
                  cleanStudentNo: "240102020",
                  role: "admin",
                  status: "Aktif",
                  isPrimaryAdmin: true,
                  createdAt: serverTimestamp(),
                },
                { merge: true }
              );
            }
          } catch (seedErr) {
            console.warn("Admins Firestore tohumlama hatası:", seedErr);
          } finally {
            isSeeding = false;
          }
        }
      },
      (err) => {
        // İzin reddedildiyse sessizce devam et
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  // Canlı Firebase yapılandırılmışken Firebase Auth oturumunu dinle
  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (!fbUser) {
          if (typeof window !== "undefined" && !window.__PLAYWRIGHT_TEST__ && !navigator.webdriver) {
            setCurrentUserId(null);
            setCurrentUserSession(null);
            try {
              localStorage.removeItem("iaas_current_user_id");
              localStorage.removeItem("iaas_current_user");
            } catch {}
          }
        } else {
          const uid = fbUser.uid;
          setCurrentUserId(uid);
          try {
            localStorage.setItem("iaas_current_user_id", uid);
          } catch {}

          if (db) {
            getDoc(doc(db, "users", uid))
              .then((snap) => {
                if (snap.exists()) {
                  const data = snap.data();
                  const isAdmin = isAdminUser({ ...data, email: fbUser.email, uid });
                  const fullUser = {
                    ...data,
                    id: uid,
                    uid,
                    role: isAdmin ? "admin" : (data.role || "member"),
                  };
                  setCurrentUserSession(fullUser);
                  try {
                    localStorage.setItem("iaas_current_user", JSON.stringify(fullUser));
                  } catch {}
                }
              })
              .catch(() => {});
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const rawCurrentUser = (() => {
    if (
      currentUserSession &&
      (!currentUserId ||
        currentUserSession.id === currentUserId ||
        currentUserSession.uid === currentUserId)
    ) {
      return currentUserSession;
    }
    if (currentUserId) {
      const found = members.find(
        (m) => m.id === currentUserId || m.uid === currentUserId
      );
      if (found) return found;
    }
    if (currentUserSession) return currentUserSession;
    if (currentUserId) {
      return members.find((m) => m.id === currentUserId) || null;
    }
    return null;
  })();

  const currentUser = rawCurrentUser
    ? isAdminUser(rawCurrentUser)
      ? { ...rawCurrentUser, role: "admin" }
      : rawCurrentUser
    : null;

  const profile = currentUser
    ? {
        name: currentUser.name,
        email: currentUser.email,
        university: currentUser.university || "Niğde Ömer Halisdemir Üniversitesi",
        department: currentUser.department,
        role: currentUser.role,
        memberNo: currentUser.memberNo || "IAAS-NÖHÜ-001",
        studentNo: currentUser.studentNo || "-",
        faculty: currentUser.faculty || "Tarım Bilimleri ve Teknolojileri Fakültesi",
      }
    : null;
  const [eventAttendees, setEventAttendees] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("iaas_event_attendees"));
      if (saved && typeof saved === "object") return saved;
      return defaultAttendees;
    } catch {
      return defaultAttendees;
    }
  });

  const [joined, setJoined] = useState(() => {
    try {
      const savedAttendees =
        JSON.parse(localStorage.getItem("iaas_event_attendees")) ||
        defaultAttendees;
      const uid = localStorage.getItem("iaas_current_user_id") || "mem-1";
      const savedEvents =
        JSON.parse(localStorage.getItem("iaas_events_data")) || initialEvents;
      const enrolled = savedEvents
        .filter((e) => {
          const list = (
            savedAttendees[e.id] ||
            savedAttendees[String(e.id)] ||
            []
          ).map(String);
          return list.includes(String(uid));
        })
        .map((e) => e.id);
      if (enrolled.length > 0) return enrolled;
      const savedJoined = JSON.parse(localStorage.getItem("iaas-events"));
      if (Array.isArray(savedJoined)) return savedJoined;
      return [];
    } catch {
      return readLocal("iaas-events", []);
    }
  });

  function getEventAttendees(eventId) {
    const list =
      eventAttendees[eventId] ||
      eventAttendees[String(eventId)] ||
      eventAttendees[Number(eventId)] ||
      [];
    return list
      .map((uid) => {
        const found = members.find((m) => String(m.id) === String(uid));
        if (found) return found;
        if (currentUser && String(currentUser.id) === String(uid)) return currentUser;
        return null;
      })
      .filter(Boolean);
  }

  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [eventsList, setEventsList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("iaas_events_data"));
      if (Array.isArray(saved) && saved.length > 0) return saved;
      return initialEvents;
    } catch {
      return initialEvents;
    }
  });

  const [announcementsList, setAnnouncementsList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("iaas_announcements_data"));
      if (Array.isArray(saved) && saved.length > 0) return saved;
      return initialAnnouncements;
    } catch {
      return initialAnnouncements;
    }
  });

  // Dinleyiciler için kararlı anahtarlar: admin hesaplarında currentUser her render'da yeni nesne
  // olduğundan doğrudan bağımlılık olarak kullanılırsa dinleyici sürekli kapanıp açılır (render döngüsü).
  const syncUserKey = currentUser?.id ? String(currentUser.id) : null;
  const syncIsAdmin = !!(currentUser && isAdminUser(currentUser));
  const syncIsAdminRef = useRef(syncIsAdmin);
  syncIsAdminRef.current = syncIsAdmin;
  const eventAttendeesRef = useRef(eventAttendees);
  eventAttendeesRef.current = eventAttendees;

  // Gerçek zamanlı Firestore 'events' senkronizasyonu (Tüm hesaplarda ve tarayıcılarda canlı veri)
  useEffect(() => {
    if (!isFirebaseConfigured() || !db) return;
    if (typeof window !== "undefined" && (window.__PLAYWRIGHT_TEST__ || navigator.webdriver)) return;

    let isSeeding = false;
    const unsubscribe = onSnapshot(
      collection(db, "events"),
      async (snapshot) => {
        const eventDocs = snapshot.docs.filter((d) => d.id !== "_meta");
        const hasMeta = snapshot.docs.some((d) => d.id === "_meta");

        // Eğer Firestore'da henüz etkinlik veya _meta dokümanı yoksa:
        // Giriş yapmış admin kullanıcısı varsa, adminin tarayıcısındaki etkinlikleri (örneğin Ferit'in test etkinliği) Firestore'a yükle!
        if (eventDocs.length === 0 && !hasMeta) {
          // Önbellekten gelen boş anlık görüntü sunucunun cevabı değildir; yoksay
          if (snapshot.metadata.fromCache) return;
          const seededFlag = localStorage.getItem("iaas_events_synced_v3");
          let localEvents = null;
          try {
            localEvents = JSON.parse(localStorage.getItem("iaas_events_data"));
          } catch {}
          const hasLocalEvents = Array.isArray(localEvents) && localEvents.length > 0;
          // Sadece adminin tarayıcısında gerçekten kayıtlı yerel etkinlikler varsa buluta aktar.
          // Varsayılan örnek etkinlikler (initialEvents) asla geri yüklenmez.
          if (!seededFlag && !isSeeding && syncIsAdminRef.current && hasLocalEvents) {
            isSeeding = true;
            try {
              const currentAtt = eventAttendeesRef.current || {};
              for (const ev of localEvents) {
                if (!ev || ev.id === "_meta" || ev.id === undefined) continue;
                const att = (
                  currentAtt[ev.id] ||
                  currentAtt[String(ev.id)] ||
                  []
                ).map(String);
                await setDoc(doc(db, "events", String(ev.id)), {
                  ...ev,
                  attendees: att,
                });
              }
              await setDoc(doc(db, "events", "_meta"), {
                initialized: true,
                createdAt: serverTimestamp(),
              });
              localStorage.setItem("iaas_events_synced_v3", "true");
            } catch (seedErr) {
              console.warn("Etkinlik Firestore tohumlama hatası:", seedErr);
            } finally {
              isSeeding = false;
            }
            return;
          }
          // Bulutta etkinlik yok: bayat yerel listeyi göstermek yerine boş liste göster.
          // (Yerel kayıt silinmez; adminin aktarılmamış etkinlikleri korunur.)
          setEventsList([]);
          return;
        }

        // Firestore'da veri mevcut; yerel veriyi bulutla eşitle
        localStorage.setItem("iaas_events_synced_v3", "true");
        const liveEvents = [];
        const liveAttendees = {};

        eventDocs.forEach((docSnap) => {
          const data = docSnap.data() || {};
          const eventItem = {
            ...data,
            title: typeof data.title === "string" && data.title.trim() ? data.title : "Etkinlik",
            id: isNaN(Number(docSnap.id)) ? docSnap.id : Number(docSnap.id),
          };
          liveEvents.push(eventItem);
          if (Array.isArray(data.attendees)) {
            liveAttendees[eventItem.id] = data.attendees.map(String);
            liveAttendees[String(eventItem.id)] = data.attendees.map(String);
          }
        });

        setEventsList(liveEvents);
        setEventAttendees((prev) => ({
          ...prev,
          ...liveAttendees,
        }));

        try {
          localStorage.setItem("iaas_events_data", JSON.stringify(liveEvents));
          localStorage.setItem(
            "iaas_event_attendees",
            JSON.stringify({ ...(eventAttendeesRef.current || {}), ...liveAttendees })
          );
        } catch {}
      },
      (err) => {
        console.warn("Firestore events onSnapshot hatası:", err);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Gerçek zamanlı Firestore 'announcements' senkronizasyonu
  useEffect(() => {
    if (!isFirebaseConfigured() || !db) return;
    if (typeof window !== "undefined" && (window.__PLAYWRIGHT_TEST__ || navigator.webdriver)) return;

    let isSeeding = false;
    const unsubscribe = onSnapshot(
      collection(db, "announcements"),
      async (snapshot) => {
        const annDocs = snapshot.docs.filter((d) => d.id !== "_meta");
        const hasMeta = snapshot.docs.some((d) => d.id === "_meta");

        if (annDocs.length === 0 && !hasMeta) {
          if (snapshot.metadata.fromCache) return;
          const seededFlag = localStorage.getItem("iaas_announcements_synced_v3");
          let localAnn = null;
          try {
            localAnn = JSON.parse(localStorage.getItem("iaas_announcements_data"));
          } catch {}
          const hasLocalAnn = Array.isArray(localAnn) && localAnn.length > 0;
          if (!seededFlag && !isSeeding && syncIsAdminRef.current && hasLocalAnn) {
            isSeeding = true;
            try {
              for (const a of localAnn) {
                if (!a || a.id === "_meta" || a.id === undefined) continue;
                const { icon, ...cleanA } = a;
                await setDoc(doc(db, "announcements", String(a.id)), cleanA);
              }
              await setDoc(doc(db, "announcements", "_meta"), {
                initialized: true,
                createdAt: serverTimestamp(),
              });
              localStorage.setItem("iaas_announcements_synced_v3", "true");
            } catch (seedErr) {
              console.warn("Duyuru Firestore tohumlama hatası:", seedErr);
            } finally {
              isSeeding = false;
            }
            return;
          }
          setAnnouncementsList([]);
          return;
        }

        localStorage.setItem("iaas_announcements_synced_v3", "true");
        const liveAnnouncements = [];
        annDocs.forEach((docSnap) => {
          const data = docSnap.data();
          liveAnnouncements.push({
            ...data,
            id: docSnap.id,
          });
        });

        setAnnouncementsList(liveAnnouncements);
        try {
          localStorage.setItem("iaas_announcements_data", JSON.stringify(liveAnnouncements));
        } catch {}
      },
      (err) => {
        console.warn("Firestore announcements onSnapshot hatası:", err);
      }
    );

    return () => unsubscribe();
  }, [syncUserKey, syncIsAdmin]);

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;
    const uidStr = String(currentUser.id);
    const userEvents = eventsList
      .filter((e) => {
        const list = (
          eventAttendees[e.id] ||
          eventAttendees[String(e.id)] ||
          []
        ).map(String);
        return list.includes(uidStr);
      })
      .map((e) => e.id);

    setJoined((prev) => {
      const prevStrs = prev.map(String).sort().join(",");
      const nextStrs = userEvents.map(String).sort().join(",");
      if (prevStrs !== nextStrs) {
        try {
          localStorage.setItem("iaas-events", JSON.stringify(userEvents));
        } catch {}
        return userEvents;
      }
      return prev;
    });
  }, [currentUserId, eventAttendees, eventsList]);

  const navItems = allNavItems.filter(
    (item) => !item.adminOnly || currentUser?.role === "admin",
  );

  const [eventFilter, setEventFilter] = useState("Tümü");
  const [readNotices, setReadNotices] = useState(false);
  const menuToggle = useRef(null);
  const sidebarOpen = isMobile ? mobileNav : !sidebarCollapsed;
  const toastTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);
  useEffect(() => {
    setMobileNav(false);
  }, [isMobile]);
  useEffect(() => {
    if (!mobileNav || !isMobile) return;
    // Wait for visibility and inert changes before moving keyboard focus.
    const frame = window.requestAnimationFrame(() => {
      document.querySelector(".sidebar-close")?.focus({ preventScroll: true });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.requestAnimationFrame(() =>
        menuToggle.current?.focus({ preventScroll: true }),
      );
    };
  }, [mobileNav, isMobile]);
  useEffect(() => {
    const handleKeys = (event) => {
      if (event.key === "Escape") {
        setModal(null);
        setMobileNav(false);
        setSearchOpen(false);
        setNotifications(false);
      }
      if (
        event.key === "/" &&
        !modal &&
        !["INPUT", "TEXTAREA"].includes(event.target.tagName)
      ) {
        event.preventDefault();
        document.querySelector(".search-wrap input")?.focus();
      }
      if (event.key === "Tab" && (modal || (isMobile && mobileNav))) {
        const controls = document
          .querySelector(modal ? ".modal" : ".sidebar")
          ?.querySelectorAll('button, a[href], input, summary, [tabindex="0"]');
        if (!controls?.length) return;
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [modal, mobileNav, isMobile]);
  useEffect(() => {
    if (!modal && !mobileNav) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [modal, mobileNav]);
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "IA";
  function notify(message) {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(""), 4000);
  }
  function persist(key, value, successMessage) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      notify(successMessage);
    } catch {
      notify(
        "Değişiklik bu oturumda uygulandı; tarayıcı kalıcı kayda izin vermedi.",
      );
    }
  }
  function navigate(target) {
    setPage(target);
    setMobileNav(false);
    setSearchOpen(false);
    setQuery("");
    window.scrollTo(0, 0);
  }
  function toggleSidebar() {
    if (isMobile) setMobileNav((open) => !open);
    else setSidebarCollapsed((collapsed) => !collapsed);
    menuToggle.current?.focus();
  }
  function toggleEvent(id) {
    const eventIdStr = String(id);
    const currentAttendees = (
      eventAttendees[id] ||
      eventAttendees[eventIdStr] ||
      eventAttendees[Number(id)] ||
      []
    ).map(String);
    const userIdStr = String(currentUser?.id || "");
    if (!userIdStr) {
      notify("Etkinliğe kaydolmak için lütfen önce giriş yapın.");
      return;
    }
    const isEnrolled = currentAttendees.includes(userIdStr);

    const nextAttendeesForEvent = isEnrolled
      ? currentAttendees.filter((uid) => uid !== userIdStr)
      : [...currentAttendees.filter((uid) => uid !== userIdStr), userIdStr];

    const updatedAttendees = {
      ...eventAttendees,
      [id]: nextAttendeesForEvent,
      [eventIdStr]: nextAttendeesForEvent,
    };
    setEventAttendees(updatedAttendees);

    const nextJoined = isEnrolled
      ? joined.filter((x) => String(x) !== eventIdStr)
      : [...joined.filter((x) => String(x) !== eventIdStr), id];
    setJoined(nextJoined);

    persist(
      "iaas-events",
      nextJoined,
      !isEnrolled
        ? "Etkinliğe kaydoldun. Görüşmek üzere!"
        : "Etkinlik kaydın iptal edildi.",
    );

    try {
      localStorage.setItem("iaas_event_attendees", JSON.stringify(updatedAttendees));
    } catch {}

    if (isFirebaseConfigured() && db && auth?.currentUser) {
      setDoc(
        doc(db, "events", eventIdStr),
        { attendees: nextAttendeesForEvent },
        { merge: true }
      ).catch((err) => console.warn("Firestore etkinlik katılım güncelleme hatası:", err));
    }
  }

  function handleRemoveAttendee(eventId, memberId) {
    const eventIdStr = String(eventId);
    const currentAttendees = (
      eventAttendees[eventId] ||
      eventAttendees[eventIdStr] ||
      eventAttendees[Number(eventId)] ||
      []
    ).map(String);
    const memberIdStr = String(memberId);
    const nextAttendees = currentAttendees.filter((uid) => uid !== memberIdStr);
    const updatedAttendees = {
      ...eventAttendees,
      [eventId]: nextAttendees,
      [eventIdStr]: nextAttendees,
    };
    setEventAttendees(updatedAttendees);
    if (memberIdStr === String(currentUser?.id)) {
      const nextJoined = joined.filter((x) => String(x) !== eventIdStr);
      setJoined(nextJoined);
      try {
        localStorage.setItem("iaas-events", JSON.stringify(nextJoined));
      } catch {}
    }
    try {
      localStorage.setItem("iaas_event_attendees", JSON.stringify(updatedAttendees));
    } catch {}

    if (isFirebaseConfigured() && db && auth?.currentUser) {
      setDoc(
        doc(db, "events", eventIdStr),
        { attendees: nextAttendees },
        { merge: true }
      ).catch((err) => console.warn("Firestore katılımcı silme hatası:", err));
    }
    notify("Katılımcı etkinlik listesinden çıkarıldı.");
  }

  function handleAddEvent(newEvent) {
    const updated = [newEvent, ...eventsList];
    setEventsList(updated);
    try {
      localStorage.setItem("iaas_events_data", JSON.stringify(updated));
    } catch {}

    if (isFirebaseConfigured() && db && auth?.currentUser) {
      const cleanEvent = { ...newEvent };
      cleanEvent.attendees = cleanEvent.attendees || [];
      setDoc(doc(db, "events", String(newEvent.id)), cleanEvent).catch((err) =>
        console.warn("Firestore etkinlik ekleme hatası:", err)
      );
    }
    notify(`"${newEvent.title}" etkinliği oluşturuldu.`);
  }

  function handleDeleteEvent(eventId, title) {
    const eventIdStr = String(eventId);
    const updated = eventsList.filter((e) => String(e.id) !== eventIdStr);
    setEventsList(updated);
    const updatedAttendees = { ...eventAttendees };
    delete updatedAttendees[eventId];
    delete updatedAttendees[eventIdStr];
    setEventAttendees(updatedAttendees);
    const nextJoined = joined.filter((id) => String(id) !== eventIdStr);
    setJoined(nextJoined);
    try {
      localStorage.setItem("iaas_events_data", JSON.stringify(updated));
      localStorage.setItem("iaas_event_attendees", JSON.stringify(updatedAttendees));
      localStorage.setItem("iaas-events", JSON.stringify(nextJoined));
    } catch {}

    if (isFirebaseConfigured() && db && auth?.currentUser) {
      deleteDoc(doc(db, "events", eventIdStr)).catch((err) =>
        console.warn("Firestore etkinlik silme hatası:", err)
      );
    }
    notify(`"${title}" etkinliği silindi.`);
  }

  function handleAddAnnouncement(newAnn) {
    const updated = [newAnn, ...announcementsList];
    setAnnouncementsList(updated);
    try {
      localStorage.setItem("iaas_announcements_data", JSON.stringify(updated));
    } catch {}

    if (isFirebaseConfigured() && db && auth?.currentUser) {
      const { icon, ...cleanAnn } = newAnn;
      setDoc(doc(db, "announcements", String(newAnn.id)), cleanAnn).catch((err) =>
        console.warn("Firestore duyuru ekleme hatası:", err)
      );
    }
    notify(`"${newAnn.title}" duyurusu yayınlandı.`);
  }

  function handleDeleteAnnouncement(annId, title) {
    const annIdStr = String(annId);
    const updated = announcementsList.filter(
      (a) => (a.id ? String(a.id) !== annIdStr : a.title !== title),
    );
    setAnnouncementsList(updated);
    try {
      localStorage.setItem("iaas_announcements_data", JSON.stringify(updated));
    } catch {}

    if (isFirebaseConfigured() && db && auth?.currentUser) {
      deleteDoc(doc(db, "announcements", annIdStr)).catch((err) =>
        console.warn("Firestore duyuru silme hatası:", err)
      );
    }
    notify(`"${title}" duyurusu kaldırıldı.`);
  }
  function handleRegister(newMember) {
    const isAdmin = isAdminUser(newMember);
    const finalMember = isAdmin ? { ...newMember, role: "admin" } : newMember;

    // Defense-in-depth duplicate check against current members and localStorage
    const normStudentNo = normalizeStudentNo(finalMember.studentNo);
    const normEmail = (finalMember.email || "").trim().toLowerCase();

    let checkList = [...members];
    try {
      const stored = JSON.parse(localStorage.getItem("iaas_members"));
      if (Array.isArray(stored)) {
        checkList = [...checkList, ...stored];
      }
    } catch {}

    if (
      normStudentNo &&
      checkList.some(
        (m) =>
          m.id !== finalMember.id &&
          m.studentNo &&
          normalizeStudentNo(m.studentNo) === normStudentNo
      )
    ) {
      // Eğer mevcut kayıt aynı kullanıcıya aitse, güncellemeye izin ver
      const existingIdx = members.findIndex(
        (m) => m.studentNo && normalizeStudentNo(m.studentNo) === normStudentNo
      );
      if (existingIdx !== -1) {
        const existing = members[existingIdx];
        const isSame =
          (existing.email || "").toLowerCase() === normEmail ||
          (isAdmin && isAdminUser(existing));

        if (isSame) {
          const updated = members.map((m, i) => (i === existingIdx ? finalMember : m));
          setMembers(updated);
          setCurrentUserId(finalMember.id);
          setCurrentUserSession(finalMember);
          try {
            localStorage.setItem("iaas_members", JSON.stringify(updated));
            localStorage.setItem("iaas_current_user_id", finalMember.id);
            localStorage.setItem("iaas_current_user", JSON.stringify(finalMember));
          } catch {}
          notify(`Aramıza hoş geldin, ${finalMember.name}! Kulüp üyeliğin güncellendi.`);
          return;
        }
      }

      notify("Hata: Bu öğrenci numarası ile kayıtlı bir üye zaten mevcut.");
      return;
    }

    if (
      normEmail &&
      checkList.some(
        (m) =>
          m.id !== finalMember.id &&
          m.email &&
          m.email.trim().toLowerCase() === normEmail
      )
    ) {
      if (isAdmin) {
        const existingEmailIdx = members.findIndex(
          (m) => m.email && m.email.trim().toLowerCase() === normEmail
        );
        const updated =
          existingEmailIdx !== -1
            ? members.map((m, i) => (i === existingEmailIdx ? finalMember : m))
            : [finalMember, ...members];
        setMembers(updated);
        setCurrentUserId(finalMember.id);
        setCurrentUserSession(finalMember);
        try {
          localStorage.setItem("iaas_members", JSON.stringify(updated));
          localStorage.setItem("iaas_current_user_id", finalMember.id);
          localStorage.setItem("iaas_current_user", JSON.stringify(finalMember));
        } catch {}
        notify(`Aramıza hoş geldin, ${finalMember.name}! Kulüp yöneticisi üyeliğin oluşturuldu.`);
        return;
      }
      notify("Hata: Bu e-posta adresi ile kayıtlı bir üye zaten mevcut.");
      return;
    }

    finalMember.studentNo = (finalMember.studentNo || "").trim();

    const updated = [finalMember, ...members];
    setMembers(updated);
    setCurrentUserId(finalMember.id);
    setCurrentUserSession(finalMember);
    try {
      localStorage.setItem("iaas_members", JSON.stringify(updated));
      localStorage.setItem("iaas_current_user_id", finalMember.id);
      localStorage.setItem("iaas_current_user", JSON.stringify(finalMember));
    } catch {}
    notify(`Aramıza hoş geldin, ${finalMember.name}! Kulüp üyeliğin oluşturuldu.`);
  }

  function handleLogin(user) {
    const isAdmin = isAdminUser(user);
    const userObj = {
      ...user,
      role: isAdmin ? "admin" : (user.role || "member"),
    };
    setCurrentUserId(userObj.id);
    setCurrentUserSession(userObj);
    try {
      localStorage.setItem("iaas_current_user_id", userObj.id);
      localStorage.setItem("iaas_current_user", JSON.stringify(userObj));
    } catch {}

    // Kullanıcıyı members state dizisine ekle/güncelle
    setMembers((prev) => {
      const idx = prev.findIndex(
        (m) =>
          m.id === userObj.id ||
          m.uid === userObj.id ||
          (userObj.email && m.email && m.email.toLowerCase() === userObj.email.toLowerCase())
      );
      let updated;
      if (idx !== -1) {
        updated = prev.map((m, i) => (i === idx ? { ...m, ...userObj } : m));
      } else {
        updated = [userObj, ...prev];
      }
      try {
        localStorage.setItem("iaas_members", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    notify(`Tekrar hoş geldin, ${userObj.name}!`);
  }

  function handleLogout() {
    setCurrentUserId(null);
    setCurrentUserSession(null);
    try {
      localStorage.removeItem("iaas_current_user_id");
      localStorage.removeItem("iaas_current_user");
    } catch {}
    if (isFirebaseConfigured()) {
      logoutWithFirebase().catch(() => {});
    }
    notify("Oturum kapatıldı. Üyelik ekranına yönlendirildiniz.");
  }

  function handleToggleAdmin(targetId) {
    const target = members.find(
      (m) => String(m.id) === String(targetId) || String(m.uid) === String(targetId)
    );
    if (!target) return;
    if (
      isAdminUser(target) &&
      target.role === "admin" &&
      (target.email === "admintr@ohu.edu.tr" ||
        target.email === "feritefeturksadcolak@ohu.edu.tr")
    ) {
      notify("Ana kulüp yöneticisi hesabının admin yetkisi kaldırılamaz.");
      return;
    }
    const newRole = target.role === "admin" ? "member" : "admin";
    const updated = members.map((m) =>
      String(m.id) === String(targetId) || String(m.uid) === String(targetId)
        ? { ...m, role: newRole }
        : m
    );
    setMembers(updated);
    try {
      localStorage.setItem("iaas_members", JSON.stringify(updated));
    } catch {}

    if (isFirebaseConfigured() && db && auth?.currentUser) {
      const docId = target.uid || target.id;
      // 1. users tablosunu güncelle
      setDoc(doc(db, "users", String(docId)), { role: newRole }, { merge: true }).catch(
        (err) => console.warn("Firestore rol güncelleme hatası:", err)
      );

      // 2. admins koleksiyonunu senkronize et
      if (newRole === "admin") {
        setDoc(
          doc(db, "admins", String(docId)),
          {
            uid: String(docId),
            id: String(docId),
            name: target.name || "",
            email: target.email || "",
            studentNo: target.studentNo || "",
            cleanStudentNo: normalizeStudentNo(target.studentNo || target.cleanStudentNo),
            role: "admin",
            status: target.status || "Aktif",
            updatedAt: serverTimestamp(),
            grantedBy: auth.currentUser?.email || auth.currentUser?.uid || "admin",
          },
          { merge: true }
        ).catch((err) => console.warn("Firestore admin ekleme hatası:", err));
      } else {
        deleteDoc(doc(db, "admins", String(docId))).catch((err) =>
          console.warn("Firestore admin silme hatası:", err)
        );
      }
    }

    notify(
      newRole === "admin"
        ? `${target.name} kullanıcısına Yönetici (Admin) yetkisi verildi.`
        : `${target.name} kullanıcısının yönetici yetkisi kaldırıldı.`
    );
  }

  function handleAddMember(newMember) {
    const updated = [newMember, ...members];
    setMembers(updated);
    try {
      localStorage.setItem("iaas_members", JSON.stringify(updated));
    } catch {}

    if (isFirebaseConfigured() && db && auth?.currentUser) {
      const docId = newMember.uid || newMember.id;
      setDoc(doc(db, "users", String(docId)), newMember).catch((err) =>
        console.warn("Firestore üye ekleme hatası:", err)
      );

      if (newMember.role === "admin" || isAdminUser(newMember)) {
        setDoc(
          doc(db, "admins", String(docId)),
          {
            uid: String(docId),
            id: String(docId),
            name: newMember.name || "",
            email: newMember.email || "",
            studentNo: newMember.studentNo || "",
            cleanStudentNo: normalizeStudentNo(newMember.studentNo || newMember.cleanStudentNo),
            role: "admin",
            status: newMember.status || "Aktif",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch((err) => console.warn("Firestore admin ekleme hatası:", err));
      }
    }

    notify(`${newMember.name} kulüp kütüğüne eklendi.`);
  }

  function handleDeleteMember(targetId, name) {
    if (targetId === currentUserId) {
      notify("Kendi hesabınızı silemezsiniz.");
      return;
    }
    const updated = members.filter(
      (m) => String(m.id) !== String(targetId) && String(m.uid) !== String(targetId)
    );
    setMembers(updated);
    try {
      localStorage.setItem("iaas_members", JSON.stringify(updated));
    } catch {}

    if (isFirebaseConfigured() && db && auth?.currentUser) {
      deleteDoc(doc(db, "users", String(targetId))).catch((err) =>
        console.warn("Firestore üye silme hatası:", err)
      );
      deleteDoc(doc(db, "admins", String(targetId))).catch((err) =>
        console.warn("Firestore admin silme hatası:", err)
      );
    }

    notify(`${name} üye kaydı silindi.`);
  }

  function handleProfileSave(data) {
    const updatedUser = { ...currentUser, ...data };
    const updated = members.map((m) =>
      String(m.id) === String(currentUser.id) ? updatedUser : m
    );
    setMembers(updated);
    setCurrentUserSession(updatedUser);
    try {
      localStorage.setItem("iaas_members", JSON.stringify(updated));
      localStorage.setItem("iaas_current_user", JSON.stringify(updatedUser));
      localStorage.setItem("iaas-profile", JSON.stringify(data));
    } catch {}

    if (isFirebaseConfigured() && db && auth?.currentUser) {
      const uid = currentUser.uid || currentUser.id;
      setDoc(doc(db, "users", String(uid)), data, { merge: true }).catch((err) =>
        console.warn("Firestore profil güncelleme hatası:", err)
      );
    }

    notify("Profil bilgilerin güncellendi.");
  }

  function downloadCard() {
    const text = `IAAS NÖHÜ - ÜYE KARTI\n${profile.name}\nÜye No: ${profile.memberNo}\n${profile.university}\nBölüm: ${profile.department}\nYetki: ${profile.role === "admin" ? "Yönetici" : "Üye"}\nÜyelik: Aktif\nGeçerlilik: 30 Eylül 2027`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "IAAS-uye-karti.txt";
    a.click();
    URL.revokeObjectURL(url);
    notify("Üyelik bilgilerin indirildi.");
  }
  const searchResults = [
    ...magazineArticles.map((article) => ({
      title: article.title,
      kind: "Magazin",
      action: () => {
        setModal({ type: "article", data: article });
        setSearchOpen(false);
      },
    })),
    ...eventsList.map((e) => ({
      title: e.title,
      kind: "Etkinlik",
      action: () => {
        setModal({ type: "event", data: e });
        setSearchOpen(false);
      },
    })),
    ...(currentUser?.role === "admin"
      ? members.map((m) => ({
          title: `${m.name} (${m.role === "admin" ? "Yönetici" : "Üye"})`,
          kind: "Üye",
          action: () => {
            navigate("Üyeler");
            setSearchOpen(false);
          },
        }))
      : []),
    ...navItems.map((n) => ({
      title: n.label,
      kind: "Sayfa",
      action: () => navigate(n.label),
    })),
  ].filter((x) =>
    x.title.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")),
  );
  function eventCard(event) {
    const cardAttendees = getEventAttendees(event.id);
    const isEnrolled = (
      eventAttendees[event.id] ||
      eventAttendees[String(event.id)] ||
      []
    )
      .map(String)
      .includes(String(currentUser?.id || ""));
    const enrolledCount = cardAttendees.length;

    return (
      <article className="event-card" key={event.id}>
        <button
          className="event-image"
          onClick={() => setModal({ type: "event", data: event })}
          aria-label={`${event.title} detayları`}
        >
          <img src={event.image} alt={event.title} />
          <span className="date-badge">
            <strong>{event.day}</strong>
            <span>{event.month}</span>
          </span>
          {isEnrolled && (
            <span className="joined-badge">
              <Check size={12} /> Kayıtlısın
            </span>
          )}
        </button>
        <div className="event-body">
          <span className={`category ${event.color}`}>{event.category}</span>
          <button
            className="event-title"
            onClick={() => setModal({ type: "event", data: event })}
          >
            {event.title}
          </button>
          <p className="event-meta">
            <MapPin size={13} />
            {event.place}
          </p>
          <p className="event-meta">
            <Clock3 size={13} />
            {event.time}
          </p>
          <div className="event-footer">
            <div className="attending">
              <div className="mini-avatars">
                {cardAttendees.length > 0 ? (
                  cardAttendees.slice(0, 3).map((att) => (
                    <span key={att.id} title={att.name}>
                      {att.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  ))
                ) : (
                  <span className="empty-avatar">-</span>
                )}
              </div>
              <span>
                {enrolledCount > 0
                  ? `${enrolledCount} katılımcı`
                  : "İlk katılan sen ol"}
                <small style={{ marginLeft: "4px", opacity: 0.75 }}>
                  ({event.people} kontenjan)
                </small>
              </span>
            </div>
            <button
              aria-label={`${event.title} incele`}
              onClick={() => setModal({ type: "event", data: event })}
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </article>
    );
  }
  function membershipCard() {
    return (
      <div className="member-card">
        <div className="member-card-top">
          <span className="card-brand">
            <Sprout size={23} /> IAAS <small>NÖHÜ</small>
          </span>
          <span className="active-pill">
            <span /> {profile?.role === "admin" ? "Kulüp Yöneticisi" : "Aktif üye"}
          </span>
        </div>
        <div className="card-pattern">
          <Globe2 />
        </div>
        <div className="member-name">{profile?.name || "Kulüp Üyesi"}</div>
        <p className="member-number">{profile?.memberNo || "IAAS-NÖHÜ"}</p>
        <div className="member-card-bottom">
          <div>
            <span>ÜYELİK DÖNEMİ</span>
            <strong>2026 – 2027</strong>
          </div>
          <ShieldCheck size={27} />
        </div>
      </div>
    );
  }
  if (!currentUserId || !currentUser) {
    return (
      <AuthPortal
        theme={theme}
        setTheme={setTheme}
        existingMembers={members}
        onRegister={handleRegister}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div
      className={`app-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}
      data-theme={theme}
    >
      {isMobile && mobileNav && (
        <div className="sidebar-overlay" onClick={() => setMobileNav(false)} />
      )}
      <aside
        id="sidebar"
        className={`sidebar ${mobileNav ? "open" : ""}`}
        inert={!sidebarOpen}
        aria-label="Ana menü"
      >
        <button
          className="sidebar-close icon-button"
          onClick={toggleSidebar}
          aria-label="Kenar menüsünü kapat"
          title="Kenar menüsünü kapat"
        >
          <X size={17} />
        </button>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Genel Bakış");
          }}
        >
          <div className="brand-symbol">
            <Sprout size={31} strokeWidth={1.7} />
          </div>
          <div>
            <strong>
              IAAS<span>NÖHÜ</span>
            </strong>
            <small>Birlikte daha yeşil bir gelecek.</small>
          </div>
        </a>
        <div className="workspace">
          <div className="workspace-icon">
            <Leaf size={19} />
          </div>
          <div>
            <strong>Üye Platformu</strong>
            <span>2026 – 2027 Dönemi</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">ÇALIŞMA ALANIM</div>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.label}
              className={page === item.label ? "nav-item selected" : "nav-item"}
              onClick={() => navigate(item.label)}
            >
              <item.icon size={19} strokeWidth={1.7} />
              <span>{item.label}</span>
              {item.count && <span className="nav-count">{item.count}</span>}
              {item.label === "Duyurular" && !readNotices && (
                <span className="nav-dot" />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="grow-card">
            <div className="grow-icon">
              <Sprout size={24} />
            </div>
            <strong>Birlikte büyüyoruz.</strong>
            <p>
              Fikirlerinle, enerjinle, seninle
              <br />
              daha güçlüyüz.
            </p>
            <button onClick={() => setModal({ type: "invite" })}>
              Bir arkadaşını davet et <ArrowUpRight size={15} />
            </button>
            <Leaf className="grow-decoration" size={91} />
          </div>
          <button
            className={`nav-item ${page === "Ayarlar" ? "selected" : ""}`}
            onClick={() => navigate("Ayarlar")}
          >
            <Settings size={19} strokeWidth={1.7} />
            <span>Ayarlar</span>
          </button>
          <button
            className="nav-item"
            onClick={() => setModal({ type: "help" })}
          >
            <CircleHelp size={19} strokeWidth={1.7} />
            <span>Yardım & Destek</span>
            <ArrowUpRight size={14} />
          </button>
          <button
            className="nav-item sidebar-logout-nav-item"
            onClick={handleLogout}
            title="Oturumu Kapat / Çıkış Yap"
            aria-label="Çıkış Yap"
          >
            <LogOut size={19} strokeWidth={1.7} />
            <span>Çıkış Yap</span>
          </button>
          <button
            className="sidebar-profile"
            onClick={() => navigate("Ayarlar")}
            title="Profil ayarlarına git"
          >
            <div className="avatar">{initials}</div>
            <div className="sidebar-profile-text">
              <strong>{profile.name}</strong>
              <span>{profile.role === "admin" ? "IAAS NÖHÜ Yönetici" : "IAAS NÖHÜ Üyesi"}</span>
            </div>
            <ChevronRight size={17} className="sidebar-profile-chevron" />
          </button>
        </div>
      </aside>
      <div
        className={`main-shell${page === "Magazin" ? " magazine-theme" : ""}`}
        inert={isMobile && mobileNav}
      >
        <header className="topbar">
          <div className="breadcrumb">
            <button
              ref={menuToggle}
              className="sidebar-toggle icon-button"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Menüyü kapat" : "Menüyü aç"}
              title={sidebarOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
            >
              {isMobile ? (
                <Menu size={21} />
              ) : sidebarOpen ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </button>
            <span>Üye Platformu</span>
            <ChevronRight size={13} />
            <strong>{page}</strong>
          </div>
          <div className="topbar-actions">
            <div className="search-wrap">
              <Search size={16} />
              <input
                aria-label="Platformda ara"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
              />
              <kbd>/</kbd>
              {searchOpen && query && (
                <div className="search-results">
                  {searchResults.length ? (
                    searchResults.map((r, i) => (
                      <button key={i} onClick={r.action}>
                        <span>{r.title}</span>
                        <small>{r.kind}</small>
                      </button>
                    ))
                  ) : (
                    <p>Aramana uygun bir sonuç bulunamadı.</p>
                  )}
                </div>
              )}
            </div>
            <div className="theme-switch" role="group" aria-label="Renk teması">
              <button
                aria-label="Açık tema"
                title="Açık tema"
                aria-pressed={theme === "light"}
                onClick={() => setTheme("light")}
              >
                <Sun size={15} />
                <span>Açık</span>
              </button>
              <button
                aria-label="Koyu tema"
                title="Koyu tema"
                aria-pressed={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                <Moon size={15} />
                <span>Koyu</span>
              </button>
            </div>
            <div className="notification-wrap">
              <button
                className="notification-button icon-button"
                aria-label="Bildirimler"
                onClick={() => {
                  setNotifications(!notifications);
                  setReadNotices(true);
                }}
              >
                <Bell size={20} />
                {!readNotices && <i />}
              </button>
              {notifications && (
                <div className="notifications-popover">
                  <strong>Bildirimlerin</strong>
                  <p>Yeni dönem üyeliğin aktif. Hoş geldin!</p>
                  <p>12 Ekim teknik gezisi için kayıtlar açık.</p>
                  <button
                    className="text-link"
                    onClick={() => {
                      navigate("Duyurular");
                      setNotifications(false);
                    }}
                  >
                    Tüm duyuruları gör <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
            <span className="top-divider" />
            <button
              className="avatar top-avatar"
              aria-label="Profil ayarları"
              onClick={() => navigate("Ayarlar")}
            >
              {initials}
            </button>
            <button
              className="icon-button top-logout"
              title="Çıkış Yap"
              aria-label="Çıkış Yap"
              onClick={handleLogout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main>
          {page !== "Magazin" && (
            <section className="page-heading">
              <div>
                <div className="eyebrow">
                  {page === "Genel Bakış"
                    ? "BİRLİKTE KEŞFET, BİRLİKTE BÜYÜ."
                    : "IAAS NÖHÜ • ÜYE PLATFORMU"}
                </div>
                <h1>
                  {page === "Genel Bakış" ? (
                    <>
                      Merhaba, {profile.name.split(" ")[0]}{" "}
                      <span className="hello-spark">✳</span>
                    </>
                  ) : (
                    page
                  )}
                </h1>
                <p>
                  {page === "Genel Bakış"
                    ? "Topluluğunda neler oluyor? Gel, birlikte göz atalım."
                    : {
                        Üyeliğim:
                          "Topluluğun bir parçasısın. Üyeliğine dair her şey burada.",
                        Etkinlikler:
                          "Yeni deneyimler, yeni arkadaşlıklar. Bir sonraki adımını keşfet.",
                        Duyurular:
                          "Topluluğumuzdan haberleri ve fırsatları kaçırma.",
                        Üyeler:
                          "Kayıtlı kulüp üyeleri ve yönetici yetkilendirme paneli.",
                        Magazin:
                          "Doğa, tarım ve yaşam bilimleri üzerine editoryal okumalar.",
                        Ayarlar: "Seni biraz daha yakından tanıyalım.",
                      }[page]}
                </p>
              </div>
              <div className="today">
                <CalendarDays size={16} />
                <span>2 Ekim 2026, Cuma</span>
              </div>
            </section>
          )}
          {page === "Magazin" && (
            <Magazine
              onRead={(article) => setModal({ type: "article", data: article })}
            />
          )}
          {page === "Genel Bakış" && (
            <>
              <div className="overview-grid">
                <div className="overview-left">
                  <section className="hero">
                    <img
                      src={images.hero}
                      alt="Yeşil tarım arazileri ve ormanlarla kaplı tepeler"
                    />
                    <div className="hero-shade" />
                    <div className="hero-content">
                      <span className="hero-tag">
                        <span /> IAAS NÖHÜ'YE HOŞ GELDİN
                      </span>
                      <h2>
                        Küçük adımlar,
                        <br />
                        büyük değişimler.
                      </h2>
                      <p>
                        Doğaya, geleceğe ve birbirimize değer katıyoruz.
                        <br />
                        Sen de bu hikâyenin bir parçasısın.
                      </p>
                      <button
                        className="light-button"
                        onClick={() => navigate("Etkinlikler")}
                      >
                        Etkinlikleri keşfet <ArrowUpRight size={17} />
                      </button>
                    </div>
                    <span className="hero-caption">
                      <Leaf size={13} /> Yerelden dünyaya, birlikte.
                    </span>
                    <span className="hero-pagination">
                      <i />
                      <i />
                      <i />
                    </span>
                  </section>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-icon mint">
                        <Users size={21} />
                      </span>
                      <div>
                        <span className="stat-label">Topluluğumuz</span>
                        <div className="stat-value">
                          {members.length}{" "}
                          <span className="stat-trend">
                            NÖHÜ <ArrowUpRight size={12} />
                          </span>
                        </div>
                        <span className="stat-note">
                          Kayıtlı kulüp üyeleri
                        </span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon peach">
                        <CalendarDays size={21} />
                      </span>
                      <div>
                        <span className="stat-label">Yaklaşan etkinlik</span>
                        <div className="stat-value">
                          3 <span className="stat-unit">etkinlik</span>
                        </div>
                        <span className="stat-note">
                          Yeni deneyimler seni bekliyor
                        </span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon lavender">
                        <Ticket size={21} />
                      </span>
                      <div>
                        <span className="stat-label">
                          Katıldığım etkinlikler
                        </span>
                        <div className="stat-value">
                          {joined.length}{" "}
                          <span className="stat-unit">kayıt</span>
                        </div>
                        <button
                          className="stat-note stat-link"
                          onClick={() => {
                            navigate("Etkinlikler");
                            setEventFilter("Kayıtlarım");
                          }}
                        >
                          Biriktirdiğin güzel anlar <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <section className="membership-panel">
                  <div className="section-title">
                    <h2>Üyelik durumum</h2>
                    <span className="small-leaf">
                      <ShieldCheck size={17} />
                    </span>
                  </div>
                  {membershipCard()}
                  <div className="membership-details">
                    <div>
                      <span>Üyelik geçerliliği</span>
                      <strong>30 Eylül 2027</strong>
                    </div>
                    <div>
                      <span>Yerel komite</span>
                      <strong>IAAS NÖHÜ</strong>
                    </div>
                  </div>
                  <button
                    className="outline-button full-width"
                    onClick={() => navigate("Üyeliğim")}
                  >
                    Üyeliğimi görüntüle <ArrowRight size={16} />
                  </button>
                </section>
              </div>
              <div className="lower-grid">
                <section className="events-section">
                  <div className="section-title">
                    <div>
                      <h2>Bir sonraki deneyimin</h2>
                      <p>Öğren, tanış, ilham al.</p>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => {
                        navigate("Etkinlikler");
                        setEventFilter("Tümü");
                      }}
                    >
                      Tüm etkinlikler <ArrowRight size={15} />
                    </button>
                  </div>
                  <div className="event-grid">{eventsList.map(eventCard)}</div>
                </section>
                <section className="announcements-panel">
                  <div className="section-title">
                    <h2>Topluluktan haberler</h2>
                    <span className="news-dot" />
                  </div>
                  <div className="news-list">
                    {announcementsList.map((a, i) => {
                      const AnnIcon = getAnnouncementIcon(a);
                      return (
                        <button
                          className="news-item"
                          key={a.id || a.title}
                          onClick={() =>
                            setModal({ type: "announcement", data: a })
                          }
                        >
                          <span className={`news-icon ${a.tone}`}>
                            <AnnIcon size={18} />
                          </span>
                          <span className="news-content">
                            <span className="news-category">
                              {a.type}
                              {i === 0 && <b>YENİ</b>}
                            </span>
                            <strong>{a.title}</strong>
                            <span className="news-excerpt">{a.text}</span>
                            <small>{a.date}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="all-news"
                    onClick={() => {
                      navigate("Duyurular");
                      setReadNotices(true);
                    }}
                  >
                    Tüm duyuruları gör <ArrowRight size={14} />
                  </button>
                </section>
              </div>
              <section className="community-strip">
                <span className="community-strip-icon">
                  <Globe2 size={27} strokeWidth={1.4} />
                </span>
                <div>
                  <strong>
                    Aynı tutkuyu paylaşan, sınırları aşan bir topluluk.
                  </strong>
                  <p>
                    50+ ülkede binlerce genç. Ortak bir amaç: daha
                    sürdürülebilir bir dünya.
                  </p>
                </div>
              </section>
            </>
          )}
          {page === "Etkinlikler" && (
            <>
              <div className="filter-row">
                {["Tümü", "Teknik Gezi", "Atölye", "Buluşma", "Kayıtlarım"].map(
                  (f) => (
                    <button
                      key={f}
                      className={eventFilter === f ? "filter active" : "filter"}
                      onClick={() => setEventFilter(f)}
                    >
                      {f}
                      {f === "Kayıtlarım" && ` (${joined.length})`}
                    </button>
                  ),
                )}
              </div>
              <div className="event-grid standalone">
                {eventsList
                  .filter(
                    (e) =>
                      eventFilter === "Tümü" ||
                      (eventFilter === "Kayıtlarım"
                        ? joined.some((jId) => String(jId) === String(e.id))
                        : eventFilter === e.category),
                  )
                  .map(eventCard)}
              </div>
              {eventFilter === "Kayıtlarım" && !joined.length && (
                <div className="empty-state">
                  <CalendarDays size={40} />
                  <h2>Yeni deneyimlere yer aç.</h2>
                  <p>
                    Henüz bir etkinliğe kayıt olmadın. İlk adımı birlikte
                    atalım.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => setEventFilter("Tümü")}
                  >
                    Etkinlikleri keşfet <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          {page === "Üyeliğim" && (
            <div className="membership-page">
              <section className="surface">
                <h2>Dijital üye kartın</h2>
                {membershipCard()}
                <button
                  className="outline-button full-width"
                  onClick={downloadCard}
                >
                  <Download size={16} /> Üyelik bilgilerini indir
                </button>
              </section>
              <section className="surface">
                <span className="section-kicker">İYİ Kİ ARAMIZDASIN</span>
                <h2>Bir üyelikten çok daha fazlası.</h2>
                <p className="muted">
                  Üyeliğin 30 Eylül 2027 tarihine kadar aktif. Topluluğumuzun
                  sunduğu tüm fırsatları keşfet.
                </p>
                {[
                  "Yerel ve uluslararası etkinliklere katılım",
                  "ExPro değişim programlarına başvuru",
                  "Atölyeler ve eğitim kaynaklarına erişim",
                  "50+ ülkeden öğrencilerle bağlantı kurma",
                ].map((t) => (
                  <div className="benefit" key={t}>
                    <span>
                      <Check size={15} />
                    </span>
                    {t}
                  </div>
                ))}
                <button
                  className="primary-button"
                  onClick={() => navigate("Etkinlikler")}
                >
                  Fırsatları keşfet <ArrowUpRight size={17} />
                </button>
              </section>
            </div>
          )}
          {page === "Üyeler" &&
            (currentUser.role === "admin" ? (
              <MembersPage
                members={members}
                currentUserId={currentUser.id}
                onToggleAdmin={handleToggleAdmin}
                onAddMember={handleAddMember}
                onDeleteMember={handleDeleteMember}
                events={eventsList}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                eventAttendees={eventAttendees}
                onRemoveAttendee={handleRemoveAttendee}
                announcements={announcementsList}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            ) : (
              <div
                className="surface empty-state full-width"
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  margin: "24px auto",
                  maxWidth: 600,
                }}
              >
                <ShieldAlert
                  size={46}
                  style={{ color: "var(--accent)", marginBottom: 14 }}
                />
                <h2>Yetkisiz Erişim</h2>
                <p className="muted" style={{ margin: "8px 0 20px" }}>
                  Bu sayfa ve kulüp yönetim paneli yalnızca IAAS NÖHÜ Kulüp
                  Yöneticileri (Admin) tarafından görüntülenebilir.
                </p>
                <button
                  className="primary-button"
                  onClick={() => navigate("Genel Bakış")}
                >
                  Genel Bakış'a Dön
                </button>
              </div>
            ))}
          {page === "Duyurular" && (
            <div className="notice-grid">
              {announcementsList.map((a) => {
                const AnnIcon = getAnnouncementIcon(a);
                return (
                  <article className="surface notice-card" key={a.id || a.title}>
                    <span className={`news-icon ${a.tone}`}>
                      <AnnIcon size={23} />
                    </span>
                    <span className="section-kicker">
                      {a.type} · {a.date}
                    </span>
                    <h2>{a.title}</h2>
                    <p className="muted">{a.text}</p>
                    <button
                      className="text-link"
                      onClick={() => setModal({ type: "announcement", data: a })}
                    >
                      Devamını oku <ArrowRight size={16} />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
          {page === "Ayarlar" && (
            <>
              <section className="surface profile-settings">
              <div className="settings-heading">
                <div className="avatar large-avatar">{initials}</div>
                <div>
                  <h2>Profil bilgilerin</h2>
                  <p className="muted">Topluluğundaki yolculuğun sana özel.</p>
                </div>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const next = Object.fromEntries(
                    [...data].map(([key, value]) => [key, value.trim()]),
                  );
                  if (Object.values(next).some((value) => !value)) {
                    notify("Lütfen tüm alanları doldur.");
                    return;
                  }
                  handleProfileSave(next);
                }}
              >
                <div className="form-grid">
                  <label>
                    Ad soyad
                    <input
                      name="name"
                      defaultValue={profile.name}
                      required
                      maxLength={60}
                    />
                  </label>
                  <label>
                    E-posta adresi
                    <input
                      name="email"
                      type="email"
                      defaultValue={profile.email}
                      required
                    />
                  </label>
                  <label>
                    Üniversite
                    <input
                      name="university"
                      defaultValue={profile.university}
                      required
                    />
                  </label>
                  <label>
                    Bölüm
                    <input
                      name="department"
                      defaultValue={profile.department}
                      required
                    />
                  </label>
                </div>
                <div className="form-footer">
                  <span>Bilgilerin bu tarayıcıda saklanır.</span>
                  <button className="primary-button" type="submit">
                    Değişiklikleri kaydet <Check size={16} />
                  </button>
                </div>
              </form>
            </section>
            <section className="surface profile-settings session-settings-panel">
              <div className="settings-heading">
                <div className="avatar large-avatar session-avatar">
                  <LogOut size={22} />
                </div>
                <div>
                  <h2>Oturum ve Güvenlik</h2>
                  <p className="muted">Hesabınızdan güvenle çıkış yapabilir veya başka bir hesapla giriş yapabilirsiniz.</p>
                </div>
              </div>
              <div className="session-panel-body">
                <div className="session-account-details">
                  <div className="session-account-row">
                    <span className="session-account-badge">
                      <span className="active-dot" /> Aktif Oturum:
                    </span>
                    <strong className="session-account-name">{profile.name}</strong>
                  </div>
                  <div className="session-account-meta">
                    <span><strong>E-posta:</strong> {profile.email}</span>
                    <span>•</span>
                    <span><strong>Öğrenci No:</strong> {profile.studentNo}</span>
                    <span>•</span>
                    <span><strong>Yetki:</strong> {profile.role === "admin" ? "Kulüp Yöneticisi (Admin)" : "Kulüp Üyesi"}</span>
                  </div>
                </div>
                <div className="session-actions">
                  <button
                    type="button"
                    className="danger-button settings-logout-btn"
                    onClick={handleLogout}
                    title="Hesaptan Çıkış Yap"
                    aria-label="Hesaptan Çıkış Yap"
                  >
                    <LogOut size={16} />
                    <span>Hesaptan Çıkış Yap</span>
                  </button>
                </div>
              </div>
              </section>
            </>
          )}
          <footer className="footer">
            <span>© 2026 IAAS NÖHÜ. Birlikte daha ileriye.</span>
            <div>
              <span className="footer-status">
                <i /> Birlikte büyüyoruz
              </span>
              <span className="footer-separator">·</span>
              <button onClick={() => setModal({ type: "privacy" })}>
                Gizlilik
              </button>
              <button onClick={() => setModal({ type: "help" })}>
                İletişim <ArrowUpRight size={12} />
              </button>
            </div>
          </footer>
        </main>
      </div>
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className={`modal${modal.type === "article" ? " magazine-reader-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={
              modal.type === "event" || modal.type === "article"
                ? modal.data.title
                : "Bilgilendirme"
            }
          >
            <button
              autoFocus
              className="modal-close icon-button"
              onClick={() => setModal(null)}
              aria-label="Pencereyi kapat"
            >
              <X size={21} />
            </button>
            {modal.type === "article" && (
              <MagazineArticle article={modal.data} />
            )}
            {modal.type === "event" && (() => {
              const modalAttendees = getEventAttendees(modal.data.id);
              const isEnrolled = (
                eventAttendees[modal.data.id] ||
                eventAttendees[String(modal.data.id)] ||
                []
              )
                .map(String)
                .includes(String(currentUser.id));
              const attendeeCount = modalAttendees.length;

              return (
                <>
                  <img
                    className="modal-event-image"
                    src={modal.data.image}
                    alt={modal.data.title}
                  />
                  <div className="modal-content">
                    <span className={`category ${modal.data.color}`}>
                      {modal.data.category}
                    </span>
                    <h2>{modal.data.title}</h2>
                    <p className="muted">{modal.data.description}</p>
                    <div className="modal-event-meta">
                      <p>
                        <CalendarDays size={17} />
                        {modal.data.date} · {modal.data.time}
                      </p>
                      <p>
                        <MapPin size={17} />
                        {modal.data.place}
                      </p>
                      <p>
                        <Users size={17} />
                        {attendeeCount} kayıtlı katılımcı · Kontenjan: {modal.data.people} Kişi
                      </p>
                    </div>
                    <button
                      className={`full-width ${isEnrolled ? "outline-button" : "primary-button"}`}
                      onClick={() => toggleEvent(modal.data.id)}
                    >
                      {isEnrolled ? (
                        <>
                          <Check size={17} /> Kayıtlısın · Kaydımı iptal et
                        </>
                      ) : (
                        <>
                          Etkinliğe katıl <ArrowUpRight size={17} />
                        </>
                      )}
                    </button>

                    {/* Live Attendee List Section */}
                    <div className="modal-attendees-section" aria-label="Etkinlik katılımcı listesi">
                      <div className="modal-attendees-header">
                        <div className="modal-attendees-title">
                          <Users size={16} />
                          <strong>Katılımcı Listesi</strong>
                          <span className="attendees-count-badge">
                            {attendeeCount}
                          </span>
                        </div>
                        <span className="attendees-quota-note">
                          Kalan: {Math.max(0, modal.data.people - attendeeCount)} Kontenjan
                        </span>
                      </div>

                      {attendeeCount === 0 ? (
                        <div className="modal-attendees-empty">
                          <Sprout size={18} />
                          <span>Henüz kayıtlı katılımcı bulunmuyor. İlk katılan sen ol!</span>
                        </div>
                      ) : (
                        <div className="modal-attendees-list">
                          {modalAttendees.map((att) => {
                            const isMe = String(att.id) === String(currentUser.id);
                            const initials = att.name
                              .split(" ")
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join("");
                            return (
                              <div
                                key={att.id}
                                className={`modal-attendee-card ${isMe ? "me" : ""}`}
                              >
                                <div className="modal-attendee-avatar">{initials}</div>
                                <div className="modal-attendee-info">
                                  <div className="modal-attendee-name-row">
                                    <span className="attendee-name">{att.name}</span>
                                    {isMe && <span className="attendee-me-badge">Sen</span>}
                                    {att.role === "admin" && (
                                      <span className="attendee-admin-badge">Yönetici</span>
                                    )}
                                  </div>
                                  <span className="attendee-sub">
                                    {att.department || att.faculty || "IAAS NÖHÜ Üyesi"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <small className="demo-note">
                      Katılım durumunuz anlık olarak güncellenir ve kulüp kayıtlarında saklanır.
                    </small>
                  </div>
                </>
              );
            })()}
            {modal.type === "announcement" && (
              <div className="modal-content text-modal">
                <span className={`news-icon ${modal.data.tone}`}>
                  {React.createElement(getAnnouncementIcon(modal.data), { size: 25 })}
                </span>
                <span className="section-kicker">
                  {modal.data.type} · {modal.data.date}
                </span>
                <h2>{modal.data.title}</h2>
                <p className="muted">{modal.data.text}</p>
                <p className="muted">
                  {modal.data.type === "ÜYELİK"
                    ? "Yeni dönemde teknik geziler, eğitimler ve uluslararası fırsatlarla yeniden bir aradayız. Aktif üyeliğini Üyeliğim sayfasından görüntüleyebilir, etkinliklere hemen kayıt olabilirsin."
                    : modal.data.type === "FIRSATLAR"
                      ? "ExPro, tarım ve yaşam bilimleri alanında uluslararası deneyim edinmek isteyen üyeleri bir araya getirir. Başvuru tarihleri ve ülke seçenekleri için yerel komitenle iletişime geç."
                      : "Atölye, sosyal sorumluluk veya bir araştırma projesi: her fikir bizim için değerli. Fikrini ve hedefini kısaca anlatan bir mesajı yerel komitene iletebilirsin."}
                </p>
                {modal.data.type === "ÜYELİK" && (
                  <button
                    className="primary-button"
                    onClick={() => {
                      navigate("Üyeliğim");
                      setModal(null);
                    }}
                  >
                    Üyeliğimi görüntüle <ArrowRight size={16} />
                  </button>
                )}
              </div>
            )}
            {modal.type === "invite" && (
              <div className="modal-content text-modal">
                <span className="news-icon mint">
                  <Heart size={26} />
                </span>
                <h2>Güzel şeyler paylaştıkça büyür.</h2>
                <p className="muted">
                  Arkadaşını IAAS topluluğuna davet etmek için bu mesajı paylaş.
                </p>
                <div className="invite-message">
                  Birlikte daha yeşil bir gelecek için IAAS NÖHÜ’ye katıl!
                  Tarım, çevre ve yaşam bilimlerine ilgi duyan gençlerle tanış,
                  birlikte üret ve yeni deneyimler keşfet.
                </div>
                <button
                  className="primary-button full-width"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        "Birlikte daha yeşil bir gelecek için IAAS NÖHÜ’ye katıl! " +
                          window.location.origin,
                      );
                      notify("Davet mesajı panoya kopyalandı.");
                    } catch {
                      notify(
                        "Panoya erişilemedi. Mesajı seçerek kopyalayabilirsin.",
                      );
                    }
                  }}
                >
                  Davet mesajını kopyala <ExternalLink size={16} />
                </button>
              </div>
            )}
            {modal.type === "help" && (
              <div className="modal-content text-modal">
                <span className="news-icon mint">
                  <CircleHelp size={25} />
                </span>
                <h2>Nasıl yardımcı olabiliriz?</h2>
                <details open>
                  <summary>Etkinliklere nasıl katılırım?</summary>
                  <p>
                    Etkinlikler sayfasında bir etkinliği açıp “Etkinliğe katıl”
                    düğmesine basabilirsin. Kayıtlarını “Kayıtlarım” filtresinde
                    bulabilirsin.
                  </p>
                </details>
                <details>
                  <summary>Profilimi nasıl güncellerim?</summary>
                  <p>
                    Ayarlar sayfasından adını, e-posta adresini ve üniversite
                    bilgilerini güncelleyebilirsin.
                  </p>
                </details>
                <details>
                  <summary>Bu platform canlı bir üyelik sistemi mi?</summary>
                  <p>
                    Bu bir arayüz demosudur. Üyelik verileri örnektir; profilin
                    ve kayıtların bu tarayıcıda saklanır. Henüz sunucuya veri
                    gönderilmez.
                  </p>
                </details>
              </div>
            )}
            {modal.type === "privacy" && (
              <div className="modal-content text-modal">
                <span className="news-icon mint">
                  <ShieldCheck size={25} />
                </span>
                <h2>Gizliliğin önemli.</h2>
                <p className="muted">
                  Bu demo uygulamasında profil değişikliklerin ve etkinlik
                  kayıtların yalnızca kullandığın tarayıcının yerel
                  depolamasında saklanır. Herhangi bir üyelik sunucusuna
                  iletilmez.
                </p>
                <p className="muted">
                  Görseller ve yazı tipleri harici hizmetlerden yüklenir.
                  Tarayıcı site verilerini temizleyerek yerel kayıtlarını
                  silebilirsin. Gerçek kişisel veya hassas bilgilerini demo
                  ortamına girmemeni öneririz.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={16} />
          </span>
          {toast}
          <button onClick={() => setToast("")} aria-label="Bildirimi kapat">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
