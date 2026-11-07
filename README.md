# Dählmann – Liefernachweis

Statische Web-App für GitHub Pages. Kundendaten, Bauvorhaben, Materialstammdaten und gespeicherte Liefernachweise werden lokal im Browser (localStorage) gespeichert. PDF-Erstellung nutzt pdf-lib über CDN und die mitgelieferte Vorlage.

## Veröffentlichung mit GitHub Pages
1. Alle Dateien aus diesem Ordner direkt in das Hauptverzeichnis (Root) des neuen Repositorys hochladen: `index.html`, `app.js`, `styles.css`, `manifest.json`, `logo.png`, `template.png`.
2. In GitHub: **Settings → Pages**.
3. Unter **Build and deployment** `Deploy from a branch` wählen.
4. Branch `main`, Ordner `/ (root)` auswählen und **Save** drücken.
5. Die veröffentlichte Adresse nach Abschluss unter Settings → Pages öffnen.

Hinweis: Diese erste Version speichert Daten nur auf dem jeweiligen Gerät/Browser. Noch keine Supabase-Anbindung und keine geräteübergreifende Synchronisierung.
