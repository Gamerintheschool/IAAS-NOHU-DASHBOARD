/**
 * IAAS NÖHÜ Web Platformu - Katılımcı Listesi Dışa Aktarma (Excel & PDF)
 */

function sanitizeFilename(str) {
  return (str || "etkinlik")
    .replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ_ -]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Katılımcı listesini Excel uyumlu CSV (UTF-8 BOM) olarak indirir.
 * Microsoft Excel, Google E-Tablolar ve LibreOffice ile %100 uyumludur.
 */
export function exportAttendeesToExcel(event, attendees = []) {
  if (!event) return;

  const now = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const headers = [
    "Sıra No",
    "Ad Soyad",
    "Öğrenci No",
    "E-Posta",
    "Fakülte",
    "Bölüm",
    "Telefon",
    "Rol / Yetki",
    "Durum",
  ];

  const rows = attendees.map((att, idx) => [
    idx + 1,
    `"${(att.name || "").replace(/"/g, '""')}"`,
    `"${(att.studentNo || "").replace(/"/g, '""')}"`,
    `"${(att.email || "").replace(/"/g, '""')}"`,
    `"${(att.faculty || "").replace(/"/g, '""')}"`,
    `"${(att.department || "").replace(/"/g, '""')}"`,
    `"${(att.phone || "Belirtilmedi").replace(/"/g, '""')}"`,
    `"${att.role === "admin" ? "Yönetici" : "Üye"}"`,
    `"${att.status || "Aktif"}"`,
  ]);

  const metaRows = [
    `"IAAS NÖHÜ - ETKİNLİK KATILIMCI RAPORU"`,
    `"Etkinlik Adı:","${(event.title || "").replace(/"/g, '""')}"`,
    `"Tarih & Saat:","${(event.date || "")} · ${(event.time || "")}"`,
    `"Mekan / Konum:","${(event.place || "").replace(/"/g, '""')}"`,
    `"Toplam Kayıtlı Katılımcı:","${attendees.length} Kişi"`,
    `"Kontenjan:","${event.people || "Belirtilmedi"} Kişi"`,
    `"Rapor Oluşturma Tarihi:","${now}"`,
    "", // Boş satır
  ];

  const csvContent =
    "\uFEFF" +
    metaRows.join("\r\n") +
    "\r\n" +
    headers.join(";") +
    "\r\n" +
    rows.map((r) => r.join(";")).join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const eventSlug = sanitizeFilename(event.title);
  const dateSlug = new Date().toISOString().slice(0, 10);

  link.setAttribute("href", url);
  link.setAttribute("download", `IAAS_NOHU_${eventSlug}_Katilimcilar_${dateSlug}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Katılımcı listesini şık ve resmi bir PDF çıktısına dönüştürür ve yazdırma/kaydetme penceresini açar.
 */
export function exportAttendeesToPdf(event, attendees = []) {
  if (!event) return;

  const now = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Yazdırma penceresi açılamadı. Lütfen tarayıcınızın açılır pencere (pop-up) engelleyicisini kontrol edin.");
    return;
  }

  const tableRowsHtml =
    attendees.length > 0
      ? attendees
          .map(
            (att, idx) => `
        <tr>
          <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
          <td style="font-weight: 600;">${escapeHtml(att.name || "İsimsiz")}</td>
          <td>${escapeHtml(att.studentNo || "-")}</td>
          <td>${escapeHtml(att.email || "-")}</td>
          <td>${escapeHtml(att.faculty || "-")}</td>
          <td>${escapeHtml(att.department || "-")}</td>
          <td>${escapeHtml(att.phone || "-")}</td>
          <td style="text-align: center;">
            <span class="badge ${att.role === "admin" ? "admin" : "member"}">
              ${att.role === "admin" ? "Yönetici" : "Üye"}
            </span>
          </td>
          <td style="text-align: center; min-width: 60px;">&nbsp;</td>
        </tr>
      `
          )
          .join("")
      : `<tr><td colspan="9" style="text-align:center; padding: 24px; color: #666;">Bu etkinliğe kayıtlı katılımcı bulunmamaktadır.</td></tr>`;

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>IAAS NÖHÜ - ${escapeHtml(event.title)} Katılımcı Listesi</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 15mm 10mm 15mm 10mm;
        }
        * {
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        body {
          color: #1a202c;
          background: #fff;
          margin: 0;
          padding: 24px;
          font-size: 13px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #2e7d32;
          padding-bottom: 14px;
          margin-bottom: 18px;
        }
        .logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-badge {
          background: #2e7d32;
          color: #fff;
          font-weight: 800;
          font-size: 16px;
          padding: 8px 14px;
          border-radius: 8px;
          letter-spacing: 1px;
        }
        .club-title h1 {
          margin: 0;
          font-size: 18px;
          color: #1b5e20;
          font-weight: 700;
        }
        .club-title p {
          margin: 2px 0 0;
          font-size: 12px;
          color: #64748b;
        }
        .report-meta {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }
        .event-summary-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 18px;
        }
        .summary-item label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 3px;
        }
        .summary-item strong {
          font-size: 13px;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background: #f1f5f9;
          color: #334155;
          font-weight: 700;
          text-align: left;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          font-size: 11px;
          text-transform: uppercase;
        }
        td {
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          font-size: 11.5px;
          color: #1e293b;
        }
        tr:nth-child(even) td {
          background: #fbfcfe;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge.admin {
          background: #fef3c7;
          color: #92400e;
        }
        .badge.member {
          background: #e0f2fe;
          color: #0369a1;
        }
        .footer {
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 16px;
          border-top: 1px dashed #cbd5e1;
        }
        .footer-note {
          font-size: 10.5px;
          color: #64748b;
          max-width: 60%;
        }
        .signature-box {
          text-align: center;
          width: 180px;
          border-top: 1px solid #0f172a;
          padding-top: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        .no-print-bar {
          background: #0f172a;
          color: #fff;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: -24px -24px 20px -24px;
        }
        .print-btn {
          background: #22c55e;
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
        }
        @media print {
          .no-print-bar {
            display: none !important;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <span><strong>IAAS NÖHÜ</strong> · Katılımcı Listesi Yazdırma & PDF Önizlemesi</span>
        <button class="print-btn" onclick="window.print()">🖨️ PDF Olarak Kaydet / Yazdır</button>
      </div>

      <div class="header">
        <div class="logo-box">
          <div class="logo-badge">IAAS</div>
          <div class="club-title">
            <h1>IAAS NÖHÜ — Uluslararası Tarım Öğrencileri Topluluğu</h1>
            <p>Niğde Ömer Halisdemir Üniversitesi Kulüp Etkinlik Yönetim Sistemi</p>
          </div>
        </div>
        <div class="report-meta">
          <div><strong>Rapor Tarihi:</strong> ${now}</div>
          <div><strong>Toplam Kayıt:</strong> ${attendees.length} Katılımcı</div>
        </div>
      </div>

      <div class="event-summary-grid">
        <div class="summary-item">
          <label>Etkinlik Adı</label>
          <strong>${escapeHtml(event.title || "")}</strong>
        </div>
        <div class="summary-item">
          <label>Tarih & Saat</label>
          <strong>${escapeHtml(event.date || "")} · ${escapeHtml(event.time || "")}</strong>
        </div>
        <div class="summary-item">
          <label>Mekan / Konum</label>
          <strong>${escapeHtml(event.place || "")}</strong>
        </div>
        <div class="summary-item">
          <label>Doluluk / Kontenjan</label>
          <strong>${attendees.length} / ${event.people || "∞"} Kişi</strong>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">No</th>
            <th>Ad Soyad</th>
            <th>Öğrenci No</th>
            <th>E-Posta</th>
            <th>Fakülte</th>
            <th>Bölüm</th>
            <th>Telefon</th>
            <th style="text-align: center;">Rol</th>
            <th style="text-align: center; width: 70px;">İmza / Katılım</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <div class="footer">
        <div class="footer-note">
          Bu belge, IAAS NÖHÜ Kulüp Yönetim Sistemi üzerinden otomatik olarak oluşturulmuştur.
          Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca yalnızca resmi kulüp organizasyonunda kullanılabilir.
        </div>
        <div class="signature-box">
          Kulüp Yöneticisi Onayı / İmza
        </div>
      </div>

      <script>
        // Sayfa yüklendiğinde otomatik yazdırma diyaloğunu aç
        window.addEventListener("load", () => {
          setTimeout(() => {
            window.print();
          }, 300);
        });
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
