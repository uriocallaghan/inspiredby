# Guia d'adaptació a mòbil d'Inspired by Magazine

Regles obligatòries perquè tots els articles i gràfics de la revista es llegeixin i es toquin tan bé en un telèfon com en un ordinador. Complementa `research/guia-estil-articles.md` i `research/sistema-infografic.md`.

---

## 1. El principi rector: espai real per llegir i mirar alhora

Un telèfon modern de `390×844 px` **no té 844 px disponibles**: amb la barra d'adreces i la barra inferior d'iOS Safari o Chrome Android visibles, l'alçada útil real (`100svh` / `100dvh`) baixa a **660–700 px** (i a ~560 px en pantalles compactes).

L'amplada útil dins `.page` (amb `20 px` de marge a cada banda) és de **350 px** per a `.fig` i **342 px** dins `.scrolly .graphic .gbox`.

A partir d'aquestes mides reals, regeixen tres regles innegociables:
1. **El text és tan important com el gràfic.** En una secció `.scrolly`, el lector ha de poder llegir un paràgraf sencer comodíssimament mentre veu el gràfic enganxat a dalt.
2. **Un gràfic horitzontal complex no s'encongeix: es transposa a vertical** (o es simplifica de veritat) quan l'amplada baixa de `640 px`.
3. **Cap interacció tàctil pot segrestar l'scroll de la pàgina** ni deixar el gràfic encallat.

---

## 2. Pressupost d'alçada del `.scrolly` en mòbil (`< 900 px`)

Quan el gràfic queda enganxat a dalt, cada píxel que ocupa el `.graphic` es resta directament de l'espai de lectura.

**La barra superior dels articles es queda sempre visible i el gràfic s'enganxa just a sota** (decisió de l'editor, 22-11-2026): `.graphic` fa `top: var(--ib-top)` (63 px: 3 de la barra de progrés + 60 de la barra) i, en escriptori, `height: calc(100dvh - var(--ib-top))`. Ho posen `assets/article.css` i `assets/ib.css`; si un article escriu el seu propi `.graphic` sticky, ha de fer servir `var(--ib-top)`, mai `top: 0`, o la barra el tapa. Compta aquests 63 px com a espai perdut quan calculis l'alçada del gràfic en mòbil.

### Límits obligatoris

| Element | Màxim recomanat (390×844) | Màxim absolut |
|---|---|---|
| **Contenidor `.graphic` sencer** (capçalera + gràfic + controls + dock) | **≤ 38–42 % del viewport** (`~320–355 px`) | **45 %** (`~380 px`) |
| **Àrea del canvas / SVG dins `.graphic`** | **220–260 px** (`clamp(200px, 30dvh, 260px)`) | **280 px** |
| **Espai lliure de lectura a sota** | **≥ 58 % del viewport** (`≥ 490 px` a 844; `≥ 340 px` a 664) | **≥ 55 %** |

> **Per què?** Un pas `.step-in` de dos paràgrafs en mòbil fa entre `240` i `340 px` d'alçada. Si `.graphic` ocupa `500–640 px` (com passa avui en diversos articles), en un mòbil real amb barra de Safari només queden `100–160 px` visibles per llegir: 3 o 4 línies de text.

### Com aconseguir-ho dins `.graphic` en mòbil (`@media (max-width: 899px)`)

1. **Alçada adaptativa al viewport, mai fixa:**
   ```js
   const mob = w < 600;
   const h = mob ? Math.round(Math.max(200, Math.min(window.innerHeight * 0.30, 260))) : 440;
   ```
   Si `.graphic` porta una fila de controls a sota (slider o botons), rebaixa el topall del gràfic a `Math.min(window.innerHeight * 0.26, 220)`.
2. **Capçalera `.vh` en una sola línia:**
   - Mostra només el títol `strong` (`17–18 px`, màx. 1–2 línies breus).
   - **Amaga `.graphic .vh span`** (subtítols descriptius) i **`.graphic .vh .lgs`** (llegendes de 2–3 línies) a `@media (max-width: 899px)` — no esperis a `max-height: 760px`, perquè a 844 px no s'activa i roba 70–110 px.
   - Si una llegenda de colors és imprescindible dins el `.scrolly`, compacta-la en 1 sola fila d'icones curtes o etiqueta directament dins el gràfic.
