import React, { useState } from "react";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock3,
  Download,
  Eye,
  FileText,
  Globe2,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import "./members.css";
import { normalizeStudentNo } from "./utils.js";
import { exportAttendeesToExcel, exportAttendeesToPdf } from "./exportUtils.js";
import {
  getEventStockImage,
  normalizeEventImage,
  STOCK_IMAGES_BY_CATEGORY,
  ALL_STOCK_PRESETS,
} from "./eventImages.js";

const NOHU_FACULTIES = [
  "Tarım Bilimleri ve Teknolojileri Fakültesi",
  "Mühendislik Fakültesi",
  "Fen-Edebiyat Fakültesi",
  "İktisadi ve İdari Bilimler Fakültesi",
  "Mimarlık Fakültesi",
  "İletişim Fakültesi",
  "Bor Sağlık Bilimleri Fakültesi",
  "Diğer",
];

const EVENT_CATEGORIES = [
  "Teknik Gezi",
  "Atölye",
  "Buluşma",
  "Seçim / Genel Kurul",
  "Seminer",
  "Sosyal",
  "Uluslararası",
];
const EVENT_COLORS = [
  { label: "Yeşil (Doğa / Gezi)", value: "green" },
  { label: "Turuncu (Atölye / Uygulama)", value: "orange" },
  { label: "Mor (Buluşma / Ağ)", value: "purple" },
];

const ANNOUNCEMENT_TYPES = ["ÜYELİK", "FIRSATLAR", "TOPLULUK", "DUYURU", "AKADEMİK"];
const ANNOUNCEMENT_TONES = [
  { label: "Şeftali (Önemli / Üyelik)", value: "peach" },
  { label: "Nane Yeşili (Fırsat / Global)", value: "mint" },
  { label: "Lavanta (Topluluk / Proje)", value: "lavender" },
];

