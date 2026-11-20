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


## Version 111 – Wiegenoten-Scanner entfernt
- Scan-Button, Kamera-/Mediathek-Auswahl, OCR-Prüfdialog und zugehörige OCR-Verarbeitung entfernt.
- Materialerfassung, Selbstabholer sowie Material geliefert/abgefahren bleiben bestehen.


## Version 112 – Navigation aufgeräumt
- Den unteren Button „Stammdaten“ auf der Liefernachweis-Übersicht entfernt.
- „Startseite“ bleibt allein und ist als größerer, gelber Button hervorgehoben.


## Version 113 – einheitlicher Startseite-Button
- Ein gemeinsamer Startseite-Button sitzt jetzt direkt oben unter dem Logo und bleibt beim Scrollen sichtbar.
- Auf allen Ansichten gleiche Größe, Schrift, gelbe Farbe und Position.
- Doppelte Startseite-Buttons am unteren Rand und im Formular wurden entfernt.


## Version 114 – Startseite und gespeicherte Liefernachweise
- Auf der eigentlichen Startseite gibt es keinen zusätzlichen Startseite-Button mehr.
- In der Übersicht „Gespeicherte Liefernachweise“ wurde „Neuer Liefernachweis“ oben entfernt.
- An dessen Stelle steht eine große gelbe Startseiten-Kachel mit schwarzer Schrift.


## Version 115 – kompakte Startseiten-Kachel
- Startseiten-Kachel in der Übersicht auf etwa ein Viertel der verfügbaren Breite verkleinert.
- Links ausgerichtet, mit kompakter Höhe und weiterhin gelbem Hintergrund sowie schwarzer Schrift.


## Version 116 – Reparatur der Navigation
- App-JavaScript auf den letzten bekannten funktionierenden Stand zurückgesetzt; die bestehenden Daten- und Archivfunktionen bleiben erhalten.
- „Liefernachweis erstellen“ ist wieder mit der ursprünglichen Erstellfunktion verbunden.
- Die gespeicherten Liefernachweise werden wieder regulär über die Archivansicht gerendert.
- Die Startseiten-Kachel erscheint ausschließlich in der Archivansicht, kompakt linksbündig, gelb mit schwarzer Schrift.
- CSS- und JavaScript-Cache-Version auf 116 angehoben, damit Safari die aktualisierten Dateien lädt.


## Version 117 – Fehler beim Starten eines neuen Liefernachweises behoben
- Der alte Event-Handler für den entfernten `newBtn` wurde abgesichert. Das fehlende Element hatte zuvor einen JavaScript-Fehler ausgelöst und die restliche App-Initialisierung abgebrochen.
- Dadurch werden Formularinitialisierung, Archivdarstellung und weitere Event-Handler wieder ausgeführt.
- Startseiten-Kachel in der Archivansicht bleibt kompakt, gelb und linksbündig.


## Version 118 – Start-Button mit zusätzlicher Ereignisbehandlung
- Ein zusätzlicher Klick-Handler wird nach dem App-Skript im Capture-Modus registriert.
- Der Handler ruft die bestehende Formular-Startfunktion direkt auf und verhindert, dass ein veralteter Button-Handler den Klick verschluckt.
- Falls die Formularinitialisierung weiterhin fehlschlägt, wird die konkrete Fehlermeldung angezeigt statt dass scheinbar nichts passiert.
- JavaScript-Syntax mit Node geprüft.


## Version 119 – Formularnavigation
- Den unteren Button „Abbrechen“ im ersten Formularschritt entfernt.
- Oben im Formular eine kompakte gelbe „Startseite“-Kachel mit schwarzer Schrift ergänzt.
- Beim Wechsel zur Startseite wird ein laufender Entwurf zuvor automatisch gespeichert.
- JavaScript-Syntax geprüft; Cache-Version auf 119 erhöht.


## Version 120 – zweizeiliger Speicherhinweis
- Der Autospeicher-Hinweis steht jetzt oberhalb des Startseiten-Buttons und wird durch eine begrenzte Breite auf zwei Zeilen umbrochen.
- Die Startseiten-Kachel sitzt darunter; die übrige Formularnavigation bleibt unverändert.


## Version 121 – Speicherstatus auf zwei Zeilen
- Der rechte Autospeicher-/Entwurfshinweis ist auf eine feste schmalere Breite gesetzt, damit auch kurze Statusmeldungen zweizeilig umbrechen.
- Der Startseiten-Button bleibt links darunter und wird durch die zusätzliche Zeilenhöhe nach unten versetzt.


## Version 122 – gleiche Höhe für Startseite und Speicherhinweis
- Startseiten-Kachel und Autospeicherstatus befinden sich jetzt nebeneinander in einer gemeinsamen Zeile.
- Die Kachel ist links, der zweizeilige Hinweis rechts; beide sind vertikal mittig auf gleicher Höhe ausgerichtet.


## Version 123 – Startseite-Kachel zentriert
- Beschriftung und Haussymbol der gelben Startseite-Kachel werden horizontal und vertikal mittig ausgerichtet.
- Größe, Farbe und Position der Kachel bleiben unverändert.
