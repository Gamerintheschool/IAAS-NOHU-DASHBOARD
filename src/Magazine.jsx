import React, { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Clock3,
  Sprout,
} from "lucide-react";
import "./magazine.css";

const editorialImage = (prompt) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`;

export const magazineArticles = [
  {
    id: "yavaslamak",
    category: "Doğa",
    title: "Biraz yavaşla. Doğanın anlatacakları var.",
    excerpt:
      "Her şeyin hızlandığı bir dünyada, yeniden fark etmenin ve doğayla bağ kurmanın küçük yolları.",
    author: "IAAS Editör",
    date: "2 Ekim 2026",
    minutes: 3,
    image: editorialImage(
      "Atmospheric editorial landscape photograph of a winding path through a misty forest with tall pine trees, deep emerald foliage, a lone small hiker in the distance, soft golden morning light, cinematic natural photography, sophisticated travel magazine cover, no text",
    ),
    imageAlt: "Sabah sisinin içinde uzanan orman patikası",
    paragraphs: [
      "Bir yürüyüşü değerli kılan her zaman vardığımız yer değil. Bazen yolun kenarındaki bir yaprağın rengi, rüzgârla değişen bir koku ya da ilk kez duyduğumuz bir ses. Yavaşladığımızda, her gün yanından geçtiğimiz yerlerin bile bize yeni bir şey söylediğini fark ediyoruz.",
      "Doğayla bağ kurmak için uzun bir seyahat planlamamız gerekmiyor. Kampüsteki ağaçların mevsimle değişimini izlemek, öğle arasını açık havada geçirmek veya eve dönerken daha yeşil bir yolu seçmek de bir başlangıç. Önemli olan, o anı bir başka işi yetiştirmek için kullanmadan yaşayabilmek.",
      "Bu hafta kendine küçük bir keşif alanı aç. Telefonunu cebine koy, bildiğin bir yolda birkaç dakika daha yavaş yürü. Gördüğün üç ayrıntıyı aklında tut. Belki de doğanın anlatacaklarını duymak için ihtiyacımız olan tek şey, ona biraz zaman tanımaktır.",
    ],
  },
  {
    id: "kampuste-mola",
    category: "Yaşam",
    title: "Kampüste bir mola, yepyeni bir fikir.",
    excerpt:
      "Ders aralarında başlayan sohbetler, bazen en güzel hikâyelerin ilk cümlesi olur.",
    author: "IAAS Editör",
    date: "1 Ekim 2026",
    minutes: 2,
    image: editorialImage(
      "Candid editorial photograph of university students having coffee together at an outdoor campus cafe, warm autumn afternoon sunlight, thoughtful relaxed conversation, natural earthy colors, premium lifestyle magazine photography, no text",
    ),
    imageAlt: "Kampüste açık havada kahve içip sohbet eden öğrenciler",
    paragraphs: [
      "Takvimimiz derslerle ve teslim tarihleriyle doluyken molaları kolayca gereksiz görebiliyoruz. Oysa bir arkadaşla yapılan kısa bir sohbet, aynı soruya başka bir açıdan bakmamızı sağlayabilir. Yeni bir fikir için bazen masadan kalkmak gerekir.",
      "Bir sonraki aranda her zamanki grubuna yeni birini davet etmeyi dene. Hangi konuyu merak ettiğini, son zamanlarda ne öğrendiğini sor. Bir proje fikri çıkmasa bile, birlikte düşünmenin kendisi başlı başına kıymetli.",
      "Kampüs hayatını hatırlanır yapan yalnızca dersler değil; aralarda kurduğumuz bağlar da bu hikâyenin bir parçası. Bir kahve, kısa bir yürüyüş, içten bir soru. Başlamak için yeterli.",
    ],
  },
  {
    id: "bir-tohum",
    category: "İlham",
    title: "Bir tohumla başlayan değişim.",
    excerpt:
      "Pencere önündeki küçük bir saksının bize öğretebileceklerini keşfediyoruz.",
    author: "IAAS Editör",
    date: "29 Eylül 2026",
    minutes: 2,
    image: editorialImage(
      "Beautiful editorial closeup photograph of a tiny fresh green seedling growing in a handmade terracotta pot on a sunny windowsill, soft side light, textured charcoal wall background, minimalist sustainable lifestyle magazine photography, no text",
    ),
    imageAlt: "Pencere önündeki toprak saksıda büyüyen yeşil filiz",
    paragraphs: [
      "Bir tohumu toprağa bıraktığımızda sonucunu hemen göremeyiz. Sulamak, ışığını izlemek ve beklemek gerekir. Bu küçük süreç, her gelişmenin anında görünür olmak zorunda olmadığını hatırlatır.",
      "İlk denemen için yaşadığın yerin ışığına ve mevsimine uygun bir bitki seçebilirsin. Saksının drenajını kontrol etmek ve toprağın nemini gözlemlemek, ezberlenmiş bir sulama takviminden daha iyi bir başlangıçtır. Her bitkinin ihtiyacı farklıdır.",
      "Büyümeyi fotoğraflarla ya da küçük notlarla takip et. İlk yaprağın açıldığı günün heyecanını bir arkadaşınla paylaş. Değişim bazen çok küçük bir yerde başlar; onu sürdüren şey gösterdiğimiz ilgidir.",
    ],
  },
  {
    id: "az-esya",
    category: "Yaşam",
    title: "Daha az eşya, daha çok deneyim.",
    excerpt:
      "Öğrenci hayatında bilinçli tüketim için küçük, uygulanabilir bir başlangıç.",
    author: "IAAS Editör",
    date: "27 Eylül 2026",
    minutes: 2,
    image: editorialImage(
      "Editorial still life photograph of a well used canvas backpack, open notebook and reusable steel water bottle on a wooden bench overlooking a calm lake, muted autumn colors, soft daylight, premium slow living magazine, no text",
    ),
    imageAlt:
      "Göl kenarındaki bankta sırt çantası, defter ve yeniden kullanılabilir matara",
    paragraphs: [
      "Yeni bir şeye ihtiyaç duyduğumuzda ilk seçeneğimiz her zaman satın almak olmayabilir. Ödünç almak, tamir ettirmek ya da ikinci el seçeneklerine bakmak hem bütçemize hem de kaynakların daha uzun süre kullanılmasına katkı sağlar.",
      "Arkadaşlarınla küçük bir kitap ve eşya paylaşım listesi oluşturabilirsin. Bir dönem ihtiyaç duyduğun ama sonrasında kullanmadığın araçlar, başka birinin işini kolaylaştırabilir. Paylaşımı kolaylaştıran şey, beklentileri ve teslim tarihlerini baştan konuşmaktır.",
      "Amaç kusursuz bir tüketim alışkanlığı kurmak değil. Gerçek ihtiyacımızla anlık isteğimizi ayırt etmeye çalışmak bile değerli bir adım. Bir sonraki alışverişten önce kendine biraz düşünme zamanı tanı.",
    ],
  },
];

export default function Magazine({ onRead }) {
  const [category, setCategory] = useState("Tümü");
  const featured = magazineArticles[0];
  const articles =
    category === "Tümü"
      ? magazineArticles.slice(1)
      : magazineArticles.filter((article) => article.category === category);

  return (
    <div className="magazine-page">
      <header className="mag-masthead">
        <div className="mag-edition">
          <span>
            <Sprout size={15} /> IAAS EDİTORYAL
          </span>
          <span>
            EKİM 2026 <i /> SAYI 01
          </span>
        </div>
        <div className="mag-heading">
          <h1>
            Magazin<span>.</span>
          </h1>
          <p>
            Merak edenlere, keşfedenlere, <br />
            hayata başka bir yerden bakanlara.
          </p>
        </div>
        <div className="mag-intro">
          <span>Biraz doğa. Biraz hayat. Bolca ilham.</span>
          <span>
            <BookOpen size={14} /> Topluluğun okuma köşesi
          </span>
        </div>
      </header>

      <nav className="mag-filters" aria-label="Magazin kategorileri">
        {["Tümü", "Doğa", "Yaşam", "İlham"].map((item) => (
          <button
            key={item}
            aria-pressed={category === item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
        <span>
          {category === "Tümü"
            ? "BU SAYIDA 4 HİKÂYE"
            : `${articles.length} HİKÂYE`}
        </span>
      </nav>

      {category === "Tümü" && (
        <article className="mag-featured">
          <img
            src={featured.image}
            alt={featured.imageAlt}
            fetchPriority="high"
          />
          <div className="mag-featured-shade" />
          <div className="mag-featured-content">
            <span className="mag-kicker">
              <i /> KAPAK HİKÂYESİ <span> / </span>{" "}
              {featured.category.toLocaleUpperCase("tr")}
            </span>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <div className="mag-featured-bottom">
              <button
                className="mag-read-button"
                onClick={() => onRead(featured)}
              >
                Hikâyeyi oku <ArrowUpRight size={18} />
              </button>
              <span>
                <Clock3 size={13} /> {featured.minutes} dk okuma
              </span>
            </div>
          </div>
          <span className="mag-cover-number">01 / 04</span>
        </article>
      )}

      <section className="mag-stories" aria-label="Magazin yazıları">
        <div className="mag-section-heading">
          <h2>
            {category === "Tümü"
              ? "Sayfaları çevirmeye devam et."
              : `${category} üzerine hikâyeler.`}
          </h2>
          <span>OKUMAYA DEĞER</span>
        </div>
        <div className="mag-article-grid">
          {articles.map((article) => (
            <article className="mag-article-card" key={article.id}>
              <button
                className="mag-article-image"
                aria-label={`${article.title} yazısını oku`}
                onClick={() => onRead(article)}
              >
                <img
                  src={article.image}
                  alt={article.imageAlt}
                  loading="eager"
                />
                <span>
                  <ArrowUpRight size={21} />
                </span>
              </button>
              <div className="mag-article-meta">
                <span>{article.category.toLocaleUpperCase("tr")}</span>
                <span>{article.minutes} dk okuma</span>
              </div>
              <h3>
                <button onClick={() => onRead(article)}>{article.title}</button>
              </h3>
              <p>{article.excerpt}</p>
              <div className="mag-byline">
                <span>{article.author}</span>
                <span>{article.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <aside className="mag-editor-note">
        <span className="mag-note-icon">
          <BookOpen size={25} strokeWidth={1.4} />
        </span>
        <div>
          <span className="mag-kicker">EDİTÖRDEN</span>
          <p>İyi bir hikâye, dünyaya baktığımız yeri değiştirir.</p>
          <small>
            Bu köşede doğayı, gündelik hayatı ve birlikte büyümeyi konuşuyoruz.
          </small>
        </div>
        <ArrowRight size={23} />
      </aside>
      <p className="mag-demo-note">
        İlk sayıya hoş geldin. Bu sayfadaki yazılar demo için hazırlanmış örnek
        editoryal içeriklerdir.
      </p>
    </div>
  );
}

export function MagazineArticle({ article }) {
  return (
    <article className="mag-reader">
      <img
        className="mag-reader-image"
        src={article.image}
        alt={article.imageAlt}
      />
      <div className="mag-reader-content">
        <span className="mag-kicker">
          {article.category.toLocaleUpperCase("tr")} <span> / </span>{" "}
          {article.minutes} DK OKUMA
        </span>
        <h2>{article.title}</h2>
        <div className="mag-reader-byline">
          {article.author} <span>·</span> {article.date}
        </div>
        <p className="mag-reader-intro">{article.excerpt}</p>
        {article.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <div className="mag-reader-end">
          <Sprout size={21} />
          <span>Birlikte keşfet. Birlikte büyü.</span>
        </div>
      </div>
    </article>
  );
}
