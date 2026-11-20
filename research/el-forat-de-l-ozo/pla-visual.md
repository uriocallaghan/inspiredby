# Pla visual: Com vam tancar el forat de l'ozó (`web/articles/el-forat-de-l-ozo/`)

Guies: `research/sistema-infografic.md`, `research/guia-estil-articles.md`, `research/guia-mobil.md`. Colors amb significat constant: **blau** = ozó (la capa que protegeix), **vermell** = el que la destrueix (clor, CFC, el forat), **groc** = llum del sol / UV, només en superfícies. Grisos per al context. Mai text en groc.

Mapes: tots són mapes **d'un hemisferi o del món** (sense relleu: el fenomen és atmosfèric i ocupa un hemisferi sencer; a aquesta escala el relleu és soroll). Terra plana `land`, mar en blanc de paper, projecció ortogràfica polar neta.

Dades reals: NASA Ozone Watch (àrea i mínim anual del forat, 1979–2025), KNMI/TEMIS MSR-2 (camp d'ozó total, mitjana d'octubre, 1979–2025), NOAA GML HATS (CFC-11 i CFC-12, 1977–2026), NOAA ODGI (2024), Col·lecció de Tractats de l'ONU (198 parts). Detall a `fonts.md` i `raw/`.

- **V1 · `#s-forat` (scrolly 1) · MAP-18 + MAP-07 (globus polar amb franges i isolínia):** «Quaranta-set primaveres sobre l'Antàrtida». L'hemisferi sud en projecció ortogràfica, des de sota. Camp d'ozó total de la mitjana d'octubre (MSR-2) en una rampa blava (més ozó = blau més fosc; per sota de 220 DU, vermell) amb la isolínia de 220 DU en vermell. Passos: 1979 (sense forat) → 1985 (Halley, Farman) → 1987 (Montreal) → 2006 (el pitjor) → 2025. Punts: Halley, McMurdo, pol Sud, Punta Arenas, Ushuaia. *Per què:* el forat és un objecte geogràfic i circular; el globus polar és la forma natural.

- **V2 · `#f-anys` (figura interactiva principal) · MAP-16 + TIME-01:** «Cada octubre, un mapa». El mateix globus amb un lliscant d'any (1979–2025) i «Reprodueix»; a sota, la sèrie anotada de l'àrea mitjana del forat (NASA) i del mínim d'ozó, amb l'any actual marcat i hover. Tocar la sèrie canvia el mapa. *Dades:* reals.

- **V3 · `#s-clor` (scrolly 2) · HOW-01 (tall de l'atmosfera amb partícules):** «Com un àtom de clor es menja l'ozó». Tall vertical de 0 a 50 km: nevera i esprai a terra → els CFC pugen durant anys → a l'estratosfera la UV en trenca el clor → cicle catalític (Cl + O₃ → ClO + O₂; ClO + O → Cl + O₂) → núvols estratosfèrics polars a l'hivern i sol de primavera. Partícules lentes. *Dades:* esquema; les xifres (30–35 km, 100.000 molècules) de NASA i EPA.

- **V4 · `#f-gruix` · SCALE-02 (quadrats/gruixos a escala):** «Tres mil·límetres». Gruixos reals si tot l'ozó es comprimís a la superfície: 300 DU = 3 mm, llindar 220 DU = 2,2 mm, mínim de cada any (lliscant). Barres dibuixades a mida física real (mm CSS) i una moneda de referència no; només regle mil·limetrat. Interactiu. *Dades:* reals (definició de la unitat Dobson i sèrie de mínims de la NASA).

- **V5 · `#f-cfc` · TIME-01 (sèrie anotada) + PART-01 (barra de progrés):** «El que diu l'aire». CFC-11 i CFC-12 a l'atmosfera (NOAA, 1977–2025) amb anotacions (Montreal 1987, màxim, frenada del 2013–2018 per emissions il·legals, represa de la baixada); a sota, la barra de l'índex ODGI per a l'Antàrtida: de 100 (màxim) a 71,6 el 2024; 0 = nivell de 1980. Hover. *Dades:* reals.

- **V6 · `#f-paisos` · MAP-03 (mapa del món) + SPREAD-03 (eixam en cronologia):** «198 signatures». Dues vistes (`.seg`): mapa del món (Equal Earth, terra plana) on cada país s'encén a l'any en què es va unir al Protocol, amb «Reprodueix» 1988–2019; i una cronologia on cada part és un punt, de Mèxic (1988) a Palestina (2019). Hover: país i data. *Dades:* reals (Col·lecció de Tractats de l'ONU).

- **V7 · `#f-evitat` · CASE-02 (halteres) / TIME amb dos camins:** «El món que vam evitar». Dues trajectòries de l'ozó mitjà mundial respecte del 1980: la real (recuperació cap al 2040, segons l'avaluació de 2022) i la simulada sense el Protocol (−17 % el 2020, −67 % el 2065; Newman et al. 2009), amb la radiació UV eritemàtica que es duplica a latituds mitjanes el 2060. *Dades:* esquema amb xifres reals; només es dibuixen els punts publicats i una corba suau entre ells, dit al peu.
