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
import { normalizeStudentNo, isFeritUser } from "./utils.js";

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
    id: "mem-ferit",
    memberNo: "IAAS-NÖHÜ-002",
    name: "Ferit Efe Türkşad Çolak",
    email: "feritefeturksadcolak@ohu.edu.tr",
    studentNo: "240102015",
    faculty: "Tarım Bilimleri ve Teknolojileri Fakültesi",
    department: "Tarımsal Genetik Mühendisliği",
    role: "admin",
    password: "123456",
    status: "Aktif",
    joinedDate: "15 Eylül 2026",
    phone: "0534 248 7751",
  },
  {
    id: "mem-ferit-gmail",
    memberNo: "IAAS-NÖHÜ-002-ALT",
    name: "Ferit Çolak",
    email: "Colakferit21@gmail.com",
    studentNo: "210405001",
    faculty: "Tarım Bilimleri ve Teknolojileri Fakültesi",
    department: "Tarımsal Genetik Mühendisliği",
    role: "admin",
    password: "123456",
    status: "Aktif",
    joinedDate: "15 Eylül 2026",
    phone: "0555 000 0000",
  },
  {
    id: "mem-2",
    memberNo: "IAAS-NÖHÜ-003",
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
    memberNo: "IAAS-NÖHÜ-004",
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

      // Ensure any existing account belonging to Ferit is set to admin
      list = list.map((m) => {
        if (isFeritUser(m) && m.role !== "admin") {
          changed = true;
          return { ...m, role: "admin" };
        }
        return m;
      });

      const feritAccount = initialMembers.find((m) => isFeritUser(m));
      if (feritAccount && !list.some((m) => isFeritUser(m))) {
        list = [...list, feritAccount];
        changed = true;
      }

      // Deduplicate existing list and filter out test accounts
      // Prioritize admin accounts first so an admin is never discarded
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
          !isFeritUser(m) &&
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

  const rawCurrentUser = members.find((m) => m.id === currentUserId) || members[0] || {
    id: "temp",
    name: "Kulüp Üyesi",
    email: "uye@ohu.edu.tr",
    studentNo: "-",
    faculty: "Tarım Bilimleri ve Teknolojileri Fakültesi",
    department: "Tarım Bilimleri",
    role: "member",
    status: "Aktif",
    memberNo: "IAAS-NÖHÜ-001",
  };

  const currentUser = isFeritUser(rawCurrentUser)
    ? { ...rawCurrentUser, role: "admin" }
    : rawCurrentUser;

  const profile = {
    name: currentUser.name,
    email: currentUser.email,
    university: currentUser.university || "Niğde Ömer Halisdemir Üniversitesi",
    department: currentUser.department,
    role: currentUser.role,
    memberNo: currentUser.memberNo || "IAAS-NÖHÜ-001",
    studentNo: currentUser.studentNo || "-",
    faculty: currentUser.faculty || "Tarım Bilimleri ve Teknolojileri Fakültesi",
  };
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
    (item) => !item.adminOnly || currentUser.role === "admin",
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
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
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
    const userIdStr = String(currentUser.id);
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
    if (memberIdStr === String(currentUser.id)) {
      const nextJoined = joined.filter((x) => String(x) !== eventIdStr);
      setJoined(nextJoined);
      try {
        localStorage.setItem("iaas-events", JSON.stringify(nextJoined));
      } catch {}
    }
    try {
      localStorage.setItem("iaas_event_attendees", JSON.stringify(updatedAttendees));
    } catch {}
    notify("Katılımcı etkinlik listesinden çıkarıldı.");
  }

  function handleAddEvent(newEvent) {
    const updated = [newEvent, ...eventsList];
    setEventsList(updated);
    try {
      localStorage.setItem("iaas_events_data", JSON.stringify(updated));
    } catch {}
    notify(`"${newEvent.title}" etkinliği oluşturuldu.`);
  }

  function handleDeleteEvent(eventId, title) {
    const updated = eventsList.filter((e) => e.id !== eventId);
    setEventsList(updated);
    const updatedAttendees = { ...eventAttendees };
    delete updatedAttendees[eventId];
    setEventAttendees(updatedAttendees);
    const nextJoined = joined.filter((id) => id !== eventId);
    setJoined(nextJoined);
    try {
      localStorage.setItem("iaas_events_data", JSON.stringify(updated));
      localStorage.setItem("iaas_event_attendees", JSON.stringify(updatedAttendees));
      localStorage.setItem("iaas-events", JSON.stringify(nextJoined));
    } catch {}
    notify(`"${title}" etkinliği silindi.`);
  }

  function handleAddAnnouncement(newAnn) {
    const updated = [newAnn, ...announcementsList];
    setAnnouncementsList(updated);
    try {
      localStorage.setItem("iaas_announcements_data", JSON.stringify(updated));
    } catch {}
    notify(`"${newAnn.title}" duyurusu yayınlandı.`);
  }

  function handleDeleteAnnouncement(annId, title) {
    const updated = announcementsList.filter(
      (a) => (a.id ? a.id !== annId : a.title !== title),
    );
    setAnnouncementsList(updated);
    try {
      localStorage.setItem("iaas_announcements_data", JSON.stringify(updated));
    } catch {}
    notify(`"${title}" duyurusu kaldırıldı.`);
  }
  function handleRegister(newMember) {
    const isFerit = isFeritUser(newMember);
    const finalMember = isFerit ? { ...newMember, role: "admin" } : newMember;

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
      // Eğer mevcut kayıt aynı kullanıcıya aitse (aynı e-posta veya Ferit'in hesapları), güncellemeye izin ver
      const existingIdx = members.findIndex(
        (m) => m.studentNo && normalizeStudentNo(m.studentNo) === normStudentNo
      );
      if (existingIdx !== -1) {
        const existing = members[existingIdx];
        const isSame =
          (existing.email || "").toLowerCase() === normEmail ||
          (isFerit &&
            ((existing.email || "").toLowerCase() === "colakferit21@gmail.com" ||
              (existing.email || "").toLowerCase() === "feritefeturksadcolak@ohu.edu.tr"));

        if (isSame) {
          const updated = members.map((m, i) => (i === existingIdx ? finalMember : m));
          setMembers(updated);
          setCurrentUserId(finalMember.id);
          try {
            localStorage.setItem("iaas_members", JSON.stringify(updated));
            localStorage.setItem("iaas_current_user_id", finalMember.id);
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
      notify("Hata: Bu e-posta adresi ile kayıtlı bir üye zaten mevcut.");
      return;
    }

    finalMember.studentNo = (finalMember.studentNo || "").trim();

    const updated = [finalMember, ...members];
    setMembers(updated);
    setCurrentUserId(finalMember.id);
    try {
      localStorage.setItem("iaas_members", JSON.stringify(updated));
      localStorage.setItem("iaas_current_user_id", finalMember.id);
    } catch {}
    notify(`Aramıza hoş geldin, ${finalMember.name}! Kulüp üyeliğin oluşturuldu.`);
  }

  function handleLogin(user) {
    const isFerit = isFeritUser(user);
    if (isFerit && user.role !== "admin") {
      const updated = members.map((m) =>
        m.id === user.id ? { ...m, role: "admin" } : m
      );
      setMembers(updated);
      try {
        localStorage.setItem("iaas_members", JSON.stringify(updated));
      } catch {}
      user = { ...user, role: "admin" };
    }
    setCurrentUserId(user.id);
    try {
      localStorage.setItem("iaas_current_user_id", user.id);
    } catch {}
    notify(`Tekrar hoş geldin, ${user.name}!`);
  }

  function handleLogout() {
    setCurrentUserId(null);
    try {
      localStorage.removeItem("iaas_current_user_id");
    } catch {}
    notify("Oturum kapatıldı. Üyelik ekranına yönlendirildiniz.");
  }

  function handleToggleAdmin(targetId) {
    const target = members.find((m) => m.id === targetId);
    if (!target) return;
    if (isFeritUser(target) && target.role === "admin") {
      notify("Kulüp yöneticisi (Ferit Çolak) hesabının admin yetkisi kaldırılamaz.");
      return;
    }
    const newRole = target.role === "admin" ? "member" : "admin";
    const updated = members.map((m) =>
      m.id === targetId ? { ...m, role: newRole } : m
    );
    setMembers(updated);
    try {
      localStorage.setItem("iaas_members", JSON.stringify(updated));
    } catch {}
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
    notify(`${newMember.name} kulüp kütüğüne eklendi.`);
  }

  function handleDeleteMember(targetId, name) {
    if (targetId === currentUserId) {
      notify("Kendi hesabınızı silemezsiniz.");
      return;
    }
    const updated = members.filter((m) => m.id !== targetId);
    setMembers(updated);
    try {
      localStorage.setItem("iaas_members", JSON.stringify(updated));
    } catch {}
    notify(`${name} üye kaydı silindi.`);
  }

  function handleProfileSave(data) {
    const updatedUser = { ...currentUser, ...data };
    const updated = members.map((m) =>
      m.id === currentUser.id ? updatedUser : m
    );
    setMembers(updated);
    try {
      localStorage.setItem("iaas_members", JSON.stringify(updated));
      localStorage.setItem("iaas-profile", JSON.stringify(data));
    } catch {}
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
    ...(currentUser.role === "admin"
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
      .includes(String(currentUser.id));
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
            <span /> {profile.role === "admin" ? "Kulüp Yöneticisi" : "Aktif üye"}
          </span>
        </div>
        <div className="card-pattern">
          <Globe2 />
        </div>
        <div className="member-name">{profile.name}</div>
        <p className="member-number">{profile.memberNo}</p>
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
  if (!currentUserId) {
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
                        ? joined.includes(e.id)
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
