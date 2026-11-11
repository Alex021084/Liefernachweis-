# Dählmann Liefernachweis – Version 102

- Startseite links und Speicherstatus rechts auf einer gemeinsamen Kopfzeile.
- Erklärungstext unter „Material und Mengen“ entfernt.
- Neuer Button „Wiegenote scannen“ oberhalb der Materialbuttons.
- Fotoaufnahme und OCR-Erkennung der gedruckten Felder (Bon-Nr., Kunde, gedruckte Baustelle, Material, Gewicht, Fahrzeug, Datum, Uhrzeit). Handschrift und Unterschrift werden ignoriert.
- Erkannte Daten können vor Übernahme geprüft und korrigiert werden.
- Wiegenoten werden einzeln als „Material geliefert“ mit Zeitstempel aus dem Bon und Lkw-Kennzeichen gespeichert.
- Kennzeichen erscheint in der Materialliste und im PDF.
- OCR lädt Tesseract.js und das deutsche Sprachmodell beim ersten Scan aus einem CDN; dafür ist Internetverbindung erforderlich.

`index.html` lädt `app-v102.js`. Beide Dateien gemeinsam hochladen.
