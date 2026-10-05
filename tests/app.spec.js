import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("test_no_auth") !== "true") {
      localStorage.setItem("iaas_current_user_id", "mem-1");
    }
  });
  await page.goto("/");
});

test("Dashboard renders without errors or horizontal overflow", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await expect(
    page.getByRole("heading", { name: "Merhaba, Deniz" }),
  ).toBeVisible();
  await expect(page.locator(".event-card")).toHaveCount(3);
  await expect(page.locator(".member-name")).toHaveText("Deniz Yılmaz");
  await expect(
    page.getByRole("textbox", { name: "Platformda ara" }),
  ).not.toHaveAttribute("placeholder", /.*/);
  await expect(page.locator(".topbar-actions")).toContainText("AçıkKoyu");
  expect(
    await page.evaluate(() => {
      const actions = document.querySelector(".topbar-actions");
      const theme = actions?.querySelector(".theme-switch");
      return (
        theme?.previousElementSibling?.classList.contains("search-wrap") &&
        theme?.nextElementSibling?.classList.contains("notification-wrap")
      );
    }),
  ).toBe(true);
  await expect(page.locator(".sidebar nav button")).toHaveCount(6);
  await expect(
    page.getByRole("button", { name: "Topluluk", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "IAAS dünyasını keşfet" }),
  ).toHaveCount(0);
  const dimensions = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await page.screenshot({
    path: testInfo.outputPath("dashboard.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("Event registration persists and can be cancelled", async ({ page }) => {
  await page
    .getByRole("button", { name: "Etkinlikleri keşfet", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Doğaya bir adım: Teknik gezi detayları" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("button", { name: "Etkinliğe katıl", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Kayıtlısın · Kaydımı iptal et" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("button", { name: "Kayıtlarım (1)", exact: true })
    .click();
  await expect(page.locator(".event-card")).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: "Biriktirdiğin güzel anlar" }).click();
  await expect(page.locator(".event-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Doğaya bir adım: Teknik gezi detayları" })
    .click();
  await dialog
    .getByRole("button", { name: "Kayıtlısın · Kaydımı iptal et" })
    .click();
  await dialog.getByRole("button", { name: "Pencereyi kapat" }).click();
  await expect(
    page.getByRole("heading", { name: "Yeni deneyimlere yer aç." }),
  ).toBeVisible();
});

test("Profile changes survive a reload", async ({ page }) => {
  await page.getByRole("button", { name: "Profil ayarları" }).click();
  await page.getByLabel("Ad soyad", { exact: true }).fill("Ece Demir");
  await page
    .getByLabel("E-posta adresi", { exact: true })
    .fill("ece@example.com");
  await page.getByRole("button", { name: "Değişiklikleri kaydet" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Profil bilgilerin güncellendi.",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Merhaba, Ece" }),
  ).toBeVisible();
  await expect(page.locator(".member-name")).toHaveText("Ece Demir");
});

test("Search opens the matching event and handles an empty result", async ({
  page,
}) => {
  const search = page.getByRole("textbox", { name: "Platformda ara" });
  await search.fill("sürdürülebilir");
  await page.locator(".search-results").getByRole("button").click();
  await expect(page.getByRole("dialog")).toContainText(
    "Sürdürülebilir bir gelecek",
  );
  await page.keyboard.press("Escape");
  await search.fill("topluluk");
  await expect(page.locator(".search-results")).toContainText(
    "Aramana uygun bir sonuç bulunamadı.",
  );
  await search.fill("bulunamayan-etkinlik-123");
  await expect(page.locator(".search-results")).toContainText(
    "Aramana uygun bir sonuç bulunamadı.",
  );
});

test("Membership navigation and information download work", async ({
  page,
}) => {
  const menu = page.getByRole("button", { name: "Menüyü aç" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Üyeliğim", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Dijital üye kartın" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Üyelik bilgilerini indir" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("IAAS-uye-karti.txt");
});

test("Magazin sekmesi antrasit görünür, yazılar filtrelenir ve okunur", async ({
  page,
}, testInfo) => {
  await page.getByRole("button", { name: "Koyu tema", exact: true }).click();
  const menu = page.getByRole("button", { name: "Menüyü aç" });
  if (await menu.isVisible()) await menu.click();
  await expect(page.locator(".sidebar nav button")).toHaveText([
    "Genel Bakış",
    "Üyeliğim",
    "Etkinlikler3",
    "Duyurular",
    "Magazin",
    "Üyeler",
  ]);
  await page.getByRole("button", { name: "Magazin", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Magazin.", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".main-shell")).toHaveCSS(
    "background-color",
    "rgb(40, 43, 46)",
  );
  await expect(page.locator(".mag-article-image").first()).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(page.locator(".mag-article-card")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("magazine.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Hikâyeyi oku" }).click();
  await expect(page.getByRole("dialog")).toContainText("Telefonunu cebine koy");
  await expect(page.getByRole("dialog")).toHaveCSS(
    "background-color",
    "rgb(40, 43, 46)",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Yaşam", exact: true }).click();
  await expect(page.locator(".mag-article-card")).toHaveCount(2);
  await expect(page.locator(".mag-featured")).toHaveCount(0);
  await page.getByRole("button", { name: "İlham", exact: true }).click();
  await expect(page.locator(".mag-article-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Bir tohumla başlayan değişim.", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Her bitkinin ihtiyacı farklıdır.",
  );
  await page.getByRole("button", { name: "Pencereyi kapat" }).click();
  await page.getByRole("button", { name: "Doğa", exact: true }).click();
  await expect(page.locator(".mag-article-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Tümü", exact: true }).click();
  await expect(page.locator(".mag-article-card")).toHaveCount(3);
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Genel Bakış", exact: true }).click();
  await expect(page.locator(".magazine-theme")).toHaveCount(0);
});

test("Magazin yazıları platform aramasından açılır", async ({ page }) => {
  await page.getByRole("textbox", { name: "Platformda ara" }).fill("bir tohum");
  await page.locator(".search-results").getByRole("button").click();
  await expect(page.getByRole("dialog")).toContainText(
    "Bir tohumla başlayan değişim.",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

async function openPage(page, name) {
  const target = page
    .locator(".sidebar")
    .getByRole("button", { name, exact: true });
  if (
    (await page.locator(".sidebar-toggle").getAttribute("aria-expanded")) ===
    "false"
  ) {
    await page.getByRole("button", { name: "Menüyü aç", exact: true }).click();
  }
  await target.click();
}

test("Tüm sayfalar, menü ve pencereler beyaz veya antrasit olur", async ({
  page,
}, testInfo) => {
  const pages = [
    "Genel Bakış",
    "Üyeliğim",
    "Etkinlikler 3",
    "Duyurular",
    "Magazin",
    "Üyeler",
    "Ayarlar",
  ];
  for (const theme of ["dark", "light"]) {
    await page
      .getByRole("button", {
        name: theme === "dark" ? "Koyu tema" : "Açık tema",
        exact: true,
      })
      .click();
    for (const name of pages) {
      await openPage(page, name);
      await expect(page.locator(".app-shell")).toHaveAttribute(
        "data-theme",
        theme,
      );
      await expect(page.locator(".main-shell")).toHaveCSS(
        "background-color",
        theme === "dark" ? "rgb(40, 43, 46)" : "rgb(255, 255, 255)",
      );
      await expect(page.locator(".sidebar")).toHaveCSS(
        "background-color",
        theme === "dark" ? "rgb(48, 52, 55)" : "rgb(255, 255, 255)",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (
        (theme === "dark" && name === "Genel Bakış") ||
        (theme === "light" && name === "Magazin")
      ) {
        await page.screenshot({
          path: testInfo.outputPath(`${theme}-${name}.png`),
          fullPage: true,
        });
      }
      if (name === "Magazin") {
        await page.getByRole("button", { name: "Hikâyeyi oku" }).click();
        await expect(page.getByRole("dialog")).toHaveCSS(
          "background-color",
          theme === "dark" ? "rgb(40, 43, 46)" : "rgb(255, 255, 255)",
        );
        await page.keyboard.press("Escape");
      }
      if (name === "Ayarlar") {
        await expect(page.getByLabel("Ad soyad", { exact: true })).toHaveCSS(
          "color",
          theme === "dark" ? "rgb(237, 240, 232)" : "rgb(40, 55, 47)",
        );
      }
    }
  }
  await page.getByRole("button", { name: "Koyu tema", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Koyu tema", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page.getByRole("button", { name: "Açık tema", exact: true }).click();
  await page.reload();
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-theme",
    "light",
  );
});

test("Kenar menüsü kapanır, açılır ve ekran değişimine uyum sağlar", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "desktop") {
    await page
      .getByRole("button", { name: "Menüyü kapat", exact: true })
      .click();
    await expect(page.locator(".main-shell")).toHaveCSS("margin-left", "0px");
    await expect(page.locator(".sidebar")).toHaveAttribute("inert", "");
    await expect(page.locator(".sidebar")).not.toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Menüyü aç", exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".main-shell")).toHaveCSS("margin-left", "0px");
    await page.getByRole("button", { name: "Menüyü aç", exact: true }).click();
    await expect(page.locator(".sidebar")).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Menüyü kapat", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Menüyü aç", exact: true }).click();
  await expect(page.locator(".sidebar")).toBeVisible();
  await expect(page.locator(".main-shell")).toHaveAttribute("inert", "");
  await expect(
    page.getByRole("button", { name: "Kenar menüsünü kapat" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator(".sidebar-profile")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(".sidebar-close")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".sidebar")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Menüyü aç", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Menüyü aç", exact: true }).click();
  await page.getByRole("button", { name: "Kenar menüsünü kapat" }).click();
  await expect(page.locator(".sidebar")).not.toBeVisible();
  await page.getByRole("button", { name: "Menüyü aç", exact: true }).click();
  await page.locator(".sidebar-overlay").click({ position: { x: 350, y: 50 } });
  await expect(page.locator(".sidebar")).not.toBeVisible();
  await page.getByRole("button", { name: "Menüyü aç", exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1050 });
  await expect(page.locator(".sidebar-overlay")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.locator(".main-shell")).not.toHaveAttribute("inert", "");
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1050 });
    await page
      .locator(".main-shell")
      .evaluate((element) =>
        Promise.all(
          element.getAnimations().map((animation) => animation.finished),
        ),
      );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("Kullanıcı sıfırdan üye olabilir ve platforma girebilir", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Aramıza Katıl" })).toBeVisible();
  await expect(page.getByText("Kulüp Yöneticisi (Admin) olarak yetkilendir")).toHaveCount(0);
  const uid = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  await page.getByPlaceholder("Örn: Ahmet Yılmaz").fill("Caner Aydın");
  await page.getByPlaceholder("Örn: 230405012").fill(`2304${uid.slice(-5)}`);
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill(`caner.${uid}@ohu.edu.tr`);
  await page.getByPlaceholder("Örn: Bitkisel Üretim ve Teknolojileri / Çevre Mühendisliği").fill("Tarımsal Genetik Mühendisliği");
  await page.getByPlaceholder("6 – 12 karakter").fill("123456");
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("123456");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();
  await expect(page.getByRole("heading", { name: "Merhaba, Caner" })).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".member-name")).toHaveText("Caner Aydın");
  await expect(page.locator(".sidebar-profile span")).toHaveText("IAAS NÖHÜ Üyesi");
  // Standard member must not see Üyeler page in sidebar
  await expect(page.locator(".sidebar nav").getByRole("button", { name: "Üyeler" })).toHaveCount(0);
});

test("Giriş ekranında örnek hesaplar yer almaz", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");
  await page.getByRole("tab", { name: "Giriş Yap" }).click();
  await expect(page.getByRole("button", { name: "Platforma Giriş Yap" })).toBeVisible();
  await expect(page.locator(".auth-demo-chips")).toHaveCount(0);
  await expect(page.getByText("veya mevcut üyelerle hızlı test")).toHaveCount(0);
});

test("Admin üye listesini, etkinlik katılımcılarını ve duyuru yönetimini kullanabilir", async ({ page }) => {
  const menu = page.getByRole("button", { name: "Menüyü aç" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Üyeler", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Üye Topluluğu & Yönetici Paneli" })).toBeVisible();

  // Test admin toggle
  const grantBtn = page.getByRole("button", { name: "Admin Yetkisi Ver" }).first();
  if (await grantBtn.isVisible()) {
    await grantBtn.click();
    await expect(page.getByRole("status")).toContainText("Yönetici (Admin) yetkisi verildi");
  }

  // Test Events & Attendees tab
  await page.getByRole("button", { name: "Etkinlik Yönetimi & Katılımcılar" }).click();
  await expect(page.getByText("Yayındaki Etkinlikler")).toBeVisible();
  const attendeeBtn = page.getByRole("button", { name: /Katılımcı Listesi/ }).first();
  await attendeeBtn.click();
  await expect(page.getByRole("heading", { name: "Etkinlik Katılımcı Listesi" })).toBeVisible();
  await page.getByRole("button", { name: "Tamam" }).click();

  // Test Announcements tab
  await page.getByRole("button", { name: "Kulüp Duyuruları" }).click();
  await expect(page.getByRole("button", { name: "Yeni Duyuru Yayınla" })).toBeVisible();
  await page.getByRole("button", { name: "Yeni Duyuru Yayınla" }).click();
  await page.getByPlaceholder("Örn: 2026 Güz Dönemi Uluslararası Staj Başvuruları Başladı").fill("Test Admin Duyurusu");
  await page.getByPlaceholder("Duyuru metni, önemli tarihler, başvuru detayları ve bağlantılar...").fill("Bu bir test duyuru metnidir.");
  await page.getByRole("button", { name: "Duyuruyu Yayınla" }).click();
  await expect(page.getByRole("heading", { name: "Test Admin Duyurusu" })).toBeVisible();
});

test("Üye etkinliğe katıldığında canlı katılımcı listesinde ismi ve 'Sen' etiketi anlık görünür", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");

  // 1. Sign up as a regular member
  const uid2 = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  await page.getByPlaceholder("Örn: Ahmet Yılmaz").fill("Kerem Yılmaz");
  await page.getByPlaceholder("Örn: 230405012").fill(`2304${uid2.slice(-5)}`);
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill(`kerem.${uid2}@ohu.edu.tr`);
  await page.getByPlaceholder("Örn: Bitkisel Üretim ve Teknolojileri / Çevre Mühendisliği").fill("Bitkisel Üretim ve Teknolojileri");
  await page.getByPlaceholder("6 – 12 karakter").fill("123456");
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("123456");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();
  await expect(page.getByRole("heading", { name: "Merhaba, Kerem" })).toBeVisible({ timeout: 15000 });

  // 2. Open an event details modal
  await page.getByRole("button", { name: "Doğaya bir adım: Teknik gezi detayları" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Katılımcı Listesi")).toBeVisible();

  // Non-admin member sees privacy protection box and other attendee names are hidden
  await expect(dialog.locator(".modal-attendees-privacy-box")).toBeVisible();
  await expect(dialog.locator(".modal-attendee-card", { hasText: "Kerem Yılmaz" })).toHaveCount(0);
  await expect(dialog.locator(".modal-attendee-card", { hasText: "Ahmet Çetin" })).toHaveCount(0);

  // 3. Join the event
  await dialog.getByRole("button", { name: "Etkinliğe katıl" }).click();

  // 4. Verify Kerem Yılmaz now appears in the live participant list with the 'Sen' badge
  const keremCard = dialog.locator(".modal-attendee-card", { hasText: "Kerem Yılmaz" });
  await expect(keremCard).toBeVisible();
  await expect(keremCard.locator(".attendee-me-badge")).toHaveText("Sen");
  await expect(dialog.getByRole("button", { name: "Kayıtlısın · Kaydımı iptal et" })).toBeVisible();

  // 5. Cancel registration and verify instant removal
  await dialog.getByRole("button", { name: "Kayıtlısın · Kaydımı iptal et" }).click();
  await expect(dialog.locator(".modal-attendee-card", { hasText: "Kerem Yılmaz" })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Etkinliğe katıl" })).toBeVisible();

  // 6. Re-join
  await dialog.getByRole("button", { name: "Etkinliğe katıl" }).click();
  await expect(dialog.locator(".modal-attendee-card", { hasText: "Kerem Yılmaz" })).toBeVisible();

  // Close modal
  await dialog.getByRole("button", { name: "Pencereyi kapat" }).click();
  await expect(dialog).not.toBeVisible();

  // 7. Verify event card shows Kerem's initials "KY" in mini-avatars
  await expect(page.locator(".mini-avatars span", { hasText: "KY" })).toBeVisible();
});

test("Colakferit21@gmail.com hesabı admin yetkisine sahiptir ve panele erişebilir", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");

  // Switch to Giriş Yap tab
  await page.getByRole("tab", { name: "Giriş Yap" }).click();
  await page.getByPlaceholder("E-posta veya Öğrenci No girin").fill("Colakferit21@gmail.com");
  await page.getByPlaceholder("Şifreniz").fill("123456");
  await page.getByRole("button", { name: "Platforma Giriş Yap" }).click();

  // Verify successful login into dashboard
  await expect(page.getByRole("heading", { name: "Merhaba, Ferit" })).toBeVisible();
  await expect(page.locator(".member-name")).toHaveText("Ferit Çolak");
  await expect(page.locator(".sidebar-profile span")).toHaveText("IAAS NÖHÜ Yönetici");

  // Admin user MUST see Üyeler page in sidebar
  const menu = page.getByRole("button", { name: "Menüyü aç" });
  if (await menu.isVisible()) await menu.click();
  await expect(page.locator(".sidebar nav").getByRole("button", { name: "Üyeler" })).toBeVisible();

  // Can click Üyeler page and see Admin Panel
  await page.locator(".sidebar nav").getByRole("button", { name: "Üyeler" }).click();
  await expect(page.getByRole("heading", { name: "Üye Topluluğu & Yönetici Paneli" })).toBeVisible();
});

test("Aynı öğrenci numarası ile tekrar kayıt olunamaz", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");

  // Try to register with an existing member's student number (Deniz Yılmaz's no: 210405012)
  await page.getByPlaceholder("Örn: Ahmet Yılmaz").fill("Test Öğrenci");
  await page.getByPlaceholder("Örn: 230405012").fill("210405012");
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill("yeni.ogrenci@ohu.edu.tr");
  await page.getByPlaceholder("Örn: Bitkisel Üretim ve Teknolojileri / Çevre Mühendisliği").fill("Bitkisel Üretim");
  await page.getByPlaceholder("6 – 12 karakter").fill("123456");
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("123456");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();

  // Verify duplicate student number error banner
  await expect(page.locator(".auth-error-banner")).toContainText(
    "Bu öğrenci numarası ile kayıtlı bir üye zaten mevcut. Lütfen bilgilerinizi kontrol edin veya giriş yapın."
  );
  // Verify user is not logged in
  await expect(page.getByRole("heading", { name: "Aramıza Katıl" })).toBeVisible();
});

test("Kullanıcı kenar menüsünden ve Ayarlar sayfasından başarıyla çıkış yapabilir", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Merhaba, Deniz" })).toBeVisible();

  // 1. Kenar menüsünde "Çıkış Yap" butonunu doğrula ve tıkla
  const sidebar = page.locator(".sidebar");
  const menu = page.getByRole("button", { name: "Menüyü aç" });
  if (await menu.isVisible()) await menu.click();

  const sidebarLogoutBtn = sidebar.locator(".sidebar-logout-nav-item");
  await expect(sidebarLogoutBtn).toBeVisible();
  await expect(sidebarLogoutBtn).toContainText("Çıkış Yap");
  await sidebarLogoutBtn.click();

  // Oturum kapandı, Auth portalına yönlendirildi
  await expect(page.getByRole("heading", { name: "Aramıza Katıl" })).toBeVisible();

  // 2. Tekrar giriş yap
  await page.getByRole("tab", { name: "Giriş Yap" }).click();
  await page.getByPlaceholder("E-posta veya Öğrenci No girin").fill("deniz.yilmaz@ohu.edu.tr");
  await page.getByPlaceholder("Şifreniz").fill("123456");
  await page.getByRole("button", { name: "Platforma Giriş Yap" }).click();
  await expect(page.getByRole("heading", { name: "Merhaba, Deniz" })).toBeVisible();

  // 3. Ayarlar sayfasına git
  if (await menu.isVisible()) await menu.click();
  await page.locator(".sidebar").getByRole("button", { name: "Ayarlar" }).click();
  await expect(page.getByRole("heading", { name: "Profil bilgilerin" })).toBeVisible();

  // 4. "Oturum ve Güvenlik" alanını ve "Hesaptan Çıkış Yap" butonunu doğrula ve tıkla
  await expect(page.getByRole("heading", { name: "Oturum ve Güvenlik" })).toBeVisible();
  const settingsLogoutBtn = page.getByRole("button", { name: "Hesaptan Çıkış Yap" });
  await expect(settingsLogoutBtn).toBeVisible();
  await settingsLogoutBtn.click();

  // Tekrar Auth portalına dönüldüğünü doğrula
  await expect(page.getByRole("heading", { name: "Aramıza Katıl" })).toBeVisible();
});

test("Yeni üye kaydı sonrasında aynı öğrenci numarasıyla (boşluklu veya formatlı) 2. hesap açılamaz", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");

  // 1. Sıfırdan özgün bir öğrenci numarasıyla üye ol
  const uid3 = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const dupSNo = `2404${uid3.slice(-5)}`;
  await page.getByPlaceholder("Örn: Ahmet Yılmaz").fill("Barış Manço");
  await page.getByPlaceholder("Örn: 230405012").fill(dupSNo);
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill(`baris.${uid3}@ohu.edu.tr`);
  await page.getByPlaceholder("Örn: Bitkisel Üretim ve Teknolojileri / Çevre Mühendisliği").fill("Müzik ve Sanat");
  await page.getByPlaceholder("6 – 12 karakter").fill("123456");
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("123456");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();

  // Başarıyla giriş yapıldı
  await expect(page.getByRole("heading", { name: "Merhaba, Barış" })).toBeVisible({ timeout: 15000 });

  // 2. Kenar menüsünden çıkış yap
  const menu = page.getByRole("button", { name: "Menüyü aç" });
  if (await menu.isVisible()) await menu.click();
  await page.locator(".sidebar-logout-nav-item").click();
  await expect(page.getByRole("heading", { name: "Aramıza Katıl" })).toBeVisible();

  // 3. Aynı öğrenci numarasını kullanarak farklı isim ve e-posta ile 2. hesap açmayı dene
  await page.getByPlaceholder("Örn: Ahmet Yılmaz").fill("Cem Karaca");
  await page.getByPlaceholder("Örn: 230405012").fill(dupSNo);
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill(`cem.${uid3}@ohu.edu.tr`);
  await page.getByPlaceholder("Örn: Bitkisel Üretim ve Teknolojileri / Çevre Mühendisliği").fill("Tarımsal Genetik");
  await page.getByPlaceholder("6 – 12 karakter").fill("123456");
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("123456");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();

  // 4. İkinci kaydın engellendiğini ve hata mesajını doğrula
  await expect(page.locator(".auth-error-banner")).toContainText(
    "Bu öğrenci numarası ile kayıtlı bir üye zaten mevcut. Lütfen bilgilerinizi kontrol edin veya giriş yapın."
  );
  await expect(page.getByRole("heading", { name: "Aramıza Katıl" })).toBeVisible();
});

test("Üye kayıt olurken şifre belirler ve bu şifreyle giriş yapar, hatalı şifre reddedilir", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");

  const uid4 = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const sNo4 = `2504${uid4.slice(-5)}`;
  const email4 = `sila.${uid4}@ohu.edu.tr`;

  // 1. Şifreler eşleşmediğinde hata mesajı doğrula
  await page.getByPlaceholder("Örn: Ahmet Yılmaz").fill("Sıla Gençoğlu");
  await page.getByPlaceholder("Örn: 230405012").fill(sNo4);
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill(email4);
  await page.getByPlaceholder("Örn: Bitkisel Üretim ve Teknolojileri / Çevre Mühendisliği").fill("Biyosistem Mühendisliği");
  await page.getByPlaceholder("6 – 12 karakter").fill("parola123");
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("farkliParola");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();
  await expect(page.locator(".auth-error-banner")).toContainText("Girdiğiniz şifreler birbiriyle eşleşmiyor");

  // 2. Doğru şifreyle kaydı tamamla
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("parola123");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();
  await expect(page.getByRole("heading", { name: "Merhaba, Sıla" })).toBeVisible({ timeout: 15000 });

  // 3. Çıkış yap
  const menu = page.getByRole("button", { name: "Menüyü aç" });
  if (await menu.isVisible()) await menu.click();
  await page.locator(".sidebar-logout-nav-item").click();
  await expect(page.getByRole("heading", { name: "Aramıza Katıl" })).toBeVisible();

  // 4. Yanlış şifre ile giriş yapmayı dene
  await page.getByRole("tab", { name: "Giriş Yap" }).click();
  await page.getByPlaceholder("E-posta veya Öğrenci No girin").fill(email4);
  await page.getByPlaceholder("Şifreniz").fill("yanlisSifre");
  await page.getByRole("button", { name: "Platforma Giriş Yap" }).click();
  await expect(page.locator(".auth-error-banner")).toContainText("Girdiğiniz");

  // 5. Doğru şifre ile başarılı giriş yap
  await page.getByPlaceholder("Şifreniz").fill("parola123");
  await page.getByRole("button", { name: "Platforma Giriş Yap" }).click();
  await expect(page.getByRole("heading", { name: "Merhaba, Sıla" })).toBeVisible();
});

