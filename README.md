# Dählmann – Liefernachweis

## Projektdateien
- `index.html` – Einstiegspunkt der Web-App
- `app.js` – Anwendungslogik
- `styles.css` – Gestaltung und Layout
- `logo.png` – Logo
- `manifest.json` – Web-App-Manifest

## Bereitstellung
Alle fünf Dateien gemeinsam in denselben Webserver-Ordner hochladen und anschließend `index.html` öffnen.

Die Anwendung lädt die benötigte PDF-Bibliothek weiterhin extern über das in `index.html` eingebundene CDN.

## Enthaltene Anpassungen
- Bauvorhaben vollständig aus Erfassung, Stammdaten, Archiv und PDF-Ausgaben entfernt.
- Archivierte Liefernachweise werden direkt je Auftraggeber angezeigt.
- Im Lieferort-Dialog kann „Wie Rechnungsadresse“ ausgewählt werden.
