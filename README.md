# krzysztofterminal.pl

Statyczna strona (landing page) hostowana na **GitHub Pages** — domena `krzysztofterminal.pl`.

## Build (Tailwind CSS + JS)

Produkcyjne pliki są budowane lokalnie, a GitHub Pages serwuje gotowe artefakty:
- **CSS** — Tailwind kompilowany do `dist/styles.css` (zamiast runtime CDN).
- **JS** — źródła z `src/` minifikowane przez esbuild do `assets/consent.js` i
  `assets/analytics.js` (bez komentarzy — mniej kodu w „pokaż źródło strony").

### Wymagania
- Node.js

### Po każdej zmianie w `index.html`, `src/input.css` lub `src/*.js`:
```bash
npm install   # tylko za pierwszym razem
npm run build # buduje CSS (dist/styles.css) i JS (assets/*.js)
```
Artefakty `dist/styles.css` oraz `assets/consent.js` / `assets/analytics.js` są
**commitowane** — GitHub Pages serwuje gotowe pliki i nie uruchamia buildu.
Podgląd CSS na żywo: `npm run watch:css`.

> Edytuj logikę w `src/consent.js` / `src/analytics.js` (nie w zbudowanych `assets/*.js`).

## Struktura projektu
- `index.html` — strona
- `src/input.css` — wejście Tailwind + style własne
- `tailwind.config.js` — konfiguracja (kolory marki, skanowane pliki)
- `dist/styles.css` — wynik buildu (commitowany)
- `src/consent.js`, `src/analytics.js` — źródła JS (GA4 / Consent Mode / zdarzenia / błędy)
- `assets/consent.js`, `assets/analytics.js` — zbudowane (zminifikowane) wersje JS
- `assets/img/` — obrazy (oraz `icons/` z ikonami UI)
- `assets/favicons/` — favicony i ikony aplikacji

## Analityka (GA4)
Identyfikator pomiaru ustawiony w `index.html` (`GA_MEASUREMENT_ID`). GA4 działa zgodnie
z Google Consent Mode v2 — dane zbierane dopiero po zgodzie w banerze cookie.
W panelu GA4 oznacz zdarzenie **`generate_lead`** jako kluczowe (konwersja).