test("Şifre en az 6 en fazla 12 karakter kuralına uygun olmalıdır", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");

  const uid5 = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  await page.getByPlaceholder("Örn: Ahmet Yılmaz").fill("Elif Kaya");
  await page.getByPlaceholder("Örn: 230405012").fill(`2604${uid5.slice(-5)}`);
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill(`elif.${uid5}@ohu.edu.tr`);
  await page.getByPlaceholder("Örn: Bitkisel Üretim ve Teknolojileri / Çevre Mühendisliği").fill("Biyosistem Mühendisliği");

  // 1. 6 karakterden kısa şifre (5 karakter) denemesi
  await page.getByPlaceholder("6 – 12 karakter").fill("12345");
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("12345");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();
  await expect(page.locator(".auth-error-banner")).toContainText(
    "Belirleyeceğiniz şifre 6 ile 12 karakter arasında olmalıdır."
  );

  // 2. input elemanında minLength=6 ve maxLength=12 attribute'larının varlığını doğrula
  const passInput = page.getByPlaceholder("6 – 12 karakter");
  await expect(passInput).toHaveAttribute("minlength", "6");
  await expect(passInput).toHaveAttribute("maxlength", "12");

  // 3. 6 ile 12 karakter arasında geçerli şifre ile başarılı kayıt (8 karakter: 'parola99')
  await page.getByPlaceholder("6 – 12 karakter").fill("parola99");
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("parola99");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();
  await expect(page.getByRole("heading", { name: "Merhaba, Elif" })).toBeVisible({ timeout: 15000 });
});

