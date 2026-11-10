# Dählmann – Liefernachweis (Version 75)

Statische Web-App für GitHub Pages mit Startbildschirm für Liefernachweis und Stammdaten. Kundendaten, Bauvorhaben, Materialstammdaten und gespeicherte Liefernachweise werden lokal im Browser (localStorage) gespeichert. PDF-Erstellung nutzt pdf-lib über CDN und die mitgelieferte Vorlage.

## Veröffentlichung mit GitHub Pages
1. Alle Dateien aus diesem Ordner direkt in das Hauptverzeichnis (Root) des neuen Repositorys hochladen: `index.html`, `app.js`, `styles.css`, `manifest.json`, `logo.png`, `template.png`.
2. In GitHub: **Settings → Pages**.
3. Unter **Build and deployment** `Deploy from a branch` wählen.
4. Branch `main`, Ordner `/ (root)` auswählen und **Save** drücken.
5. Die veröffentlichte Adresse nach Abschluss unter Settings → Pages öffnen.

Hinweis: Diese erste Version speichert Daten nur auf dem jeweiligen Gerät/Browser. Noch keine Supabase-Anbindung und keine geräteübergreifende Synchronisierung.


Version 75: In der PDF-Vorschau bleibt „Zurück zur Bearbeitung“ oben rechts. Der doppelte Zurück-Button unten wurde entfernt; „PDF speichern“ steht dort nun mittig.

Version 75: Beim Speichern der PDF wird auf iPad/iPhone der iOS-Teilen-/Speichern-Dialog geöffnet (z. B. „In Dateien sichern“). Auf unterstützten Desktop-Browsern erscheint der native Dateiauswahldialog. Der Dateiname lautet „Auftraggeber - LN Erstellerdatum - Bauvorhaben.pdf“; gängige Rechtsformzusätze werden im Auftraggeber-Dateinamen entfernt.
