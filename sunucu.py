# -*- coding: utf-8 -*-
"""
Yerel test sunucusu — Kutay Aydemir kişisel sitesi.

Bu betik, bulunduğu klasörü küçük bir web sunucusuyla yayınlar ve siteyi
tarayıcıda açar. GitHub Pages'te olacağı hâle en yakın test yöntemi budur.

Çalıştırmak için:
    Baslat.bat dosyasına çift tıkla
veya bu klasörde bir terminal açıp:
    python sunucu.py

Durdurmak için bu pencerede Ctrl+C.

Not: Tarayıcı önbelleği kapatıldı; bir dosyayı kaydedip F5'e bastığında
yeni hâli hemen gelir, "eski hâli görünüyor" derdi olmaz.
"""

import http.server
import os
import socket
import sys
import threading
import webbrowser

KOK = os.path.dirname(os.path.abspath(__file__))
ILK_PORT = 8899
PORT_DENEME = 20


class Handler(http.server.SimpleHTTPRequestHandler):
    """Site klasörünü servis eder, önbelleği kapatır, çıktıyı sadeleştirir."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=KOK, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, bicim, *args):
        # Basarili istekleri susturup sadece hatalari goster (404 gibi).
        try:
            kod = int(args[1])
        except (IndexError, ValueError, TypeError):
            return
        if kod >= 400:
            sys.stderr.write("  ! %s  ->  %s\n" % (args[0], args[1]))


def bos_port_bul():
    """ILK_PORT'tan baslayarak ilk musait portu dondurur."""
    for port in range(ILK_PORT, ILK_PORT + PORT_DENEME):
        s = socket.socket()
        try:
            s.bind(("127.0.0.1", port))
            return port
        except OSError:
            continue
        finally:
            s.close()
    return None


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
    except Exception:
        pass

    if not os.path.isfile(os.path.join(KOK, "index.html")):
        print("")
        print("  HATA: index.html bu klasorde bulunamadi.")
        print("  Klasor: " + KOK)
        print("  sunucu.py dosyasini index.html ile ayni klasorde tut.")
        return 1

    port = bos_port_bul()
    if port is None:
        print("")
        print("  HATA: %d-%d araliginda bos port yok." % (ILK_PORT, ILK_PORT + PORT_DENEME - 1))
        print("  Acik olan diger sunuculari kapatip tekrar dene.")
        return 1

    adres = "http://localhost:%d/" % port
    sunucu = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)

    print("")
    print("  Kutay Aydemir - kisisel site / yerel test sunucusu")
    print("  " + "-" * 50)
    print("  Klasor  : " + KOK)
    print("  Adres   : " + adres)
    print("")
    print("  Tarayici birazdan acilacak.")
    print("  Bir dosyayi duzenleyip kaydettikten sonra sayfada F5'e bas.")
    print("  Durdurmak icin: Ctrl+C")
    print("")

    threading.Timer(0.7, lambda: webbrowser.open(adres)).start()

    try:
        sunucu.serve_forever()
    except KeyboardInterrupt:
        print("")
        print("  Sunucu durduruldu.")
    finally:
        sunucu.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
