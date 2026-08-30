# kutayzku.github.io

Kişisel site ve portföy — <https://kutayzku.github.io>

Portföy bölümlerinin yanı sıra, bilgisayarın nasıl çalıştığını anlatan interaktif bir
laboratuvar bölümü içerir: bit gösterimi, mantık kapıları, yarım toplayıcı, adım adım
izlenebilen bir mini işlemci ve soyutlama katmanları.

Türkçe / İngilizce ve koyu / açık tema desteklenir. Bağımlılık ve derleme adımı yoktur.

## Kullanılanlar

HTML, CSS, JavaScript (çerçevesiz), Canvas 2D.

## Yapı

```
index.html
css/style.css
js/
  i18n.js      TR / EN metinler
  lab.js       laboratuvar modülleri
  main.js      dil, tema, gezinme, arka plan
assets/
```

## Geliştirme

```
python sunucu.py
```

Klasörü `localhost:8899` üzerinden yayınlar, tarayıcıyı açar ve önbelleği kapatır.
Windows'ta `Baslat.bat` aynı işi yapar.

Metinler `js/i18n.js` içindedir; `tr` ve `en` sözlüklerinde aynı anahtar bulunmalıdır.
Eksik anahtarda `index.html` içindeki hazır metin korunur.

CSS ve JS dosyaları `?v=` sürüm parametresiyle bağlanır. Bu dosyalarda değişiklik
yapıldığında `index.html` içindeki numara artırılmalıdır; aksi hâlde tarayıcı eski
sürümü önbellekten sunar.

## İletişim

<kutayzku@gmail.com> · [LinkedIn](https://www.linkedin.com/in/kutay-aydemir-5b3b19219/) · [itch.io](https://kutayzku.itch.io/)