export default function MembersPage({
  members = [],
  currentUserId,
  onToggleAdmin,
  onAddMember,
  onDeleteMember,
  events = [],
  onAddEvent,
  onDeleteEvent,
  eventAttendees = {},
  onRemoveAttendee,
  announcements = [],
  onAddAnnouncement,
  onDeleteAnnouncement,
}) {
  const [activeTab, setActiveTab] = useState("members"); // 'members' | 'events' | 'announcements'

  // --- Member Tab States ---
  const [memberSearch, setMemberSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all"); // 'all' | 'admin' | 'member'
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    email: "",
    studentNo: "",
    faculty: NOHU_FACULTIES[0],
    department: "",
    phone: "",
    role: "member",
  });

  // --- Event Tab States ---
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);
  const [newEventForm, setNewEventForm] = useState({
    title: "",
    category: EVENT_CATEGORIES[0],
    color: "green",
    day: "28",
    month: "EKİ",
    date: "28 Ekim 2026",
    time: "10.00 – 16.00",
    place: "NÖHÜ Kongre ve Kültür Merkezi",
    people: 30,
    description: "",
    image: "",
  });

  // --- Announcement Tab States ---
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [newAnnForm, setNewAnnForm] = useState({
    title: "",
    type: ANNOUNCEMENT_TYPES[0],
    tone: "mint",
    date: new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date()),
    text: "",
  });

  // Calculations for stats
  const totalMembers = members.length;
  const adminCount = members.filter((m) => m.role === "admin").length;
  const regularCount = members.filter((m) => m.role === "member").length;
  const totalEvents = events.length;
  const totalEnrollments = Object.values(eventAttendees).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0,
  );

  // Filtered members
  const filteredMembers = members.filter((m) => {
    const s = (memberSearch || "").toLowerCase();
    const matchesSearch =
      (m.name || "").toLowerCase().includes(s) ||
      (m.email || "").toLowerCase().includes(s) ||
      (m.studentNo || "").toLowerCase().includes(s) ||
      (m.department || "").toLowerCase().includes(s) ||
      (m.faculty || "").toLowerCase().includes(s);

    const matchesRole =
      filterRole === "all" ||
      (filterRole === "admin" && m.role === "admin") ||
      (filterRole === "member" && m.role === "member");

    return matchesSearch && matchesRole;
  });

  // Handlers
  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    setAddMemberError("");
    if (
      !newMemberForm.name.trim() ||
      !newMemberForm.email.trim() ||
      !newMemberForm.studentNo.trim()
    ) {
      setAddMemberError("Lütfen zorunlu alanları (Ad Soyad, E-posta, Öğrenci No) eksiksiz doldurun.");
      return;
    }

    const cleanEmail = newMemberForm.email.trim().toLowerCase();
    const normStudentNo = normalizeStudentNo(newMemberForm.studentNo);

    // Consolidate all known members
    let checkList = [...members];
    try {
      const stored = JSON.parse(localStorage.getItem("iaas_members"));
      if (Array.isArray(stored)) {
        checkList = [...checkList, ...stored];
      }
    } catch {}

    if (checkList.some((m) => m.email && m.email.trim().toLowerCase() === cleanEmail)) {
      setAddMemberError("Bu e-posta adresiyle kayıtlı bir üye zaten mevcut.");
      return;
    }

    if (
      normStudentNo &&
      checkList.some((m) => m.studentNo && normalizeStudentNo(m.studentNo) === normStudentNo)
    ) {
      setAddMemberError("Bu öğrenci numarası ile kayıtlı bir üye zaten mevcut.");
      return;
    }

    const nextNumber = members.length + 1;
    const memberNo = `IAAS-NÖHÜ-${String(nextNumber).padStart(3, "0")}`;

    const newMember = {
      id: `mem-${Date.now()}`,
      memberNo,
      name: newMemberForm.name.trim(),
      email: newMemberForm.email.trim(),
      studentNo: newMemberForm.studentNo.trim(),
      faculty: newMemberForm.faculty,
      department: newMemberForm.department.trim() || "Genel Üye",
      phone: newMemberForm.phone.trim() || "Belirtilmedi",
      password: "123456",
      role: newMemberForm.role,
      status: "Aktif",
      joinedDate: new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    };

    onAddMember(newMember);
    setShowAddMemberModal(false);
    setNewMemberForm({
      name: "",
      email: "",
      studentNo: "",
      faculty: NOHU_FACULTIES[0],
      department: "",
      phone: "",
      role: "member",
    });
  };

  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!newEventForm.title.trim() || !newEventForm.description.trim()) return;

    const assignedImage =
      newEventForm.image ||
      getEventStockImage(newEventForm.category, newEventForm.title);

    const newEvent = {
      id: Date.now(),
      title: newEventForm.title.trim(),
      category: newEventForm.category,
      color: newEventForm.color,
      day: newEventForm.day.trim() || "15",
      month: newEventForm.month.trim() || "EKİ",
      date: newEventForm.date.trim(),
      time: newEventForm.time.trim(),
      place: newEventForm.place.trim(),
      people: parseInt(newEventForm.people, 10) || 25,
      description: newEventForm.description.trim(),
      image: assignedImage,
    };

    onAddEvent(newEvent);
    setShowAddEventModal(false);
    setNewEventForm({
      title: "",
      category: EVENT_CATEGORIES[0],
      color: "green",
      day: "28",
      month: "EKİ",
      date: "28 Ekim 2026",
      time: "10.00 – 16.00",
      place: "NÖHÜ Kongre ve Kültür Merkezi",
      people: 30,
      description: "",
      image: "",
    });
  };

  const handleAddAnnSubmit = (e) => {
    e.preventDefault();
    if (!newAnnForm.title.trim() || !newAnnForm.text.trim()) return;

    const newAnn = {
      id: `ann-${Date.now()}`,
      title: newAnnForm.title.trim(),
      type: newAnnForm.type,
      tone: newAnnForm.tone,
      date: newAnnForm.date,
      text: newAnnForm.text.trim(),
      iconName:
        newAnnForm.type === "ÜYELİK"
          ? "Sparkles"
          : newAnnForm.type === "FIRSATLAR"
            ? "Globe2"
            : "Sprout",
    };

    onAddAnnouncement(newAnn);
    setShowAddAnnModal(false);
    setNewAnnForm({
      title: "",
      type: ANNOUNCEMENT_TYPES[0],
      tone: "mint",
      date: new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
      text: "",
    });
  };

  // Helper to resolve attendees for an event
  const getAttendeesForEvent = (eventId) => {
    const attendeeIds =
      eventAttendees[eventId] ||
      eventAttendees[String(eventId)] ||
      eventAttendees[Number(eventId)] ||
      [];
    return attendeeIds
      .map((id) => members.find((m) => String(m.id) === String(id)))
      .filter(Boolean);
  };

  return (
    <div className="members-page">
      {/* Admin Panel Header */}
      <section className="members-header surface">
        <div className="members-header-content">
          <span className="section-kicker">IAAS NÖHÜ • KULÜP YÖNETİMİ</span>
          <h2>Üye Topluluğu & Yönetici Paneli</h2>
          <p className="muted">
            Kulüp üyelerini yönetin, yeni etkinlikler ve duyurular yayınlayın,
            etkinlik katılımcı listelerini anlık olarak inceleyin.
          </p>
        </div>

        <div className="admin-quick-actions">
          {activeTab === "members" && (
            <button
              className="primary-button add-member-btn"
              onClick={() => setShowAddMemberModal(true)}
            >
              <UserPlus size={16} />
              <span>Yeni Üye Kaydet</span>
            </button>
          )}

          {activeTab === "events" && (
            <button
              className="primary-button add-member-btn"
              onClick={() => setShowAddEventModal(true)}
            >
              <CalendarPlus size={16} />
              <span>Yeni Etkinlik Başlat</span>
            </button>
          )}

          {activeTab === "announcements" && (
            <button
              className="primary-button add-member-btn"
              onClick={() => setShowAddAnnModal(true)}
            >
              <Megaphone size={16} />
              <span>Yeni Duyuru Yayınla</span>
            </button>
          )}
        </div>
      </section>

      {/* Main Admin Navigation Tabs */}
      <div className="admin-nav-tabs surface">
        <button
          className={`admin-tab-btn ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          <Users size={17} />
          <span>Kulüp Üyeleri & Yetkiler</span>
          <span className="tab-badge">{totalMembers}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          <CalendarDays size={17} />
          <span>Etkinlik Yönetimi & Katılımcılar</span>
          <span className="tab-badge">{totalEvents}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "announcements" ? "active" : ""}`}
          onClick={() => setActiveTab("announcements")}
        >
          <Bell size={17} />
          <span>Kulüp Duyuruları</span>
          <span className="tab-badge">{announcements.length}</span>
        </button>
      </div>

      {/* ================= TAB 1: MEMBERS MANAGEMENT ================= */}
      {activeTab === "members" && (
        <>
          {/* Stats Grid */}
          <div className="members-stats-grid">
            <div className="stat-card surface">
              <span className="stat-icon mint">
                <Users size={22} />
              </span>
              <div>
                <span className="stat-label">Toplam Kulüp Üyesi</span>
                <div className="stat-value">{totalMembers}</div>
                <span className="stat-note">Kayıtlı NÖHÜ öğrencisi</span>
              </div>
            </div>

            <div className="stat-card surface">
              <span className="stat-icon peach">
                <ShieldCheck size={22} />
              </span>
              <div>
                <span className="stat-label">Yetkili Yöneticiler</span>
                <div className="stat-value">{adminCount}</div>
                <span className="stat-note">Admin yetkisine sahip</span>
              </div>
            </div>

            <div className="stat-card surface">
              <span className="stat-icon lavender">
                <UserCheck size={22} />
              </span>
              <div>
                <span className="stat-label">Aktif Kulüp Üyeleri</span>
                <div className="stat-value">{regularCount}</div>
                <span className="stat-note">Etkinlik katılımcısı</span>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="members-controls surface">
            <div className="members-search-wrap">
              <Search size={17} />
              <input
                type="text"
                placeholder="İsim, e-posta, öğrenci no veya bölüm ara..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
              {memberSearch && (
                <button className="clear-search" onClick={() => setMemberSearch("")}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="members-filter-pills">
              <button
                className={`filter-pill ${filterRole === "all" ? "active" : ""}`}
                onClick={() => setFilterRole("all")}
              >
                Tümü ({totalMembers})
              </button>
              <button
                className={`filter-pill ${filterRole === "admin" ? "active" : ""}`}
                onClick={() => setFilterRole("admin")}
              >
                <ShieldCheck size={14} />
                Yöneticiler ({adminCount})
              </button>
              <button
                className={`filter-pill ${filterRole === "member" ? "active" : ""}`}
                onClick={() => setFilterRole("member")}
              >
                <Users size={14} />
                Üyeler ({regularCount})
              </button>
            </div>
          </div>

          {/* Member Cards Grid */}
          <div className="members-grid">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const isMe = member.id === currentUserId || member.uid === currentUserId;
                const isAdmin = member.role === "admin";
                const initials = (member.name || member.email || "Üye")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("");

                return (
                  <article className="member-item-card surface" key={member.id}>
                    <div className="member-card-header">
                      <div className="avatar member-avatar">{initials}</div>
                      <div className="member-info-main">
                        <div className="member-name-row">
                          <h3>{member.name}</h3>
                          {isMe && <span className="me-badge">Sen</span>}
                        </div>
                        <span className="member-card-no">{member.memberNo}</span>
                      </div>

                      <span className={`member-role-badge ${isAdmin ? "admin" : "member"}`}>
                        {isAdmin ? (
                          <>
                            <ShieldCheck size={13} /> Yönetici
                          </>
                        ) : (
                          <>
                            <User size={13} /> Üye
                          </>
                        )}
                      </span>
                    </div>

                    <div className="member-card-details">
                      <div className="detail-row">
                        <GraduationCap size={15} />
                        <span>
                          <strong>{member.department}</strong>
                          <small>{member.faculty}</small>
                        </span>
                      </div>

                      <div className="detail-row">
                        <Mail size={15} />
                        <span>{member.email}</span>
                      </div>

                      <div className="detail-meta-group">
                        <div>
                          <span>ÖĞRENCİ NO</span>
                          <strong>{member.studentNo}</strong>
                        </div>
                        <div>
                          <span>KAYIT TARİHİ</span>
                          <strong>{member.joinedDate}</strong>
                        </div>
                        <div>
                          <span>DURUM</span>
                          <strong className="status-active">● {member.status}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="member-card-actions">
                      <button
                        className={`role-toggle-btn ${isAdmin ? "revoke" : "grant"}`}
                        onClick={() => onToggleAdmin(member.id)}
                        title={
                          isAdmin
                            ? "Yöneticilik yetkisini kaldırıp normal üye yap"
                            : "Kullanıcıya kulüp yönetici yetkisi ver"
                        }
                      >
                        {isAdmin ? (
                          <>
                            <ShieldAlert size={15} />
                            <span>Admin Yetkisini Kaldır</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={15} />
                            <span>Admin Yetkisi Ver</span>
                          </>
                        )}
                      </button>

                      {!isMe && (
                        <button
                          className="delete-member-btn"
                          onClick={() => onDeleteMember(member.id, member.name)}
                          title="Üye kaydını sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-state surface full-width">
                <Users size={36} />
                <h2>Aramanıza Uygun Üye Bulunamadı</h2>
                <p>Farklı bir arama terimi deneyebilir veya filtreyi temizleyebilirsiniz.</p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setMemberSearch("");
                    setFilterRole("all");
                  }}
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= TAB 2: EVENTS & ATTENDEES ================= */}
      {activeTab === "events" && (
        <div className="admin-events-section">
          {/* Event Stats */}
          <div className="members-stats-grid">
            <div className="stat-card surface">
              <span className="stat-icon mint">
                <CalendarDays size={22} />
              </span>
              <div>
                <span className="stat-label">Yayındaki Etkinlikler</span>
                <div className="stat-value">{events.length}</div>
                <span className="stat-note">Planlanan kulüp etkinliği</span>
              </div>
            </div>

            <div className="stat-card surface">
              <span className="stat-icon peach">
                <Users size={22} />
              </span>
              <div>
                <span className="stat-label">Toplam Katılım Kaydı</span>
                <div className="stat-value">{totalEnrollments}</div>
                <span className="stat-note">Öğrenci rezervasyonu</span>
              </div>
            </div>

            <div className="stat-card surface">
              <span className="stat-icon lavender">
                <Check size={22} />
              </span>
              <div>
                <span className="stat-label">Katılım Oranı</span>
                <div className="stat-value">
                  %{totalMembers > 0 ? Math.round((totalEnrollments / totalMembers) * 100) : 0}
                </div>
                <span className="stat-note">Üye katılım yoğunluğu</span>
              </div>
            </div>
          </div>

          {/* Events List Grid */}
          <div className="admin-events-grid">
            {events.map((event) => {
              const attendees = getAttendeesForEvent(event.id);
              const count = attendees.length;

              return (
                <article className="admin-event-card surface" key={event.id}>
                  <div className="admin-event-card-top">
                    <span className={`category ${event.color}`}>{event.category}</span>
                    <span className="admin-event-date-pill">
                      <strong>{event.day}</strong> {event.month}
                    </span>
                  </div>

                  <h3 className="admin-event-title">{event.title}</h3>
                  <p className="admin-event-desc">{event.description}</p>

                  <div className="admin-event-meta-list">
                    <div>
                      <CalendarDays size={14} />
                      <span>{event.date}</span>
                    </div>
                    <div>
                      <Clock3 size={14} />
                      <span>{event.time}</span>
                    </div>
                    <div>
                      <MapPin size={14} />
                      <span>{event.place}</span>
                    </div>
                  </div>

                  {/* Attendees Progress / Count Bar */}
                  <div className="admin-attendees-bar-box">
                    <div className="attendees-bar-header">
                      <span>Kayıtlı Kulüp Üyeleri</span>
                      <strong>
                        {count} / {event.people} Kişi
                      </strong>
                    </div>
                    <div className="attendees-progress-track">
                      <div
                        className="attendees-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.round((count / event.people) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="admin-event-actions">
                    <button
                      className="primary-button attendee-list-btn"
                      onClick={() => setSelectedEventForAttendees(event)}
                    >
                      <Eye size={15} />
                      <span>Katılımcı Listesi ({count})</span>
                    </button>

                    <button
                      className="delete-member-btn"
                      onClick={() => onDeleteEvent(event.id, event.title)}
                      title="Etkinliği sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: ANNOUNCEMENTS MANAGEMENT ================= */}
      {activeTab === "announcements" && (
        <div className="admin-announcements-section">
          <div className="admin-announcements-grid">
            {announcements.map((ann, idx) => (
              <article className="surface admin-ann-card" key={ann.id || ann.title + idx}>
                <div className="admin-ann-header">
                  <span className={`news-icon ${ann.tone}`}>
                    {ann.type === "ÜYELİK" ? (
                      <Sparkles size={18} />
                    ) : ann.type === "FIRSATLAR" ? (
                      <Globe2 size={18} />
                    ) : (
                      <Sprout size={18} />
                    )}
                  </span>
                  <div className="admin-ann-meta">
                    <span className="section-kicker">
                      {ann.type} · {ann.date}
                    </span>
                    <h3>{ann.title}</h3>
                  </div>

                  <button
                    className="delete-member-btn"
                    onClick={() => onDeleteAnnouncement(ann.id, ann.title)}
                    title="Duyuruyu sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <p className="admin-ann-body">{ann.text}</p>
                <div className="admin-ann-status">
                  <span className="status-dot-active">● Yayında</span>
                  <small>Tüm kulüp üyelerine açık</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD MEMBER ================= */}
      {showAddMemberModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setShowAddMemberModal(false)}
        >
          <div className="modal members-modal" role="dialog" aria-modal="true">
            <button
              className="modal-close icon-button"
              onClick={() => setShowAddMemberModal(false)}
              aria-label="Pencereyi kapat"
            >
              <X size={20} />
            </button>

            <div className="modal-content text-modal">
              <span className="news-icon mint">
                <UserPlus size={24} />
              </span>
              <h2>Yeni Kulüp Üyesi Kaydet</h2>
              {addMemberError && (
                <div className="auth-error-banner" style={{ margin: "14px 0" }} role="alert">
                  <span>{addMemberError}</span>
                </div>
              )}

              <form className="add-member-form" onSubmit={handleAddMemberSubmit}>
                <div className="form-grid">
                  <label>
                    Ad Soyad *
                    <input
                      type="text"
                      placeholder="Ad Soyad"
                      value={newMemberForm.name}
                      onChange={(e) =>
                        setNewMemberForm({ ...newMemberForm, name: e.target.value })
                      }
                      required
                    />
                  </label>

                  <label>
                    Öğrenci Numarası *
                    <input
                      type="text"
                      placeholder="Örn: 230405012"
                      value={newMemberForm.studentNo}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          studentNo: e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Öğrenci E-postası *
                    <input
                      type="email"
                      placeholder="ad.soyad@ohu.edu.tr"
                      value={newMemberForm.email}
                      onChange={(e) =>
                        setNewMemberForm({ ...newMemberForm, email: e.target.value })
                      }
                      required
                    />
                  </label>

                  <label>
                    Telefon
                    <input
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      value={newMemberForm.phone}
                      onChange={(e) =>
                        setNewMemberForm({ ...newMemberForm, phone: e.target.value })
                      }
                    />
                  </label>
                </div>

                <label className="modal-field-full">
                  Fakülte *
                  <select
                    value={newMemberForm.faculty}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, faculty: e.target.value })
                    }
                    className="modal-select"
                  >
                    {NOHU_FACULTIES.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modal-field-full">
                  Bölüm *
                  <input
                    type="text"
                    placeholder="Örn: Bitkisel Üretim ve Teknolojileri"
                    value={newMemberForm.department}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, department: e.target.value })
                    }
                    required
                  />
                </label>

                <label className="modal-field-full">
                  Başlangıç Rolü
                  <select
                    value={newMemberForm.role}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, role: e.target.value })
                    }
                    className="modal-select"
                  >
                    <option value="member">Standart Üye</option>
                    <option value="admin">Kulüp Yöneticisi (Admin)</option>
                  </select>
                </label>

                <div className="form-footer">
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => setShowAddMemberModal(false)}
                  >
                    Vazgeç
                  </button>
                  <button type="submit" className="primary-button">
                    <Check size={16} />
                    <span>Üyeyi Kaydet</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD EVENT ================= */}
      {showAddEventModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setShowAddEventModal(false)}
        >
          <div className="modal members-modal" role="dialog" aria-modal="true">
            <button
              className="modal-close icon-button"
              onClick={() => setShowAddEventModal(false)}
              aria-label="Pencereyi kapat"
            >
              <X size={20} />
            </button>

            <div className="modal-content text-modal">
              <span className="news-icon peach">
                <CalendarPlus size={24} />
              </span>
              <h2>Yeni Kulüp Etkinliği Başlat</h2>
              <p className="muted">
                NÖHÜ öğrencilerine yönelik gezi, atölye veya buluşma organize edin.
              </p>

              <form className="add-member-form" onSubmit={handleAddEventSubmit}>
                <label className="modal-field-full">
                  Etkinlik Başlığı *
                  <input
                    type="text"
                    placeholder="Örn: Toprak Analizi ve Tarımsal İnovasyon Çalıştayı"
                    value={newEventForm.title}
                    onChange={(e) =>
                      setNewEventForm({ ...newEventForm, title: e.target.value })
                    }
                    required
                  />
                </label>

                <div className="form-grid">
                  <label>
                    Kategori *
                    <select
                      value={newEventForm.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setNewEventForm((prev) => ({
                          ...prev,
                          category: newCat,
                          image: getEventStockImage(newCat, prev.title),
                        }));
                      }}
                      className="modal-select"
                    >
                      {EVENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Renk Teması
                    <select
                      value={newEventForm.color}
                      onChange={(e) =>
                        setNewEventForm({ ...newEventForm, color: e.target.value })
                      }
                      className="modal-select"
                    >
                      {EVENT_COLORS.map((col) => (
                        <option key={col.value} value={col.value}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Stock Image Selection / Preview Section */}
                <div className="modal-field-full event-image-picker-wrap">
                  <div className="image-picker-header">
                    <label>
                      <ImageIcon size={14} />
                      <span>Etkinlik Kapak Görseli</span>
                    </label>
                    <span className="image-auto-badge">✨ Otomatik Stok Görsel Aktif</span>
                  </div>

                  <div className="image-preview-card">
                    <img
                      src={
                        newEventForm.image ||
                        getEventStockImage(newEventForm.category, newEventForm.title)
                      }
                      alt="Kapak Görseli Önizleme"
                      className="image-preview-display"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getEventStockImage(
                          newEventForm.category,
                          newEventForm.title
                        );
                      }}
                    />
                    <div className="image-preview-tag">
                      <span>{newEventForm.category} Teması</span>
                    </div>
                  </div>

                  <div className="stock-thumbs-box">
                    <div className="stock-thumbs-title">
                      <span>Önerilen Stok Fotoğraflar (Seçmek için tıklayın):</span>
                    </div>
                    <div className="stock-thumbs-row">
                      {(
                        STOCK_IMAGES_BY_CATEGORY[newEventForm.category] ||
                        STOCK_IMAGES_BY_CATEGORY["Atölye"]
                      ).map((stock) => {
                        const currentUrl =
                          newEventForm.image ||
                          getEventStockImage(newEventForm.category, newEventForm.title);
                        const isSelected = currentUrl === stock.url;
                        return (
                          <button
                            type="button"
                            key={stock.id}
                            className={`stock-thumb-card ${isSelected ? "active" : ""}`}
                            onClick={() =>
                              setNewEventForm((prev) => ({ ...prev, image: stock.url }))
                            }
                            title={stock.label}
                          >
                            <img src={stock.url} alt={stock.label} />
                            <span className="stock-thumb-title">{stock.label}</span>
                            {isSelected && <span className="stock-thumb-check">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <label>
                    Tarih Metni (Örn: 28 Ekim 2026) *
                    <input
                      type="text"
                      value={newEventForm.date}
                      onChange={(e) =>
                        setNewEventForm({ ...newEventForm, date: e.target.value })
                      }
                      required
                    />
                  </label>

                  <label>
                    Saat Aralığı (Örn: 10.00 – 16.00) *
                    <input
                      type="text"
                      value={newEventForm.time}
                      onChange={(e) =>
                        setNewEventForm({ ...newEventForm, time: e.target.value })
                      }
                      required
                    />
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Gün Rozeti (Örn: 28)
                    <input
                      type="text"
                      maxLength={2}
                      value={newEventForm.day}
                      onChange={(e) =>
                        setNewEventForm({ ...newEventForm, day: e.target.value })
                      }
                      required
                    />
                  </label>

                  <label>
                    Ay Kısaltması (Örn: EKİ)
                    <input
                      type="text"
                      maxLength={4}
                      value={newEventForm.month}
                      onChange={(e) =>
                        setNewEventForm({ ...newEventForm, month: e.target.value.toUpperCase() })
                      }
                      required
                    />
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Konum / Yer *
                    <input
                      type="text"
                      placeholder="Örn: NÖHÜ Tarım Fakültesi Amfi 1"
                      value={newEventForm.place}
                      onChange={(e) =>
                        setNewEventForm({ ...newEventForm, place: e.target.value })
                      }
                      required
                    />
                  </label>

                  <label>
                    Kontenjan (Kişi) *
                    <input
                      type="number"
                      min={5}
                      max={500}
                      value={newEventForm.people}
                      onChange={(e) =>
                        setNewEventForm({ ...newEventForm, people: e.target.value })
                      }
                      required
                    />
                  </label>
                </div>

                <label className="modal-field-full">
                  Etkinlik Açıklaması *
                  <textarea
                    rows={3}
                    placeholder="Etkinlik hakkında detaylı bilgi, kazanımlar ve katılım şartları..."
                    value={newEventForm.description}
                    onChange={(e) =>
                      setNewEventForm({ ...newEventForm, description: e.target.value })
                    }
                    className="modal-textarea"
                    required
                  />
                </label>

                <div className="form-footer">
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => setShowAddEventModal(false)}
                  >
                    Vazgeç
                  </button>
                  <button type="submit" className="primary-button">
                    <Check size={16} />
                    <span>Etkinliği Başlat</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EVENT ATTENDEES LIST ================= */}
      {selectedEventForAttendees && (
        <div
          className="modal-backdrop"
          onClick={(e) =>
            e.target === e.currentTarget && setSelectedEventForAttendees(null)
          }
        >
          <div className="modal members-modal attendees-modal" role="dialog" aria-modal="true">
            <button
              className="modal-close icon-button"
              onClick={() => setSelectedEventForAttendees(null)}
              aria-label="Pencereyi kapat"
            >
              <X size={20} />
            </button>

            <div className="modal-content text-modal">
              <span className="news-icon lavender">
                <Users size={24} />
              </span>
              <h2>Etkinlik Katılımcı Listesi</h2>
              <div className="attendee-modal-event-strip">
                <strong>{selectedEventForAttendees.title}</strong>
                <span className="muted">
                  {selectedEventForAttendees.date} · {selectedEventForAttendees.place}
                </span>
              </div>

              {/* Attendee list */}
              {(() => {
                const attendees = getAttendeesForEvent(selectedEventForAttendees.id);
                if (attendees.length === 0) {
                  return (
                    <div className="empty-state attendees-empty">
                      <CalendarDays size={32} />
                      <h3>Henüz Katılım Kaydı Yok</h3>
                      <p>
                        Kulüp üyeleri Etkinlikler sayfasından "Etkinliğe katıl" düğmesine
                        bastığında burada isim, öğrenci no ve iletişim bilgileriyle listelenecektir.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="attendees-table-wrap">
                    <div className="attendees-meta-summary">
                      <div className="attendees-summary-text">
                        <span>
                          Toplam Kayıtlı Üye: <strong>{attendees.length} kişi</strong>
                        </span>
                        <span>·</span>
                        <span>
                          Kalan Kontenjan:{" "}
                          <strong>{Math.max(0, selectedEventForAttendees.people - attendees.length)} kişi</strong>
                        </span>
                      </div>
                      <div className="attendees-export-actions">
                        <button
                          type="button"
                          className="export-btn export-excel"
                          onClick={() => exportAttendeesToExcel(selectedEventForAttendees, attendees)}
                          title="Katılımcı listesini Excel (CSV) olarak indir"
                        >
                          <Download size={14} />
                          <span>Excel İndir</span>
                        </button>
                        <button
                          type="button"
                          className="export-btn export-pdf"
                          onClick={() => exportAttendeesToPdf(selectedEventForAttendees, attendees)}
                          title="Katılımcı listesini PDF olarak kaydet / yazdır"
                        >
                          <FileText size={14} />
                          <span>PDF İndir</span>
                        </button>
                      </div>
                    </div>

                    <div className="attendee-cards-list">
                      {attendees.map((attendee) => {
                        const initials = (attendee.name || attendee.email || "Katılımcı")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("");

                        return (
                          <div className="attendee-card-item surface" key={attendee.id}>
                            <div className="avatar attendee-avatar">{initials}</div>
                            <div className="attendee-info">
                              <div className="attendee-top-row">
                                <strong>{attendee.name}</strong>
                                <span className={`member-role-badge ${attendee.role}`}>
                                  {attendee.role === "admin" ? "Yönetici" : "Üye"}
                                </span>
                              </div>
                              <div className="attendee-sub-row">
                                <span>No: {attendee.studentNo}</span>
                                <span>·</span>
                                <span>{attendee.department}</span>
                              </div>
                              <div className="attendee-contact-row">
                                <span>{attendee.email}</span>
                                {attendee.phone && attendee.phone !== "Belirtilmedi" && (
                                  <>
                                    <span>·</span>
                                    <span>{attendee.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <button
                              className="remove-attendee-btn"
                              onClick={() =>
                                onRemoveAttendee(
                                  selectedEventForAttendees.id,
                                  attendee.id,
                                )
                              }
                              title="Bu üyeyi etkinlik katılımcı listesinden çıkar"
                            >
                              <X size={15} />
                              <span>Kaydı İptal Et</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="form-footer">
                <button
                  type="button"
                  className="primary-button full-width"
                  onClick={() => setSelectedEventForAttendees(null)}
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD ANNOUNCEMENT ================= */}
      {showAddAnnModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setShowAddAnnModal(false)}
        >
          <div className="modal members-modal" role="dialog" aria-modal="true">
            <button
              className="modal-close icon-button"
              onClick={() => setShowAddAnnModal(false)}
              aria-label="Pencereyi kapat"
            >
              <X size={20} />
            </button>

            <div className="modal-content text-modal">
              <span className="news-icon mint">
                <Megaphone size={24} />
              </span>
              <h2>Yeni Kulüp Duyurusu Yayınla</h2>
              <p className="muted">
                Tüm kulüp üyelerine ana sayfada ve duyurular sekmesinde gösterilecek duyuru oluşturun.
              </p>

              <form className="add-member-form" onSubmit={handleAddAnnSubmit}>
                <label className="modal-field-full">
                  Duyuru Başlığı *
                  <input
                    type="text"
                    placeholder="Örn: 2026 Güz Dönemi Uluslararası Staj Başvuruları Başladı"
                    value={newAnnForm.title}
                    onChange={(e) =>
                      setNewAnnForm({ ...newAnnForm, title: e.target.value })
                    }
                    required
                  />
                </label>

                <div className="form-grid">
                  <label>
                    Kategori / Tür *
                    <select
                      value={newAnnForm.type}
                      onChange={(e) =>
                        setNewAnnForm({ ...newAnnForm, type: e.target.value })
                      }
                      className="modal-select"
                    >
                      {ANNOUNCEMENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Vurgu Rengi
                    <select
                      value={newAnnForm.tone}
                      onChange={(e) =>
                        setNewAnnForm({ ...newAnnForm, tone: e.target.value })
                      }
                      className="modal-select"
                    >
                      {ANNOUNCEMENT_TONES.map((tn) => (
                        <option key={tn.value} value={tn.value}>
                          {tn.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="modal-field-full">
                  Duyuru İçeriği *
                  <textarea
                    rows={4}
                    placeholder="Duyuru metni, önemli tarihler, başvuru detayları ve bağlantılar..."
                    value={newAnnForm.text}
                    onChange={(e) =>
                      setNewAnnForm({ ...newAnnForm, text: e.target.value })
                    }
                    className="modal-textarea"
                    required
                  />
                </label>

                <div className="form-footer">
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => setShowAddAnnModal(false)}
                  >
                    Vazgeç
                  </button>
                  <button type="submit" className="primary-button">
                    <Check size={16} />
                    <span>Duyuruyu Yayınla</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