test("Kayıt olurken yalnızca @ohu.edu.tr uzantılı e-posta adresleri kabul edilir", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");

  const uid = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  await page.getByPlaceholder("Örn: Ahmet Yılmaz").fill("Deneme Öğrenci");
  await page.getByPlaceholder("Örn: 230405012").fill(`2704${uid.slice(-5)}`);
  await page.getByPlaceholder("Örn: Bitkisel Üretim ve Teknolojileri / Çevre Mühendisliği").fill("Bitkisel Üretim");
  await page.getByPlaceholder("6 – 12 karakter").fill("123456");
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("123456");

  // 1. Gmail uzantılı e-posta ile kayıt denemesi (Engellenmeli)
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill("deneme@gmail.com");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();
  await expect(page.locator(".auth-error-banner")).toContainText("@ohu.edu.tr");

  // 2. Hotmail uzantılı e-posta ile kayıt denemesi (Engellenmeli)
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill("deneme@hotmail.com");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();
  await expect(page.locator(".auth-error-banner")).toContainText("@ohu.edu.tr");

  // 3. Geçerli @ohu.edu.tr uzantılı e-posta ile başarılı kayıt
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill(`deneme.${uid}@ohu.edu.tr`);
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();
  await expect(page.getByRole("heading", { name: "Merhaba, Deneme" })).toBeVisible({ timeout: 15000 });
});

