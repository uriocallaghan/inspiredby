# CMS de l'editor

Editor de text propi a `https://inspiredbymagazine.com/admin/`. Serveix per fer canvis petits de text (paraules, frases, títols, descripcions de la portada) i per deixar comentaris a l'agent, sense passar per Claude Code.

## Com funciona

```
navegador (/admin/)  ──POST /api/cms/*──▶  Netlify Function (netlify/functions/cms.mjs)
   iframe amb la pàgina real                  ├─ comprova la sessió (galeta signada) i l'origen
   + barra inferior                           ├─ llegeix i escriu a GitHub (main) amb un token que només viu aquí
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

- Login amb **Google Identity Services**. El servidor comprova la signatura RS256 del token amb les claus públiques de Google, l'emissor, l'audiència (el nostre client ID), la caducitat, el correu verificat i un **nonce d'un sol ús**.
- Només entren els correus de `CMS_ALLOWED_EMAILS` (i, si hi és, l'identificador fix de Google de `CMS_ALLOWED_SUBS`). Si un correu se'n treu, les sessions obertes deixen de valer a l'instant.
- Sessió: galeta `__Host-ib_cms` **HttpOnly, Secure, SameSite=Strict**, signada amb HMAC-SHA256, 12 hores. Canviar `CMS_SESSION_VERSION` tanca totes les sessions.
- Cada petició: només `POST` JSON amb la capçalera `X-IB-CMS` i `Origin` igual al domini (contra CSRF). Les respostes no es guarden mai en memòria cau (tampoc al service worker).
- El **token de GitHub** només el té la funció (variable d'entorn de Netlify); el navegador no el veu mai. Ha de ser *fine-grained*, només d'aquest repositori i només amb permís *Contents: read and write*.
- L'HTML que arriba es valida al servidor: només etiquetes en línia d'una llista tancada, sense `on*`, sense `javascript:`, sense `<script>`/`<style>`; text pla a la portada. Els camins de fitxer es construeixen al servidor (cap camí arbitrari).
- `/admin/` porta CSP estricta, `frame-ancestors 'none'`, `noindex`. Cap dependència externa al servidor (només Web Crypto).

## Posar-lo en marxa (una sola vegada)

1. **Google Cloud Console** → APIs i serveis → Credencials → *Crea credencials* → *ID de client d'OAuth* → tipus *Aplicació web*.
   - Orígens de JavaScript autoritzats: `https://inspiredbymagazine.com`
   - (no cal cap URI de redirecció)
   - Copia l'**ID de client** (acaba en `.apps.googleusercontent.com`).
2. **GitHub** → Settings → Developer settings → *Fine-grained personal access tokens* → *Generate new token*.
   - Repository access: *Only select repositories* → `uriocallaghan/inspiredby`
   - Permissions → Repository → *Contents: Read and write* (res més).
3. **Netlify** → el lloc `inspiredby-magazine` → Site configuration → Environment variables (àmbit *Functions*):

   | Variable | Valor |
   |---|---|
   | `GOOGLE_CLIENT_ID` | l'ID de client del pas 1 |
   | `CMS_ALLOWED_EMAILS` | el teu correu de Google |
   | `CMS_SESSION_SECRET` | 48+ caràcters aleatoris (`openssl rand -base64 48`) |
   | `GITHUB_TOKEN` | el token del pas 2 (marca-la com a secreta) |
   | `CMS_ORIGIN` | `https://inspiredbymagazine.com` (opcional, és el valor per defecte) |
   | `CMS_ALLOWED_SUBS` | opcional: el teu identificador fix de Google, per blindar-ho encara més |

4. Torna a publicar (Deploys → *Trigger deploy*) perquè la funció agafi les variables. Obre `/admin/`.

## Provar-lo en local

```
node cms/dev-server.mjs        # http://localhost:8788/admin/ — botó «Entra (mode local)»
node --test cms/test/          # proves del servidor (login, origen, combinació, conflictes, sanejador)
```

El servidor local treballa sobre una còpia temporal de `web/`: no toca el repositori ni GitHub.