3. **Amaga `.graphic .src`** en mòbil dins dels `.scrolly` si no hi cap: només porta l'etiqueta del tipus de dada i l'enllaç a «Dades i fonts», on l'explicació del gràfic continua accessible (també des de l'enllaç de la capçalera). Als `.fig` fora de scroll, el peu es manté.
4. **Compacta `.tip.ibv-dock` dins `.graphic`:** en lloc de reservar sempre `32–38 px` buits sota un gràfic sticky, fes que només ocupi espai (o es superposi com a franja fina inferior) quan l'usuari toca el gràfic, o redueix el seu `margin-top` i `min-height` a `20 px` amb text d'una sola línia.
5. **No dupliquis `<canvas>` a l'HTML:** si el JS crea el canvas amb `IBV.canvas(el, w, h)`, deixa el contenidor buit a l'HTML (no posis un `<canvas>` previ dins `.plot-stack` que quedarà ocupant `150–175 px` en blanc a sobre del gràfic real).

### Espai i ritme dels `.step` (text) en mòbil

- Fes servir **unitats dinàmiques `dvh`** (`min-height: 75dvh; padding-bottom: 10dvh;`) en lloc de `vh` per evitar salts quan apareix o desapareix la barra del navegador.
- Mantén el text de cada pas **concís**: idealment 1–2 paràgrafs curts (`~180–300 px` d'alçada de `.step-in`) perquè el pas sencer càpiga dins la meitat inferior de la pantalla sense quedar mig tapat pel gràfic.
- El `.graphic` ha de tenir `background: var(--paper)` opac i una separació inferior nítida (`border-bottom: 1px solid var(--hair)`), amb un marge superior de respiració als `.step-in` (`padding: 18px 0 24px`).
- Al primer pas (`:first-child`), dona `min-height: 55dvh` i al final de `.steps`, `padding-bottom: 35dvh` perquè l'últim pas pugi prou amunt per llegir-se sencer abans que el gràfic es desenganxi.

---

## 3. Quan i com transposar gràfics horitzontals a vertical

A `350 px` d'amplada, comprimir un gràfic pensat per a `920 px` destrueix la llegibilitat: les barres queden de 4 px, els punts se solapen i les etiquetes s'atropellen.

La regla és senzilla: **per sota de `600–640 px`, canvia l'orientació del gràfic segons la seva família.**

### Matriu de decisió (horitzontal → vertical)

| Família de gràfic | Peça del sistema | A mòbil (`w < 600`) | Com es dibuixa |
|---|---|---|---|
| **Línia del temps amb fites** | TIME-15, cronologies | **Transposar a vertical** | Eix del temps de dalt a baix a l'esquerra (`x ≈ 48 px`); fites i etiquetes horitzontals netes a la dreta. Cada fita té almenys `40–44 px` d'alçada tàctil. |
| **Escala comparativa / logarítmica amb ítems** | SCALE-04 | **Transposar a vertical** | Cinta vertical a l'esquerra (`x ≈ 72 px`), cercles translúcids sobre l'eix i etiquetes horitzontals a la dreta sense col·lisions. |
| **Flux / Sankey** | LINK-03 | **Transposar a vertical** | Nodes i corrents de dalt a baix (`top → bottom`), amb amplada completa per als noms. *(Model a seguir: `#shunt-viz` de `virus-i-bacteris`.)* |
| **Columnes / barres verticals per categoria** | CASE-04, CASE-03, comparacions | **Transposar a files horitzontals** | Una fila per categoria amb el **nom a sobre de la barra** (`ml = 6 px`, `rowH = 44–52 px`) i l'escala ocupant tot l'ample (`330 px`). Mai reservar una columna esquerra de `120 px` que estrangula el gràfic i talla noms llargs. |
| **Dos gràfics o panells costat a costat** | Composites, comparadors | **Apilar en 1 columna** | `grid-template-columns: 1fr`. Mai comprimir un gràfic a `114 px` o `220 px` al costat d'un altre. |
| **Mètriques o KPIs en 3 columnes dins SVG** | Panells resum | **Apilar en files o graella 2+1** | Cada mètrica disposa d'amplada suficient perquè el títol no envaeixi la columna del costat. |
| **Calendari de calor / reixa d'anys** | TIME-07 | **3×4 o setmanes cap avall** | Anys en columnes i setmanes cap avall, o graella reduïda amb llista numerada a sota si cal. |
| **Petits múltiples / flors / radars** | CASE-05, CASE-09, CASE-08 | **2 per fila (o 1 si tenen etiquetes radials llargues)** | Marge suficient entre cel·les perquè les etiquetes de hover no envaeixin la figura veïna. |
| **Mapes geogràfics** | MAP-06, MAP-03..34 | **Mantenir horitzontal, retallar i simplificar** | Retallar la regió d'interès si cal, amagar etiquetes secundàries (màx. 3–5 noms), alçada proporcional (`0.55–0.75 * w`, mínim `210 px`). |
| **Talls físics / perfils** (oceà, atmosfera, relleu) | HOW-01 | **Mantenir horitzontal, simplificar anotacions** | El sentit físic (superfície–fons, oest–est) mana. Màx. 2–3 anotacions curtes per escena. |
| **Sèries temporals contínues** | TIME-02, TIME-03, TIME-04 | **Mantenir horitzontal, menys tics** | Màxim 4–5 tics a l'eix X (mai 12 mesos ni 8 tics logarítmics junts). Moure anotacions fora del marge dret o a sobre de la corba. |

### Patró recomanat per a barres/intervals amb etiquetes llargues

En desktop, l'etiqueta pot anar a l'esquerra (`ml = 150`). En mòbil (`w < 600`), **sempre a sobre de la fila**:

```js
const mob = w < 600;
const ml = mob ? 8 : 150, mr = mob ? 14 : 24;
const rowH = mob ? 48 : 30;
// A mob: nom a (ml, y - 8) en negreta 12px; barra/punt a y + 10 ocupant [ml, w - mr]
```

Això elimina d'un cop els talls pel marge esquerre (`"Infeccions respiratòries"`, `"1 Tessalonicencs"`, `"Els deixebles (Jerusalem)"`) i dona gairebé el doble d'amplada real a les dades.

---

## 4. Tipografia, etiquetes i prevenció de retalls

1. **Redibuix a amplada real sempre (`IBV.mount`):** mai un SVG amb `viewBox` fix que escali proporcionalment el text. Tota lletra ha de mesurar **≥ 11 px reals** a la pantalla (també dins els `<canvas>`).
2. **Clamp obligatori de coordenades a totes les etiquetes i anotacions:**
   Abans de col·locar un text o una `IBV.note` en mòbil, comprova els marges esquerre i dret:
   - Si `x > w * 0.62`, posa `anchor: "end"` i tira la línia guia cap a l'esquerra.
   - Si `x < w * 0.38`, posa `anchor: "start"` i tira la línia guia cap a la dreta.
   - En cap cas una línia d'anotació en mòbil pot superar ~26–30 caràcters sense saltar a una segona línia (`lines: [["Títol curt", true], ["detall breu"]]`).
3. **Menys etiquetes, no més petites:**
   - Màxim **2–3 anotacions simultànies** per escena o figura en mòbil.
   - Si dos punts queden a menys de `20 px`, etiqueta només el protagonista i deixa el secundari per al toc.
   - A l'eix X, màxim **4–5 tics** ben separats (p. ex. `gen · abr · jul · oct` en lloc dels 12 mesos; `0 · 10 · 1.000 · 100 mil` en lloc de 8 potències seguides).
4. **Prohibit `white-space: nowrap` en tooltips** (`.tip`): han de poder partir línia (`max-width: min(260px, calc(100vw - 32px))`) o, preferiblement, usar el dock fix `IBV.tip` (`.ibv-dock`).
5. **No usis `overflow-x: hidden` a `html`/`body` per amagar desbordaments:** corregeix l'element que surt fora.

---

## 5. Interacció tàctil (`pointer: coarse`) i accessibilitat

1. **Dianes tàctils mínimes de 44×44 px** (WCAG 2.5.5) en pantalles tàctils:
   - Tots els botons `.seg button`, `.playb`, presets i navegadors `← / →` han de tenir `min-height: 44px` i separació mínima de `8 px` entre si.
   - Tots els sliders `.rng` han de tenir `height: 40px` i un *thumb* de `22×22 px` en mòbil, i disposar com a mínim de `160 px` d'amplada útil (si l'etiqueta + valor l'estrenyen, posa el slider en la seva pròpia fila a 100 % d'amplada).