test("feritefeturksadcolak@ohu.edu.tr hesabı admin olarak tanınır ve yetkili panele erişir", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");

  const feritUid = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const feritEmail = `feritefeturksadcolak.${feritUid}@ohu.edu.tr`;
  const feritSNo = `2401${feritUid.slice(-5)}`;

  // Ferit Efe Türkşad Çolak olarak kayıt ol
  await page.getByPlaceholder("Örn: Ahmet Yılmaz").fill("Ferit Efe Türkşad Çolak");
  await page.getByPlaceholder("Örn: 230405012").fill(feritSNo);
  await page.getByPlaceholder("ad.soyad@ohu.edu.tr").fill(feritEmail);
  await page.getByPlaceholder("Örn: Bitkisel Üretim ve Teknolojileri / Çevre Mühendisliği").fill("Tarımsal Genetik Mühendisliği");
  await page.getByPlaceholder("6 – 12 karakter").fill("TheFerit2121");
  await page.getByPlaceholder("Şifrenizi tekrar girin").fill("TheFerit2121");
  await page.getByRole("button", { name: "Kulüp Üyeliğimi Başlat" }).click();

  // Karşılama ekranı
  await expect(page.getByRole("heading", { name: /Merhaba/ })).toBeVisible({ timeout: 15000 });

  // Admin yetkisine sahip olduğunu (Üyeler menüsü varlığıyla) doğrula
  const menu = page.getByRole("button", { name: "Menüyü aç" });
  if (await menu.isVisible()) await menu.click();
  const membersNavItem = page.locator(".sidebar").getByRole("button", { name: "Üyeler" });
  await expect(membersNavItem).toBeVisible();

  // Kenar menüsünden çıkış yap
  await page.locator(".sidebar-logout-nav-item").click();
  await expect(page.getByRole("heading", { name: "Aramıza Katıl" })).toBeVisible();

  // Giriş Yap sekmesinden öğrenci numarası ile giriş yap
  await page.getByRole("tab", { name: "Giriş Yap" }).click();
  await page.getByPlaceholder("E-posta veya Öğrenci No girin").fill(feritSNo);
  await page.getByPlaceholder("Şifreniz").fill("TheFerit2121");
  await page.getByRole("button", { name: "Platforma Giriş Yap" }).click();
  await expect(page.getByRole("heading", { name: /Merhaba/ })).toBeVisible({ timeout: 15000 });
});

