# IAAS NÖHÜ Üye Platformu

React ve Vite ile hazırlanmış, Niğde Ömer Halisdemir Üniversitesi öğrenci kulübü için mobil uyumlu üyelik ve yönetim arayüzü.

## Çalıştırma

```sh
npm install
npm run dev
```

Yerel adres: http://localhost:5173

```sh
npm run build
npm run preview
```

## Özellikler

- **Üye Ol & Giriş Portalı:**
  - Öğrenci numarası tekilliği ve doğrulama kontrolü.
  - **Şifre Güvenlik Kuralı:** En az 6, en fazla 12 karakter (`minLength={6}`, `maxLength={12}`).
  - Şifre göster/gizle butonları, şifre tekrarı ve kulüp tüzük onayı.
- **Yönetici (Admin) Paneli:**
  - `Colakferit21@gmail.com` ve yetkili adminler için kulüp yönetim araçları.
  - Üye listeleme ve admin yetkilendirme.
  - Etkinlik bazlı canlı katılımcı listesi.
  - Yeni duyuru oluşturma ve yayınlama.
- **Kullanıcı Paneli & Etkinlikler:**
  - Dijital kulüp üye kartı ve `.txt` kart indirme desteği.
  - Canlı etkinliklere katılma, katılımcı listesinde anlık görünme ("Sen" etiketi) ve kaydı iptal etme.
  - Profil bilgisi güncelleme ve kalıcı oturum yönetimi.
  - Kenar menüsü ve Ayarlar sayfasından tek tıkla güvenli oturum kapatma (Logout).
- **Tema & Tasarım:**
  - Açık ve Antrasit koyu tema desteği (tercih tarayıcıda saklanır).
  - Mobil uyumlu, duyarlı ve erişilebilir tasarım.

---

## Firebase Entegrasyonu (Hazırlık & Aktifleştirme)

Sistem, Firebase kimlik doğrulama (Firebase Authentication) ve bulut veritabanı (Cloud Firestore) ile doğrudan çalışacak şekilde mimari olarak hazır hale getirilmiştir (`src/firebase.js` ve `src/services/authService.js`).

### Firebase'i Aktif Etme Adımları:

1. **Firebase Projesi Oluşturun:**
   - [Firebase Console](https://console.firebase.google.com/) adresine gidin ve yeni bir proje oluşturun (örn: `iaas-nohu`).
2. **Web Uygulaması Ekleyin:**
   - Proje ayarlarından bir Web Uygulaması (`</>`) ekleyin ve size verilen Firebase SDK yapılandırma bilgilerini kopyalayın.
3. **Kimlik Doğrulamayı Açın:**
   - Firebase Console > **Authentication** > **Sign-in method** sekmesine gidin.
   - **Email/Password** sağlayıcısını etkinleştirin.
4. **Cloud Firestore Veritabanı Başlatın:**
   - Firebase Console > **Firestore Database** sekmesinden veritabanı oluşturun.
5. **Ortam Değişkenlerini Tanımlayın:**
   - Proje ana dizinindeki `.env.example` dosyasını kopyalayarak `.env` veya `.env.local` oluşturun:
   ```sh
   cp .env.example .env
   ```
   - Kopyaladığınız Firebase bilgilerini `.env` içine yapıştırın:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=iaas-nohu.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=iaas-nohu
   VITE_FIREBASE_STORAGE_BUCKET=iaas-nohu.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
   ```
6. **Uygulamayı Yeniden Başlatın:**
   ```sh
   npm run dev
   ```
   Firebase yapılandırması sağlandığında uygulama otomatik olarak bulut moduna geçer; ortam değişkenleri girilmediğinde ise yerel depolama (localStorage) ile kesintisiz çalışmaya devam eder.

---

## Testler

Playwright ile masaüstü (1440 px) ve mobil (390 px) platform testleri:

```sh
npm test
```

Testler şunları otomatik olarak doğrular:
- Şifre 6-12 karakter sınırları ve validation kontrolleri.
- Sıfırdan üye olma ve giriş yapma.
- Aynı öğrenci numarasıyla mükerrer kayıt engeli.
- Admin yetkilendirmesi, etkinlik katılımcı listeleri ve duyuru ekleme.
- Çıkış yapma (Logout) mekanizması.