2. **Mai bloquejar l'scroll vertical de la pàgina:**
   - Els gràfics porten `touch-action: pan-y` (ja ho posa `IBV.hover`).
   - **No facis `ev.preventDefault()` al `pointerdown` sobre tota l'àrea d'un gràfic o mapa** (com a un comparador abans/després): restringeix l'arrossegament horitzontal (`touch-action: none`) **únicament al mànec del divisor** o a un control explícit, o detecta la direcció del gest (`|dx| > |dy|`) abans de capturar-lo.
   - Si un gràfic necessita arrossegar un punt en 2D (com un diagrama T–S), posa `touch-action: none` només sobre el punt arrossegable (amb diana de 44 px), no sobreescriguis amb `IBV.hover` el que cal arrossegar.
3. **Sempre tancar el hover/focus en tocar fora:**
   - Usa sempre `IBV.hover(target, onMove, onLeave)` — ja gestiona `pointerdown`, `touch-action: pan-y` i el tancament automàtic en tocar fora del gràfic.
   - **Prohibit** enganxar `.on("pointerenter pointerdown", ...)` manualment sense un listener de tancament en tocar fora: en mòbil deixa el gràfic atenuat (`opacity: 0.48`) i el tooltip encallat indefinidament.
   - Quan registris listeners globals (com `document.addEventListener("pointerdown", ...)`), fes-ho **una sola vegada fora de `IBV.mount`**, mai dins la funció `draw()` (per evitar acumular listeners en cada redimensionat).
