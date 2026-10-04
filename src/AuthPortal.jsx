import React, { useState } from "react";
import {
  ArrowRight,
  Check,
  GraduationCap,
  Globe2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Moon,
  User,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import "./auth.css";
import { normalizeStudentNo, isFeritUser } from "./utils.js";
import {
  validatePassword,
  validateOhuEmail,
  registerWithFirebase,
  loginWithFirebase,
  getFirebaseErrorMessage,
} from "./services/authService.js";
import { isFirebaseConfigured } from "./firebase.js";

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

export default function AuthPortal({
  onRegister,
  onLogin,
  existingMembers = [],
  theme,
  setTheme,
}) {
  const [tab, setTab] = useState("register"); // 'register' | 'login'
  const [error, setError] = useState("");

  // Visibility toggles for password fields
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegPasswordConfirm, setShowRegPasswordConfirm] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    studentNo: "",
    faculty: NOHU_FACULTIES[0],
    department: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    consent: true,
  });

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleForceResetStudentNo = () => {
    try {
      const norm = normalizeStudentNo(regForm.studentNo);
      let stored = [];
      try {
        stored = JSON.parse(localStorage.getItem("iaas_members")) || [];
      } catch {}
      const filtered = Array.isArray(stored)
        ? stored.filter((m) => normalizeStudentNo(m.studentNo) !== norm)
        : [];
      localStorage.setItem("iaas_members", JSON.stringify(filtered));
      setError("");
      setTimeout(() => {
        const btn = document.querySelector(".auth-submit-btn");
        btn?.click();
      }, 50);
    } catch (e) {
      console.warn("Öğrenci numarası sıfırlama hatası:", e);
    }
  };

  const handleClearLocalCache = () => {
    try {
      localStorage.removeItem("iaas_members");
      localStorage.removeItem("iaas_current_user_id");
      setError("");
      alert(
        "Yerel tarayıcı önbelleği başarıyla temizlendi. Sayfa yenileniyor, temiz bir şekilde kayıt veya giriş yapabilirsiniz."
      );
      window.location.reload();
    } catch {}
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !regForm.name.trim() ||
      !regForm.email.trim() ||
      !regForm.studentNo.trim() ||
      !regForm.department.trim() ||
      !regForm.password.trim() ||
      !regForm.passwordConfirm.trim()
    ) {
      setError("Lütfen zorunlu alanları (Ad Soyad, E-posta, Öğrenci No, Bölüm, Şifre) eksiksiz doldurun.");
      return;
    }

    const emailCheck = validateOhuEmail(regForm.email);
    if (!emailCheck.valid) {
      setError(emailCheck.message);
      return;
    }

    const pwCheck = validatePassword(regForm.password);
    if (!pwCheck.valid) {
      setError(pwCheck.message);
      return;
    }

    if (regForm.password !== regForm.passwordConfirm) {
      setError("Girdiğiniz şifreler birbiriyle eşleşmiyor. Lütfen şifrenizi kontrol edin.");
      return;
    }

    if (!regForm.consent) {
      setError("Kulüp tüzüğünü ve katılım şartlarını onaylamanız gerekmektedir.");
      return;
    }

    // Consolidate all known members from both props and localStorage
    let allKnownMembers = Array.isArray(existingMembers) ? [...existingMembers] : [];
    try {
      const stored = JSON.parse(localStorage.getItem("iaas_members"));
      if (Array.isArray(stored)) {
        const knownIds = new Set(allKnownMembers.map((m) => String(m.id)));
        for (const sm of stored) {
          if (!knownIds.has(String(sm.id))) {
            allKnownMembers.push(sm);
          }
        }
      }
    } catch {}

    const cleanEmail = regForm.email.trim().toLowerCase();
    const isFerit = isFeritUser({
      email: cleanEmail,
      studentNo: regForm.studentNo,
      name: regForm.name,
    });

    // Check if email already exists locally
    if (allKnownMembers.some((m) => m.email && m.email.trim().toLowerCase() === cleanEmail)) {
      setError("Bu e-posta adresiyle kayıtlı bir üye zaten mevcut. Lütfen giriş yapın.");
      return;
    }

    // Check if student number already exists with strict normalization
    const normalizedRegStudentNo = normalizeStudentNo(regForm.studentNo);
    const existingWithSameStudentNo = normalizedRegStudentNo
      ? allKnownMembers.find(
          (m) => m.studentNo && normalizeStudentNo(m.studentNo) === normalizedRegStudentNo
        )
      : null;

    if (existingWithSameStudentNo) {
      const existingEmail = (existingWithSameStudentNo.email || "").trim().toLowerCase();
      const isSameUser =
        existingEmail === cleanEmail ||
        (isFerit && isFeritUser(existingWithSameStudentNo));

      if (!isSameUser) {
        setError(
          "Bu öğrenci numarası ile kayıtlı bir üye zaten mevcut. Lütfen bilgilerinizi kontrol edin veya giriş yapın."
        );
        return;
      }
    }

    const nextIdNumber = allKnownMembers.length + 1;
    const memberNo = `IAAS-NÖHÜ-${String(nextIdNumber).padStart(3, "0")}`;

    // 1. Firebase Etkinse Firebase Auth ve Firestore'a Kaydet
    if (isFirebaseConfigured()) {
      try {
        setLoading(true);
        const fbUserData = await registerWithFirebase({
          email: cleanEmail,
          password: regForm.password.trim(),
          name: regForm.name.trim(),
          studentNo: regForm.studentNo.trim(),
          faculty: regForm.faculty,
          department: regForm.department.trim(),
          phone: regForm.phone.trim(),
        });

        const newMember = {
          ...fbUserData,
          memberNo,
          password: regForm.password.trim(),
        };

        onRegister(newMember);
        return;
      } catch (err) {
        console.error("Firebase registration error:", err);
        setError(getFirebaseErrorMessage(err));
        return;
      } finally {
        setLoading(false);
      }
    }

    // 2. Firebase Yapılandırılmamışsa veya Yerel Modda İlerliyorsa
    const newMember = {
      id: `mem-${Date.now()}`,
      memberNo,
      name: regForm.name.trim(),
      email: regForm.email.trim(),
      studentNo: regForm.studentNo.trim(),
      faculty: regForm.faculty,
      department: regForm.department.trim(),
      phone: regForm.phone.trim() || "Belirtilmedi",
      password: regForm.password.trim(),
      role: isFerit ? "admin" : "member",
      status: "Aktif",
      joinedDate: new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    };

    onRegister(newMember);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const rawId = loginForm.identifier.trim();
    const cleanId = rawId.toLowerCase();
    const enteredPassword = (loginForm.password || "").trim();

    if (!rawId) {
      setError("Lütfen e-posta adresinizi veya öğrenci numaranızı girin.");
      return;
    }

    if (!enteredPassword) {
      setError("Lütfen hesabınıza ait şifreyi girin.");
      return;
    }

    // 1. Firebase Etkinse Firebase Auth ile Giriş Dene
    if (isFirebaseConfigured()) {
      try {
        setLoading(true);
        const loggedInUser = await loginWithFirebase(rawId, enteredPassword);
        onLogin(loggedInUser);
        return;
      } catch (err) {
        console.warn("Firebase login attempt error:", err);
        // Eğer Firebase'de bulunamazsa yerel test hesaplarını da kontrol et
        const isNotFound =
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-credential" ||
          err.code === "auth/wrong-password";

        if (isNotFound) {
          let allKnownMembers = Array.isArray(existingMembers) ? [...existingMembers] : [];
          try {
            const stored = JSON.parse(localStorage.getItem("iaas_members"));
            if (Array.isArray(stored)) {
              for (const sm of stored) {
                if (!allKnownMembers.some((m) => String(m.id) === String(sm.id))) {
                  allKnownMembers.push(sm);
                }
              }
            }
          } catch {}

          const normId = normalizeStudentNo(rawId);
          const found = allKnownMembers.find((m) => {
            const emailMatch = m.email && m.email.trim().toLowerCase() === cleanId;
            const nameMatch = m.name && m.name.trim().toLowerCase() === cleanId;
            const sNoMatch = normId && m.studentNo && normalizeStudentNo(m.studentNo) === normId;
            return emailMatch || nameMatch || sNoMatch;
          });

          if (found) {
            const expectedPassword = found.password || "123456";
            if (enteredPassword === expectedPassword) {
              onLogin(found);
              return;
            } else {
              setError("Girdiğiniz şifre hatalı. Lütfen kontrol edip tekrar deneyin.");
              return;
            }
          }
        }

        setError(getFirebaseErrorMessage(err));
        return;
      } finally {
        setLoading(false);
      }
    }

    // 2. Yerel Modda Giriş
    let allKnownMembers = Array.isArray(existingMembers) ? [...existingMembers] : [];
    try {
      const stored = JSON.parse(localStorage.getItem("iaas_members"));
      if (Array.isArray(stored)) {
        const knownIds = new Set(allKnownMembers.map((m) => String(m.id)));
        for (const sm of stored) {
          if (!knownIds.has(String(sm.id))) {
            allKnownMembers.push(sm);
          }
        }
      }
    } catch {}

    const normId = normalizeStudentNo(rawId);
    const found = allKnownMembers.find((m) => {
      const emailMatch = m.email && m.email.trim().toLowerCase() === cleanId;
      const nameMatch = m.name && m.name.trim().toLowerCase() === cleanId;
      const sNoMatch =
        normId &&
        m.studentNo &&
        normalizeStudentNo(m.studentNo) === normId;
      return emailMatch || nameMatch || sNoMatch;
    });

    if (found) {
      const expectedPassword = found.password || "123456";

      if (enteredPassword !== expectedPassword) {
        setError("Girdiğiniz şifre hatalı. Lütfen kontrol edip tekrar deneyin.");
        return;
      }

      onLogin(found);
    } else {
      setError(
        "Girdiğiniz bilgilerle eşleşen bir üye kaydı bulunamadı. Lütfen bilgilerinizi kontrol edin veya yeni üye olun.",
      );
    }
  };

  return (
    <div className="auth-portal" data-theme={theme}>
      {/* Top Navbar */}
      <header className="auth-topbar">
        <div className="auth-brand">
          <div className="auth-brand-symbol">
            <Sprout size={26} strokeWidth={2} />
          </div>
          <div>
            <strong>
              IAAS<span>NÖHÜ</span>
            </strong>
            <small>Niğde Ömer Halisdemir Üniversitesi</small>
          </div>
        </div>

        <div className="auth-top-actions">
          <span className="auth-tag">Resmi Öğrenci Kulübü</span>
          <button
            className="auth-theme-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Temayı Değiştir"
            aria-label="Temayı Değiştir"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Main Split Content */}
      <main className="auth-container">
        {/* Left Side: Welcoming & Club Value Proposition */}
        <section className="auth-hero-panel">
          <div className="auth-hero-badge">
            <Sparkles size={15} />
            <span>KULÜP ÜYELİK & YÖNETİM PORTALI</span>
          </div>

          <h1>
            IAAS NÖHÜ'ye <br />
            <span>Hoş Geldin.</span>
          </h1>

          <p className="auth-hero-desc">
            IAAS Niğde Ömer Halisdemir Üniversitesi öğrenci kulübüne katılın;
            teknik geziler, tarımsal inovasyon atölyeleri ve 50'den fazla ülkede
            uluslararası staj fırsatlarıyla üniversite hayatınıza değer katın.
          </p>

          <div className="auth-features">
            <div className="auth-feature-item">
              <div className="auth-feature-icon mint">
                <Sprout size={20} />
              </div>
              <div>
                <strong>Uygulamalı Saha ve Teknik Geziler</strong>
                <p>Niğde ve çevre illerdeki modern tarım işletmeleri ve laboratuvar ziyaretleri.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon peach">
                <Globe2 size={20} />
              </div>
              <div>
                <strong>Uluslararası ExPro Değişim Programı</strong>
                <p>IAAS global ağıyla yurt dışında tarım ve çevre alanlarında staj ve eğitim imkânı.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon lavender">
                <Users size={20} />
              </div>
              <div>
                <strong>Disiplinlerarası Üniversite Topluluğu</strong>
                <p>Tarım, mühendislik ve yaşam bilimleri öğrencileriyle ortak projeler ve güçlü network.</p>
              </div>
            </div>
          </div>

          <div className="auth-quote">
            <p>
              "Sadece bir öğrenci kulübü değil; geleceğin sürdürülebilir tarım
              liderlerinin buluşma noktası."
            </p>
            <span>IAAS NÖHÜ Yönetim Kurulu</span>
          </div>
        </section>

        {/* Right Side: Auth Form Card */}
        <section className="auth-card-panel">
          <div className="auth-tabs" role="tablist">
            <button
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => {
                setTab("register");
                setError("");
              }}
              role="tab"
              aria-selected={tab === "register"}
            >
              <Sparkles size={15} />
              <span>Kulübe Üye Ol</span>
            </button>
            <button
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => {
                setTab("login");
                setError("");
              }}
              role="tab"
              aria-selected={tab === "login"}
            >
              <Lock size={15} />
              <span>Giriş Yap</span>
            </button>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <div>{error}</div>
              {error.includes("öğrenci numarası ile kayıtlı") && tab === "register" && (
                <div style={{ marginTop: "8px" }}>
                  <button
                    type="button"
                    className="auth-reset-student-btn"
                    onClick={handleForceResetStudentNo}
                  >
                    Numarayı Sıfırla ve Kaydı Tamamla
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "register" ? (
            <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
              <div className="auth-form-intro">
                <h2>Aramıza Katıl</h2>
                <p>Bilgilerini doldurarak IAAS NÖHÜ dijital üye kartını anında oluştur.</p>
              </div>

              <div className="auth-grid">
                <label>
                  <span>Ad Soyad *</span>
                  <div className="auth-input-wrap">
                    <User size={16} />
                    <input
                      type="text"
                      placeholder="Örn: Ahmet Yılmaz"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Öğrenci Numarası *</span>
                  <div className="auth-input-wrap">
                    <GraduationCap size={16} />
                    <input
                      type="text"
                      placeholder="Örn: 230405012"
                      value={regForm.studentNo}
                      onChange={(e) =>
                        setRegForm({
                          ...regForm,
                          studentNo: e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                        })
                      }
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Öğrenci E-postası (@ohu.edu.tr) *</span>
                  <div className="auth-input-wrap">
                    <Mail size={16} />
                    <input
                      type="email"
                      placeholder="ad.soyad@ohu.edu.tr"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Telefon</span>
                  <div className="auth-input-wrap">
                    <Phone size={16} />
                    <input
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    />
                  </div>
                </label>
              </div>

              <label className="auth-field-full">
                <span>Fakülte *</span>
                <select
                  value={regForm.faculty}
                  onChange={(e) => setRegForm({ ...regForm, faculty: e.target.value })}
                  className="auth-select"
                >
                  {NOHU_FACULTIES.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>
              </label>

              <label className="auth-field-full">
                <span>Bölüm *</span>
                <input
                  type="text"
                  placeholder="Örn: Bitkisel Üretim ve Teknolojileri / Çevre Mühendisliği"
                  value={regForm.department}
                  onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                  className="auth-input-standalone"
                  required
                />
              </label>

              <div className="auth-grid">
                <label>
                  <span>Şifre Belirle *</span>
                  <div className="auth-input-wrap">
                    <Lock size={16} />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="6 – 12 karakter"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      required
                      minLength={6}
                      maxLength={12}
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      tabIndex="-1"
                      aria-label={showRegPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <label>
                  <span>Şifre Tekrar *</span>
                  <div className="auth-input-wrap">
                    <Lock size={16} />
                    <input
                      type={showRegPasswordConfirm ? "text" : "password"}
                      placeholder="Şifrenizi tekrar girin"
                      value={regForm.passwordConfirm}
                      onChange={(e) => setRegForm({ ...regForm, passwordConfirm: e.target.value })}
                      required
                      minLength={6}
                      maxLength={12}
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowRegPasswordConfirm(!showRegPasswordConfirm)}
                      tabIndex="-1"
                      aria-label={showRegPasswordConfirm ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showRegPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
              </div>

              <label className="auth-checkbox-label consent">
                <input
                  type="checkbox"
                  checked={regForm.consent}
                  onChange={(e) => setRegForm({ ...regForm, consent: e.target.checked })}
                  required
                />
                <span>
                  IAAS NÖHÜ kulüp tüzüğünü ve etkinlik kurallarını kabul ediyorum.
                </span>
              </label>

              <button className="auth-submit-btn" type="submit" disabled={loading}>
                <span>{loading ? "İşlem yapılıyor..." : "Kulüp Üyeliğimi Başlat"}</span>
                <ArrowRight size={18} />
              </button>

              <p className="auth-foot-note">
                Kayıt işleminin ardından tüm kulüp paneline, etkinliklere ve dijital üye kartınıza erişeceksiniz.
              </p>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              <div className="auth-form-intro">
                <h2>Üye Girişi</h2>
                <p>Kayıtlı e-posta adresiniz veya öğrenci numaranızla giriş yapın.</p>
              </div>

              <label className="auth-field-full">
                <span>E-posta veya Öğrenci No *</span>
                <div className="auth-input-wrap">
                  <Mail size={16} />
                  <input
                    type="text"
                    placeholder="E-posta veya Öğrenci No girin"
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    required
                  />
                </div>
              </label>

              <label className="auth-field-full">
                <span>Şifre *</span>
                <div className="auth-input-wrap">
                  <Lock size={16} />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Şifreniz"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    maxLength={12}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    tabIndex="-1"
                    aria-label={showLoginPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <small className="auth-field-hint">
                  Varsayılan şifre: <code>123456</code> (Yeni kaydolduysanız belirlediğiniz şifrenizi girin)
                </small>
              </label>

              <button className="auth-submit-btn" type="submit" disabled={loading}>
                <span>{loading ? "Giriş yapılıyor..." : "Platforma Giriş Yap"}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <div className="auth-cache-reset-row">
            <button
              type="button"
              className="auth-cache-reset-btn"
              onClick={handleClearLocalCache}
              title="Önceki test kayıtlarını ve önbelleği sıfırlayarak temiz bir başlangıç yapın"
            >
              Kayıt veya girişte sorun mu yaşıyorsunuz? <u>Yerel Önbelleği Sıfırla</u>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
