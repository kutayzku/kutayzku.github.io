# Kutay Aydemir — Kişisel Site

Junior Game Developer & Bilgisayar Mühendisi kişisel portföy sitesi.
Ayrıca **"Bilgisayar Nasıl Düşünür?"** adında, bilgisayar mantığını sıfırdan anlatan
tamamen interaktif bir laboratuvar bölümü içerir.

Çerçeve (framework) yok, derleme adımı yok, bağımlılık yok — saf **HTML + CSS + JavaScript**.

---

## İçindekiler

| Bölüm | Ne var |
|---|---|
| **Hero** | Animasyonlu logo, fareyi takip eden arka plan, yazı efekti |
| **Hakkımda** | CV özeti + hızlı bilgi kartları |
| **Laboratuvar** | 5 interaktif modül (aşağıda) |
| **Yetenekler** | 4 kategoride teknik yetkinlikler |
| **Projeler** | 7 proje kartı |
| **Yolculuk** | Eğitim + staj zaman çizelgesi |
| **İletişim** | E-posta (yaz / kopyala), GitHub, LinkedIn, itch.io, CV indirme |

### Laboratuvar modülleri

1. **Bit Laboratuvarı** — 8 anahtara tıkla, decimal / hex / binary / ASCII karşılığını canlı gör. Adını yaz, bilgisayarın gördüğü ikilik hâlini gör.
2. **Mantık Kapıları** — AND, OR, XOR, NOT, NAND, NOR. SVG devre şeması, yanan teller, canlı doğruluk tablosu.
3. **Yarım Toplayıcı** — XOR + AND ile `1 + 1 = 10`'un nasıl çıktığı.
4. **Mini İşlemci** — Gerçek çalışan bir CPU simülasyonu: getir → çöz → çalıştır. PC / IR / ACC kayıtları, ALU, adım adım veya otomatik çalıştırma, "işlemcinin iç sesi" logu.
5. **Soyutlama Katmanları** — Senin kodundan transistöre inen 8 katman, her biri tıklanabilir.

### Ek özellikler

- **Türkçe / İngilizce** dil değiştirme (sağ üstteki `EN` / `TR` düğmesi) — tüm site, laboratuvar dâhil
- **Koyu / açık tema** değiştirme (logo da temaya göre değişir)
- Tercihler tarayıcıda hatırlanır (`localStorage`)
- Tamamen mobil uyumlu
- Klavye erişilebilirliği, `prefers-reduced-motion` desteği, yazdırma stili

---

## Dosya yapısı

```
.
├── index.html          # tüm sayfa iskeleti
├── css/
│   └── style.css       # tüm stiller (tema değişkenleri en üstte)
├── js/
│   ├── i18n.js         # TR/EN metin sözlüğü  ← metinleri buradan değiştir
│   ├── lab.js          # laboratuvar modüllerinin mantığı
│   └── main.js         # dil, tema, gezinme, animasyonlar
├── assets/
│   ├── logo.png            # orijinal logo (beyaz zeminli, sosyal medya önizlemesi için)
│   ├── logo-dark.png       # koyu tema logosu (beyaz çizgili, şeffaf)
│   ├── logo-clear.png      # açık tema logosu (siyah çizgili, şeffaf)
│   ├── favicon-src.png     # sekme ikonu
│   └── Kutay_Aydemir_CV.docx
├── sunucu.py           # yerel test sunucusu (siteyle ilgisi yok)
├── Baslat.bat          # sunucu.py'yi cift tiklamayla calistirir
├── .nojekyll           # GitHub Pages'in klasörleri olduğu gibi sunması için
└── README.md
```

---

## GitHub'da yayınlama

