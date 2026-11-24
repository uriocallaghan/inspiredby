# Pla visual · Els quatre capitals de Pierre Bourdieu

Slug: `els-capitals-de-bourdieu`
Paleta fixa dins tot l'article:
- **Vermell** (`IBV.C.red` `#C8442A`): capital econòmic / protagonistes / bretxa més alta.
- **Blau** (`IBV.C.blue` `#2C5DA8`): capital cultural / titulació i gust legítim.
- **Groc** (`IBV.C.yellow` `#F5C518`): capital social / gust mitjà (sempre en superfícies o punts, mai en text ni línies fines).
- **Tinta i grisos** (`IBV.C.ink`, `ink2`, `muted`, `ghost`): capital simbòlic (el marc que legitima), context i eixos.
- Cap mapa regional a l'article (no cal `MAP-01`).

## Llista de gràfics

1. **V1 · LINK-05 + LINK-03 (`.scrolly`, 5 passos):** *Les quatre monedes i com es converteixen*.
   - **Peça del sistema:** `LINK-05` (cercles translúcids `multiply` amb tipografia neta) combinat amb `LINK-03` (fluxos corbats amb partícules lentes, recorregut ~25 s, aturades amb `IBV.reduced`).
   - **Per què aquesta forma:** els quatre capitals no són compartiments estancs, sinó reserves que se superposen i es transformen amb fricció. El scroll permet presentar-los d'un en un (econòmic, cultural en tres estats, social, simbòlic) i mostrar al cinquè pas els canals de conversió.
   - **Dades:** esquema conceptual basat en Bourdieu (1983/1986, *The Forms of Capital*) i Bourdieu (1972/1980, *Le Sens pratique*). Declarat «Esquema» al peu.

2. **V2 · CASE-01 (`.fig wide`, interactiu):** *Qui entrava a la universitat a França (1961–1962)*.
   - **Peça del sistema:** `CASE-01` (barres ordenades de tija fina i cercle, protagonista en vermell, commutador `.seg` entre «Probabilitat (%)» i «Quantes vegades més que un fill d'obrer» amb transició animada).
   - **Per què aquesta forma:** ordena set categories socioprofessionals amb una diferència de més de 80 vegades entre els extrems, fent visible la bretxa sense saturar. A mòbil (`w < 600`), etiqueta a sobre de la barra (`guia-mobil.md` §3).
   - **Dades:** dades reals de Bourdieu i Passeron (1964), *Les Héritiers*, capítol 1 (estadístiques d'ensenyament superior a França, 1961–1962). Declarat «Dades reals» al peu.

3. **V3 · SPREAD-02 (`.scrolly`, 4 passos):** *L'espai social de La Distinction*.
   - **Peça del sistema:** `SPREAD-02` (núvol de punts en dos eixos amb protagonistes destacats i anotacions en colze).
   - **Per què aquesta forma:** reprodueix fidelment el pla factorial de dos eixos de Bourdieu (vertical: volum global de capital; horitzontal: estructura entre capital cultural a l'esquerra i econòmic a la dreta), afegint-hi pas a pas les professions, els gustos i la frontera de la distinció.
   - **Dades:** esquema basat en el plànol de l'anàlisi de correspondències múltiples de Bourdieu (1979), *La Distinction* (enquesta de 1963 i 1967–1968 a 1.217 persones). Declarat «Esquema» al peu.

4. **V4 · CASE-02 (`.fig wide`, interactiu):** *Tres peces musicals, tres mons socials*.
   - **Peça del sistema:** `CASE-02` (halteres / punts units per línia sobre escala comuna 0–70 %, amb selector `.seg` per veure totes tres peces o aïllar cada obra).
   - **Per què aquesta forma:** permet llegir d'un sol cop la inversió exacta entre el *Danubi blau* (vermell, cau del 65 % al 3 %) i el *Clave ben temperat* de Bach (blau, puja de l'1 % al 21 %) a mesura que creix el capital escolar, mentre *Rhapsody in Blue* (groc) es manté al mig. A mòbil, nom del grup a sobre de cada fila.
   - **Dades:** dades reals de l'enquesta de Bourdieu (1979), *La Distinction* (taules de preferències musicals segons classe social i titulació). Declarat «Dades reals» al peu.

5. **V5 · CASE-01 (`.fig wide`, interactiu):** *Les set classes del Regne Unit en tres capitals*.
   - **Peça del sistema:** `CASE-01` (barres ordenades reordenables amb `.seg` entre «Renda familiar mitjana (£)» i «Pes a la població (%)», amb codi de color per perfil de capital i detall dels tres capitals al dock de hover).
   - **Per què aquesta forma:** mostra per què la divisió en tres classes ja no explica una societat on hi ha grups rics però poc connectats (*classe mitjana tècnica*) i grups joves amb renda baixa però alt capital cultural emergent (*treballadors emergents de serveis*).
   - **Dades:** dades reals de Savage et al. (2013), *Sociology* 47(2), taules 5 i 6 (mostra representativa nacional GfK i *Great British Class Survey*). Declarat «Dades reals» al peu.
