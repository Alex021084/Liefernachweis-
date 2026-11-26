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


## PDF-Sperrverhalten – Korrektur
Bereits unterschriebene und gesperrte Liefernachweise lassen sich über „PDF erstellen“ erneut als PDF-Vorschau öffnen und speichern. Der Datensatz bleibt dabei unverändert und weiterhin gegen Bearbeitung geschützt.


## Lieferort auf der PDF
Der Lieferort kann getrennt nach Straße/Hausnummer und PLZ/Ort erfasst werden. Beide Angaben werden zusammen auf der PDF ausgegeben. Bei „Wie Rechnungsadresse“ wird die vollständige Rechnungsanschrift übernommen.


## Materialauswahl – überarbeiteter Ablauf
- Alle Materialien werden direkt im Materialdialog als Kacheln angezeigt.
- Bereits übernommene Materialien sind grün markiert; darunter steht die bisher erfasste Menge.
- Die Mengenansicht verwendet die Schaltfläche „Übernehmen“ und führt danach zurück zur Materialauswahl.
- Weitere Materialien können nacheinander ergänzt werden. Mit „Fertig“ wird der Dialog geschlossen.
- Lieferort und Zeitstempel bleiben im Ablauf verfügbar.