4. **Precisió tàctil en gràfics densos:**
   - En núvols de punts, sèries de molts anys o barres estretes (`< 16 px`), busca el punt més proper amb `d3.Delaunay` o `d3.least` sobre un rectangle `hit` amb un radi mínim de **28–36 px** en mòbil.
   - En línies del temps o sèries amb molts passos discrets, ofereix botons `← Anterior` / `Següent →` (44 px) o un slider còmode.

---

## 6. Millores recomanades a `web/assets/article.css` (base compartida)

Aplicar aquest bloc a `web/assets/article.css` resol de forma centralitzada els problemes repetits a tots els articles:

```css
/* Touch targets accessibles (WCAG 2.5.5) */
@media (pointer: coarse) {
  .seg button, .playb, .ctl-row button { min-height: 44px; padding-block: 8px; }
  .rng { height: 40px; }
  .rng::-webkit-slider-thumb { width: 22px; height: 22px; margin-top: -11px; }
  .rng::-moz-range-thumb { width: 18px; height: 18px; }
}

/* Scrolly i lectura còmoda en mòbil */
@media (max-width: 899px) {
  .graphic {
    order: -1;
    height: auto;
    max-height: 45dvh;
    top: 0;
    z-index: 2;
    background: var(--paper);
    padding-block: 8px 6px;
    border-bottom: 1px solid var(--hair);
  }
  .graphic .vh { margin-bottom: 4px; }
  .graphic .vh span,
  .graphic .vh .lgs,
  .graphic .src { display: none; }
  .graphic .tip.ibv-dock { margin-top: 4px; padding-top: 4px; min-height: 20px; font-size: 12px; }
  .steps { padding-bottom: 35dvh; }
  .step { min-height: 75dvh; align-items: flex-end; padding-bottom: 8dvh; }
  .step:first-child { min-height: 55dvh; }
  .step-in { background: var(--paper); padding: 16px 0 20px; opacity: .35; }
}
```

*(Nota: posar `max-height: 45dvh` a `.graphic` obliga cada gràfic de `.scrolly` a respectar el pressupost d'alçada des del JS; mai ha de retallar un gràfic amb `overflow: hidden` — el JS ha de dibuixar dins l'alçada assignada.)*

---

## 7. Checklist obligatòria abans de publicar

Comprova cada article a **1440×900**, **390×844** (mòbil estàndard) i **390×664** (mòbil real amb barres de navegador):

- [ ] **Zero overflow horitzontal** (`document.documentElement.scrollWidth <= window.innerWidth`).
- [ ] **Pressupost `.scrolly` respectat:** `.graphic` ocupa **≤ 42 %** de l'alçada del viewport (~320–355 px a 844 px), deixant espai real per llegir els `.step` sencers.
- [ ] **Gràfics horitzontals complexos transposats:** timelines denses, Sankey, comparacions de moltes columnes i panells dobles passen a vertical o files apilades a `< 600 px`.
- [ ] **Text ≥ 11 px reals** en tots els SVG i Canvas (cap `viewBox` fix que redueixi mides).
- [ ] **Cap etiqueta tallada ni solapada** en cap pas del `.scrolly` ni en cap vista dels botons `.seg`.
- [ ] **Controls tàctils ≥ 44 px** (botons, segments, sliders amb amplada útil ≥ 160 px).
- [ ] **Scroll vertical sempre fluid** en tocar qualsevol gràfic; cap tooltip/focus encallat en tocar fora.
- [ ] **Zero errors a la consola.**
- [ ] **Mode fosc a 390 px:** el gràfic enganxat (`.graphic`) i els passos tenen fons fosc, cap text fosc sobre fosc i cap panell clar (el mode fosc el fa `assets/ib-theme.js`; no l'implementis a l'article).
