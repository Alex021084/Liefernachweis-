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


## Materialauswahl – Layoutkorrektur
- Das Materialfenster ist deutlich breiter und höher, damit auch größere Materiallisten bequem passen.
- Kacheln erscheinen in drei Spalten auf breiten Displays und zwei Spalten auf schmaleren Displays; die Liste ist scrollbar.
- Ausgewählte bzw. bereits übernommene Materialien werden deutlich grün hervorgehoben.


## Lieferort-Dialog
Die zusätzliche Checkbox „Lieferort für diesen Nachweis speichern“ wurde entfernt. Der eingegebene Lieferort wird direkt für die aktuelle Lieferung übernommen.


## Korrektur: Material geliefert
Die Auswahl „Material geliefert“ wird nun zusätzlich intern festgehalten, auch während der Lieferort-Dialog geöffnet und bestätigt wird. Beim Übernehmen der Menge wird dadurch zuverlässig der Typ „Material geliefert“ gespeichert und nicht „Material ab Grube/Lager“.


## Materialauswahl – Auswahl pro Öffnung zurücksetzen
Jede neue Öffnung des Materialdialogs startet mit einer leeren Auswahlrunde. Materialien, die in einer vorherigen Runde bereits übernommen wurden, bleiben im Liefernachweis erhalten, werden in der neuen Auswahl aber nicht mehr grün markiert und zeigen dort keine alte Mengenangabe. Innerhalb der aktuellen Runde bleiben übernommene Kacheln grün und zeigen ihre Mengen.


## Korrektur: Checkbox ist maßgeblich für die Materialkategorie
Beim Übernehmen der Menge wird der Status der sichtbaren Checkbox „Material geliefert“ direkt ausgewertet. Dadurch kann ein gesetzter Haken nicht durch einen veralteten internen Status überschrieben werden; das Material wird als „Material geliefert“ gespeichert. Ohne Haken wird es weiterhin „Material ab Grube/Lager“ zugeordnet.


## Korrektur Material geliefert und Datum
- Der Haken „Material geliefert“ wird beim Antippen der Materialkachel zusätzlich als eigener Status gesichert und beim Übernehmen der Menge ausgewertet.
- Das Datum im ersten Schritt ist direkt antippbar; der iPhone-/iPad-Datumsauswahldialog lässt sich über das gesamte Datumsfeld öffnen.


## Materialstatus und PDF-Kategorien – erneute Korrektur
- Der Checkbox-Status wird bei jeder Änderung (input und change) unmittelbar übernommen.
- Die Auswahl wird beim Antippen einer Materialkachel für genau diesen Mengeneintrag gesichert.
- Die Logik gilt sowohl für „Material geliefert“ als auch für „Material abgefahren“.
- Bei Material Annahme führt gesetzter Haken zum PDF-Abschnitt „Material abgefahren und entsorgt“; ohne Haken zum Abschnitt „Material entsorgt“.
- Eine vorhandene Lieferadresse setzt den Haken bei einer neuen Auswahlrunde nicht automatisch.
