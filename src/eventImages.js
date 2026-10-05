/**
 * IAAS NÖHÜ Web Platformu - Etkinlik Stok Görsel Sistemi
 * Seçilen kategoriye ve etkinlik başlığına göre yüksek kaliteli, optimize edilmiş
 * stok fotoğraflar atar ve kırık/placeholder görselleri otomatik onarır.
 */

export const STOCK_IMAGES_BY_CATEGORY = {
  "Teknik Gezi": [
    {
      id: "gezi_tarla",
      label: "Tarım Arazisi ve Öğrenci Gezisi",
      url: "https://images.unsplash.com/photo-1592417817098-8f3d69104a47?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "gezi_doga",
      label: "Doğa ve Botanik Keşfi",
      url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "gezi_manzara",
      label: "Geniş Tarım Vadisi",
      url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  "Atölye": [
    {
      id: "atolye_fide",
      label: "Fide Dikimi ve Toprak Uygulaması",
      url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "atolye_sera",
      label: "Modern Sera ve Bitki Yetiştiriciliği",
      url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "atolye_bahce",
      label: "Uygulamalı Tarım Çalıştayı",
      url: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  "Buluşma": [
    {
      id: "bulusma_ogrenci",
      label: "Kampüs Öğrenci Buluşması",
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "bulusma_kahve",
      label: "Fikir Paylaşımı ve Kahve Sohbeti",
      url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "bulusma_ekip",
      label: "Kulüp Ekip Toplantısı",
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  "Seçim / Genel Kurul": [
    {
      id: "secim_amfi",
      label: "Üniversite Amfisi & Genel Kurul",
      url: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "secim_salon",
      label: "Yönetim Toplantısı ve Oylama",
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "secim_hitap",
      label: "Kürsü ve Kulüp Meclisi",
      url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  "Seminer": [
    {
      id: "seminer_konferans",
      label: "Akademik Konferans & Panel",
      url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "seminer_sunum",
      label: "Sektörel Sunum ve Eğitim",
      url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  "Sosyal": [
    {
      id: "sosyal_festival",
      label: "Açık Hava Festival ve Piknik",
      url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "sosyal_arkadaslik",
      label: "Kampüs Çimlerinde Dayanışma",
      url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  "Uluslararası": [
    {
      id: "uluslararasi_expro",
      label: "ExPro Staj ve Dünya Haritası",
      url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "uluslararasi_kesif",
      label: "Global Tarım Fırsatları",
      url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
    },
  ],
};

// Tüm ön ayarlar listesi (Formda görsel seçimi için)
export const ALL_STOCK_PRESETS = Object.entries(STOCK_IMAGES_BY_CATEGORY).flatMap(
  ([category, list]) => list.map((item) => ({ ...item, category }))
);

/**
 * Kategori ve başlık ipuçlarına göre en uygun stok görsel URL'sini döndürür.
 */
export function getEventStockImage(category = "Atölye", title = "") {
  const normalizedTitle = (title || "").toLocaleLowerCase("tr");

  // Özel başlık anahtar kelimeleri eşleştirmesi
  if (
    normalizedTitle.includes("seçim") ||
    normalizedTitle.includes("secim") ||
    normalizedTitle.includes("genel kurul") ||
    normalizedTitle.includes("yönetim") ||
    normalizedTitle.includes("yonetim") ||
    normalizedTitle.includes("amfi") ||
    normalizedTitle.includes("kurul")
  ) {
    return STOCK_IMAGES_BY_CATEGORY["Seçim / Genel Kurul"][0].url;
  }

  if (
    normalizedTitle.includes("fide") ||
    normalizedTitle.includes("toprak") ||
    normalizedTitle.includes("sera") ||
    normalizedTitle.includes("dikim") ||
    normalizedTitle.includes("atölye") ||
    normalizedTitle.includes("atolye")
  ) {
    return STOCK_IMAGES_BY_CATEGORY["Atölye"][0].url;
  }

  if (
    normalizedTitle.includes("gezi") ||
    normalizedTitle.includes("tarla") ||
    normalizedTitle.includes("hasat") ||
    normalizedTitle.includes("arboretum") ||
    normalizedTitle.includes("orman")
  ) {
    return STOCK_IMAGES_BY_CATEGORY["Teknik Gezi"][0].url;
  }

  if (
    normalizedTitle.includes("kahve") ||
    normalizedTitle.includes("tanışma") ||
    normalizedTitle.includes("tanisma") ||
    normalizedTitle.includes("sohbet") ||
    normalizedTitle.includes("buluşma")
  ) {
    return STOCK_IMAGES_BY_CATEGORY["Buluşma"][1].url;
  }

  if (
    normalizedTitle.includes("staj") ||
    normalizedTitle.includes("expro") ||
    normalizedTitle.includes("yurt dışı") ||
    normalizedTitle.includes("uluslararası")
  ) {
    return STOCK_IMAGES_BY_CATEGORY["Uluslararası"][0].url;
  }

  if (
    normalizedTitle.includes("seminer") ||
    normalizedTitle.includes("konferans") ||
    normalizedTitle.includes("panel") ||
    normalizedTitle.includes("eğitim")
  ) {
    return STOCK_IMAGES_BY_CATEGORY["Seminer"][0].url;
  }

  // Kategoriye göre varsayılan eşleştirme
  const categoryImages = STOCK_IMAGES_BY_CATEGORY[category];
  if (categoryImages && categoryImages.length > 0) {
    return categoryImages[0].url;
  }

  // Eşleşme bulunamazsa genel tarım doğa görseli
  return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80";
}

/**
 * Bir görsel URL'sini kontrol eder: Eğer boşsa veya kırık/placeholder (örn: trae.ai) ise,
 * etkinliğin kategorisine ve başlığına uygun yüksek kaliteli stok görselle değiştirir.
 */
export function normalizeEventImage(imageUrl, category = "Atölye", title = "") {
  if (
    !imageUrl ||
    typeof imageUrl !== "string" ||
    imageUrl.trim() === "" ||
    imageUrl.includes("trae.ai") ||
    imageUrl.includes("generating") ||
    imageUrl.includes("placeholder")
  ) {
    return getEventStockImage(category, title);
  }
  return imageUrl;
}
