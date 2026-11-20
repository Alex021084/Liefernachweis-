# Dählmann – Liefernachweis

Aufgeräumte Projektfassung auf Basis der bisherigen Version 106.

## Dateien
- `index.html` – Einstiegspunkt der Web-App
- `app.js` – JavaScript der App
- `styles.css` – Gestaltung und Layout
- `logo.png` – Logo für Oberfläche und PDF
- `manifest.json` – Web-App-Manifest

## Start / Bereitstellung
Alle fünf Dateien gemeinsam in denselben Webserver-Ordner hochladen und `index.html` öffnen.

Die App lädt `pdf-lib` und bei Bedarf `tesseract.js` weiterhin extern über CDN.
Die alten nummerierten Zwischenstände wurden aus diesem aufgeräumten Paket entfernt.


## Version 109 – Quelle für Wiegenoten-Fotos
- Beim Tippen auf „Wiegenote scannen“ erscheint eine Auswahl: „Kamera“ oder „Foto auswählen“.
- Kamera öffnet die rückseitige Kamera auf unterstützten Mobilgeräten.
- Foto auswählen öffnet die Fotomediathek bzw. Dateiauswahl.
- Beide Wege verwenden dieselbe OCR-Erkennung.


## Version 110 – sicherere Feldzuordnung
- Keine beliebigen Nachbarzeilen mehr als Kundenname übernehmen (verhindert z. B. „Schaufeln“ im Kundenfeld).
- Material wird nur bei plausiblen Texttreffern übernommen; OCR-Zeichenmüll bleibt leer.
- Gedruckter Firmenname Dählmann Erdbau GmbH wird gezielt erkannt.
- Baustellenfeld bleibt leer, da handschriftliche Angaben ignoriert werden.