test("Admin kullanıcı etkinlik penceresinde katılımcı isimlerini görür ve Excel/PDF indirme butonlarına erişir", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("test_no_auth", "true");
    localStorage.clear();
  });
  await page.goto("/");

  // 1. Login as admin
  await page.getByRole("tab", { name: "Giriş Yap" }).click();
  await page.getByPlaceholder("E-posta veya Öğrenci No girin").fill("Colakferit21@gmail.com");
  await page.getByPlaceholder("Şifreniz").fill("123456");
  await page.getByRole("button", { name: "Platforma Giriş Yap" }).click();
  await expect(page.getByRole("heading", { name: /Merhaba/ })).toBeVisible({ timeout: 15000 });

  // 2. Open event modal
  await page.getByRole("button", { name: "Doğaya bir adım: Teknik gezi detayları" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // 3. Verify Admin sees full attendee list (e.g. Ahmet Çetin) and Excel/PDF export buttons
  await expect(dialog.getByText("Katılımcı Listesi")).toBeVisible();
  await expect(dialog.locator(".modal-attendee-card", { hasText: "Ahmet Çetin" })).toBeVisible();
  await expect(dialog.locator(".export-btn.export-excel")).toBeVisible();
  await expect(dialog.locator(".export-btn.export-pdf")).toBeVisible();
  await expect(dialog.locator(".modal-attendees-privacy-box")).toHaveCount(0);

  // 4. Verify clicking Excel button triggers download
  const downloadPromise = page.waitForEvent("download");
  await dialog.locator(".export-btn.export-excel").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("IAAS_NOHU");
  expect(download.suggestedFilename()).toContain(".csv");

  // Close modal
  await dialog.getByRole("button", { name: "Pencereyi kapat" }).click();
  await expect(dialog).not.toBeVisible();
});







