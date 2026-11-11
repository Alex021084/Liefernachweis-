# Dählmann Liefernachweis – Version 100

Fehlerbehebung für das Fortsetzen über die Startabfrage:
- Formularansicht wird sofort aktiviert, bevor der Entwurf geladen wird.
- Der Entwurf wird anschließend geladen und Schritt 2 „Material und Mengen“ geöffnet.
- Falls ein optionales Feld beim Wiederherstellen fehlschlägt, werden Auftraggeber, Datum, Bauvorhaben und Materialien über einen Fallback geladen, statt auf der Startseite zu bleiben.
- Alle übrigen Funktionen aus Version 99 bleiben enthalten.

`index.html` lädt `app-v100.js`. Beide Dateien gemeinsam hochladen.
