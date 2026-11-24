# Pla visual · Els quatre capitals de Pierre Bourdieu

Slug: `els-capitals-de-bourdieu`
Paleta fixa dins tot l'article:
- **Vermell** (`IBV.C.red` `#C8442A`): capital econòmic; la bretxa de PISA.
- **Blau** (`IBV.C.blue` `#2C5DA8`): capital cultural, títols, escola.
- **Groc** (`IBV.C.yellow` `#F5C518`): capital social / gust mitjà (només superfícies, mai text ni línies fines).
- **Tinta i grisos**: professions, context i eixos.
- Cap mapa geogràfic a l'article (no cal `MAP-01`).

Revisió del 24-11-2026. L'editor va trobar els gràfics «molt genèrics» i, després, l'esquema dels capitals «un mapa esotèric» i el conjunt «massa simple». Diagnòstic: hi havia poques dades i massa esquemes. Decisió: menys esquemes i dades denses de debò (l'espai social sencer, PISA alumne per alumne, les set variables de Savage). L'esquema dels capitals se suprimeix; els cinc paràgrafs dels capitals queden com a text.

## Llista de gràfics

1. **V2 · PART-01 en gira-sol (`.fig wide`):** *Qui entrava a la universitat a França (1961–1962)*.
   - **Forma:** set discos de 1.000 punts; els fills que arriben a la universitat s'encenen en blau des del cor (àrea = taxa). Arc «42 vegades més probable».
   - **Dades:** Bourdieu i Passeron (1964), *Les Héritiers*, cap. 1. «Dades reals».

2. **V6 · SPREAD-04 (`.fig wide`, selector OCDE / Espanya):** *L'herència a l'aula: PISA 2022*.
   - **Forma:** pols de punts, un per alumne de la mostra (índex ESCS × nota de matemàtiques), amb la mitjana de cada quart socioeconòmic i la bretxa en vermell.
   - **Per què:** els 93 punts de l'informe es veuen com una massa de centenars de milers d'alumnes que s'inclina.
   - **Dades:** microdades PISA 2022 de l'OCDE (fitxer d'alumnes), processades amb `research/els-capitals-de-bourdieu/pisa_proc.py`. «Dades reals».

3. **V3 · SPREAD-02 + LINK-02 (`.scrolly`, 4 passos):** *L'espai social de La Distinction*.
   - **Forma:** el mapa sencer de Bourdieu, 24 professions (punt i nom) i 22 pràctiques (cursiva, en blau o vermell segons el pol), sobre una trama de punts que dibuixa la definició dels eixos (volum en gris que es parteix en cultural i econòmic: el quiasme). En passar per una pràctica, fils fins a les tres professions més properes. Al pas 4, la frontera de la distinció (il·lustrativa) que puja.
   - **Dades:** posicions aproximades llegides de la reproducció de Nicolas Lardot a Wikimedia Commons (CC BY-SA 3.0) del diagrama de *La Distinction*; és el model teòric de Bourdieu, no un pla factorial directe. «Esquema».

4. **V4 · CASE-09 (`.fig wide`, selector `.seg`):** *Tres peces musicals, tres mons socials*.
   - **Forma:** cinc flors amb tija, un pètal per obra; arrel quadrada; arc = 100 %.
   - **Dades:** *La Distinction* (1979). «Dades reals».

5. **V5 · CASE-09 + PART-01 (`.fig wide`):** *Les set classes del Regne Unit en tres capitals*.
   - **Forma:** una flor per classe amb set pètals (renda, estalvis, habitatge en vermell; cultura «alta» i emergent en blau; prestigi i nombre de contactes en groc), llargada = arrel del valor sobre el màxim de les set classes; sota terra, un punt per cada 1 % de la població.
   - **Dades:** Savage et al. (2013), *Sociology* 47(2), taules 5 i 6. «Dades reals».