Sitenin adresi **`https://kutayzku.github.io/`** olacak şekilde ayarlandı
(CV'ndeki portföy linkiyle aynı). Bunun için depo adının **tam olarak
`kutayzku.github.io`** olması gerekiyor.

### 1. Depoyu oluştur

GitHub'da yeni bir depo aç:

- **Repository name:** `kutayzku.github.io`
- **Public** seç
- README/gitignore ekleme (zaten var)

### 2. Bu klasörü yükle

Bu klasörün içinde bir terminal aç ve sırayla çalıştır:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Kisisel site"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/kutayzku/kutayzku.github.io.git
```

```bash
git push -u origin main
```

### 3. Pages'i aç

GitHub'da depoya git → **Settings** → **Pages** →
**Source: Deploy from a branch**, **Branch: `main` / `(root)`** → **Save**.

1–2 dakika içinde site `https://kutayzku.github.io/` adresinde yayında olur.

> Depoyu başka bir isimle (örneğin `portfolio`) açarsan site
> `https://kutayzku.github.io/portfolio/` adresinde çıkar. O durumda
> `index.html` içindeki `og:url` satırını da güncellemen yeterli;
> geri kalan tüm yollar göreli olduğu için çalışmaya devam eder.

---

## Yerelde test etme

**En kolay yol:** `Baslat.bat` dosyasına **çift tıkla**. Küçük bir sunucu açılır ve
site tarayıcında kendiliğinden gelir. Kapatmak için açılan siyah pencerede `Ctrl+C`.

Terminalden çalıştırmak istersen aynı şeyi yapar:

```bash
python sunucu.py
```

Ne yapıyor:

- Bu klasörü `http://localhost:8899` adresinde yayınlar (port doluysa 8900, 8901… diye devam eder)
- Tarayıcıyı otomatik açar
- **Önbelleği kapatır** — bir dosyayı düzenleyip kaydettikten sonra sayfada `F5`'e bastığında
  eski hâli değil yeni hâli gelir
- Konsolda sadece hataları (404 gibi) gösterir, gereksiz log basmaz

> `index.html` dosyasına doğrudan çift tıklamak da çoğunlukla çalışır, ama sunucu üzerinden
> test etmek GitHub Pages'teki gerçek duruma daha yakındır. Alışkanlık olarak bunu kullan.

`Baslat.bat` ve `sunucu.py` sadece yerel test içindir; sitenin çalışmasıyla ilgileri yoktur.
GitHub'a gitmelerinde bir sakınca yok, istemezsen `.gitignore` dosyasına ekleyip dışarıda bırakabilirsin.

---

## Nasıl güncellerim?

| Ne değiştirmek istiyorsun | Nereye bak |
|---|---|
| Herhangi bir yazı / cümle | `js/i18n.js` — hem `tr:` hem `en:` bölümünde aynı anahtarı düzenle |
| Yeni proje eklemek | `index.html` içindeki `<!-- PROJECTS -->` bölümüne bir `<article class="proj card">` kopyala, metinlerini `js/i18n.js`'e ekle |
| Renkler | `css/style.css` en üstteki `:root { ... }` değişkenleri |
| CPU'nun çalıştırdığı program | `js/lab.js` içindeki `PROG` dizisi |
| Bir projeye yayın/depo linki eklemek | `index.html` içinde ilgili karta `<a class="proj-link">` bloğunu kopyala |
| Yeni bir mantık kapısı | `js/lab.js` içindeki `GATES` dizisi |

Bir metni değiştirdiğinde **iki dilde de** güncellemeyi unutma; aksi hâlde
İngilizce sürümde Türkçe metin görünür (kod, eksik anahtarda Türkçeye düşer).

---

## Notlar

- **"Bana yaz" düğmesi** bir `mailto:` bağlantısıdır — tıklayan kişinin bilgisayarındaki varsayılan e-posta uygulamasını (Outlook, Mail, Thunderbird…) senin adresin ve konu satırı hazır şekilde açar. Sunucu ya da form yok, hiçbir veri hiçbir yere gitmez. Bazı bilgisayarlarda varsayılan e-posta uygulaması tanımlı olmadığı için hiçbir şey açılmayabilir; bu yüzden yanına **"E-postayı kopyala"** düğmesi koydum — o, adresi doğrudan panoya kopyalar ve her yerde çalışır.
- **Arka plan** artık tüm sayfayı kaplıyor ve fareyi takip ediyor: noktalar imleçten nazikçe kaçıyor, yakındakiler imlece çizgiyle bağlanıyor, tüm alan çok hafif bir parallaks yapıyor ve imlecin arkasında yumuşak bir ışık geziyor. Hero'dan aşağı indikçe otomatik olarak sönümleniyor ki okumayı bölmesin. Dokunmatik cihazlarda ve `prefers-reduced-motion` açıkken devre dışı kalır.
- Ayarları `js/main.js` içindeki `initBackground` fonksiyonundan değiştirebilirsin: `R` imlecin itme yarıçapı, `LINK` imlece bağlanan çizgilerin menzili, `bg.calm` satırındaki `0.40 + 0.55 * f` ise arka planın genel görünürlüğü.

---

© Kutay Aydemir
