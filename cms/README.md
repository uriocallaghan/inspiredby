# CMS de l'editor

Editor de text propi a `https://inspiredbymagazine.com/admin/`. Serveix per fer canvis petits de text (paraules, frases, títols, descripcions de la portada) i per deixar comentaris a l'agent, sense passar per Claude Code.

## Eines de la barra

- **Punter (V), per defecte:** navegues com a la web; no hi ha selector de pàgines, s'hi arriba navegant. Clicar una targeta o un enllaç a un article l'obre dins l'editor; les àncores fan scroll; els enllaços de fora s'obren en una pestanya nova.
- **Text (T):** cada paràgraf, títol o peu es pot editar clicant-hi. Negreta i cursiva, desfer i refer.
- **Comentari (C):** subratlles text i hi deixes una nota per a l'agent. (Amb qualsevol eina, si selecciones text surt la pastilla «Comenta».)
- **Publica (⌘S):** revisió paraula a paraula i commit a `main`.

## Com funciona

```
navegador (/admin/)  ──POST /api/cms/*──▶  Netlify Function (netlify/functions/cms.mjs)
   iframe amb la pàgina real                  ├─ comprova la sessió (galeta xifrada) i l'origen
   + barra inferior                           ├─ llegeix i escriu a GitHub (main) a través de Git Gateway de Netlify
                                              └─ cada desat = 1 commit «Editor (CMS)» a main
                                                        │
GitHub main ──▶ Netlify publica la web  ◀───────────────┘
            └─▶ Action «Sincronia de la web» (sync-home.mjs: temps de lectura, portada, sw.js)
```

- **Versió que mana:** sempre `main` a GitHub. El CMS no guarda res enlloc més (els canvis sense publicar es queden al navegador, a `localStorage`, fins que es publiquen).
- **Què s'envia en publicar:** per a cada bloc, «deia X, ara ha de dir Y». El servidor llegeix l'últim `main`, busca el bloc que encara diu X i el canvia per Y, sense tocar cap altra línia. Si Claude Code ha canviat un altre paràgraf entretant, es combinen. Si ha canviat **el mateix** paràgraf, no es publica res i el CMS ensenya les dues versions perquè l'editor triï.
- **Atomicitat:** el commit es fa sobre el `main` llegit (`force: false`); si `main` s'ha mogut entremig, es torna a llegir i a combinar (fins a 4 vegades).
- **Què es pot editar:** a cada article, els `p`, `h1`–`h6`, `li`, `figcaption`, `dt`, `dd`, `blockquote`, `td`, `th` que només tenen text i format en línia (negreta, cursiva, enllaços, cites). No: la línia del temps de lectura, la barra, el peu comú ni res dins de gràfics. A la portada: el títol i la descripció de cada targeta (es desa a `web/index.html` i a `web/articles.json` al mateix commit).
- **Comentaris:** subratllar un tros de text i escriure una nota. Es desen a `cms/comentaris.json` (fora de `web/`, no es publiquen a la web; el repositori és públic, però, i es veuen a GitHub). L'agent els llegeix amb `node scripts/comentaris.mjs` i, quan n'ha fet un, l'esborra amb `node scripts/comentaris.mjs resol <id>`; el CMS el treu sol en uns 30 segons.

## Seguretat

- **Login: Netlify Identity amb Google** (les credencials de Google les posa Netlify: no cal Google Cloud). Registre **només per invitació**: ningú més no es pot crear un compte.
- Identity torna a la portada amb el token a l'URL (`#access_token=…`); `assets/ib-theme.js` el passa a `/admin/`, que l'envia una sola vegada al servidor i l'esborra de l'URL. El servidor pregunta a Identity de qui és el token i només deixa entrar els correus de `CMS_ALLOWED_EMAILS`. Si un correu se'n treu, les sessions obertes deixen de valer a l'instant.
- Sessió: galeta `__Host-ib_cms` **HttpOnly, Secure, SameSite=Strict**, **xifrada** (AES-256-GCM), 12 hores. Dins hi ha el token d'Identity, que el servidor renova sol cada hora; el JavaScript de la pàgina no el veu mai. Canviar `CMS_SESSION_VERSION` tanca totes les sessions.
- **Escriptura a GitHub: Git Gateway de Netlify.** La funció crida `/.netlify/git/github/*` amb el token d'Identity de l'editor; Netlify hi posa el seu accés a GitHub. Ningú no ha de crear cap token de GitHub. (Si algun dia es defineix `GITHUB_TOKEN`, es fa servir aquest en lloc de Git Gateway.)
- Cada petició: només `POST` JSON amb la capçalera `X-IB-CMS` i `Origin` igual al domini (contra CSRF). Les respostes no es guarden mai en memòria cau (tampoc al service worker).
- L'HTML que arriba es valida al servidor: només etiquetes en línia d'una llista tancada, sense `on*`, sense `javascript:`, sense `<script>`/`<style>`; text pla a la portada. Els camins de fitxer es construeixen al servidor (cap camí arbitrari).
- `/admin/` porta CSP estricta (cap script de fora), `frame-ancestors 'none'`, `noindex`. Cap dependència externa al servidor (només Web Crypto).

## Configuració a Netlify (ja feta el 22-11-2026)

- Identity activat al lloc `inspiredby-magazine`, amb Google com a proveïdor extern i registre només per invitació.
- Git Gateway activat (Identity → Services → Git Gateway) sobre `uriocallaghan/inspiredby`.
- Variables d'entorn: `CMS_ALLOWED_EMAILS` (el correu de l'editor) i `CMS_SESSION_SECRET` (aleatori). Opcionals: `CMS_ORIGIN` (per defecte `https://inspiredbymagazine.com`), `CMS_ALLOWED_SUBS`, `CMS_SESSION_VERSION`.
- Per donar accés a una altra persona: invitar-la a Identity **i** afegir el seu correu a `CMS_ALLOWED_EMAILS`.

## Provar-lo en local

```
node cms/dev-server.mjs        # http://localhost:8788/admin/ — botó «Entra (mode local)»
node --test cms/test/          # proves del servidor (login, origen, combinació, conflictes, sanejador)
```

El servidor local treballa sobre una còpia temporal de `web/`: no toca el repositori ni GitHub.
