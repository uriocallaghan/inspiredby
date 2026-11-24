# Fonts i verificació: El cercle del kula

Article: `web/articles/el-cercle-del-kula/` · generat amb `python3 research/el-cercle-del-kula/build.py` (text a `cos.html`, fonts a `fonts.py`). Verificació feta el 24-11-2026.

## Fonts llegides directament

| Clau | Font | Com s'ha verificat |
|---|---|---|
| `malinowski` | Malinowski, B. (1922). *Argonauts of the Western Pacific*. Routledge (reimpr. 1966). | Text complet d'archive.org (`argonautsofweste00mali`, OCR) llegit als passatges citats: cap. III (pp. 81–104), llista cronològica d'esdeveniments, pp. 47, 77–80, 176–191, 267–268, 386–387, 488–489, 499. Les pàgines surten de les capçaleres de l'OCR. |
| `mauss` | Mauss, M. (1925). «Essai sur le don». *L'Année sociologique*, n. s., 1, 30–186. | Edició digital de Les classiques des sciences sociales (UQAC), còpia d'archive.org (`marcel-mauss-essai-sur-le-don`). Llegits: taula de matèries, les tres obligacions, el text de Tamati Ranaipiri, el kula («une sorte de grand potlatch»), les conclusions (invitació, assegurança social, *homo oeconomicus*), dret xinès, celta, germànic (wadium), romà (nexum), hindú (Anuçasanaparvan), Fiji (tambua), Nova Caledònia (pilou). |
| `kuehling21` | Kuehling, S. (2021). «Winds and seas». *Austronesian Paths and Journeys*, ANU Press, 231–274. DOI 10.22459/APJ.2021.09 | DOI comprovat a Crossref; PDF obert (press-files.anu.edu.au) llegit sencer. |
| `kuehling25` | Kuehling, S. (2025). «Women and Kula». *Suomen Antropologi* 49(1), 4–25. DOI 10.30676/jfas.143800 | DOI i resum comprovats a Crossref; PDF obert (journal.fi) llegit en els passatges citats. |
| `sahlins` | Sahlins, M. (1972). *Stone Age Economics*, cap. 5. Reedició Routledge 2017, DOI 10.4324/9781315184951 | DOI comprovat a Crossref; text llegit (definicions de reciprocitat generalitzada, equilibrada i negativa, pp. 193–196; apèndix sobre les Trobriand, pp. 241–242). |
| `geertz` | Geertz, C. (1967). «Under the Mosquito Net». *The New York Review of Books*, 14-9-1967. | URL comprovada; text llegit. |
| `umista` | U'mista Cultural Society. «Collection History». | URL comprovada; text llegit. És la veu de la comunitat kwakwaka'wakw. |

Posicions de les comunitats: Nominatim (OpenStreetMap), consulta del 24-11-2026 (`nominatim.json` al scratchpad, valors a `web/articles/el-cercle-del-kula/dades.js`). Duau és orientativa.

Relleu: `node scripts/relleu.mjs --bbox 149.9,-11.2,154.0,-8.2 --st 0.008 --mn -60 --mx 2480 --var KU_DEM --out web/articles/el-cercle-del-kula/relleu-massim.js`.

## Afirmació → font (les principals)

- Collarets en el sentit del rellotge, braçalets en el contrari; «uns quants milers» de socis; llengües diferents → `malinowski` pp. 81–86.
- Més de trenta illes, almenys 10.000 persones, més de mil objectes de cada tipus → `kuehling21` p. 235 i p. 249–250.
- Més de 2.000 persones hi viatgen; objectes partits en dos després de la guerra → `kuehling21` p. 262.
- 213, 154, 150 i 304 parells (1918) → `malinowski` pp. 386–387; seixanta canoes de Dobu → pp. 267–268; uns 800 parells → p. 489.
- Nou de cada deu braçalets massa petits; més de la meitat en préstec → `malinowski` p. 88.
- Ningú no se'l queda més d'un any o dos; volta de dos a deu anys; copes esportives → `malinowski` pp. 94–95.
- vaga, yotile, basi, kudu, pokala, kaributu → `malinowski` pp. 98–100.
- «Fa el kula com si fos gimwali»; equivalència decidida per qui torna; «posseir és donar» → `malinowski` pp. 96–97.
- Set classes d'intercanvi i exemples → `malinowski` pp. 176–191.
- «Hi és a dins i no pot veure el conjunt» → `malinowski` p. 83.
- Dones de les Amphlett, «old hags», terrissa → `malinowski` p. 47 (Kuehling 2025 cita la p. 49 d'una altra edició).
- Kibu Tokunuwesi, nadons amb nom d'objectes → `kuehling21` pp. 250–251.
- Hospitalitat com a «benefici», paper de les dones → `kuehling21` p. 257 i `kuehling25` (resum i cos).
- Telèfon i barques pagades des de la ciutat → `kuehling25`.
- L'onada del 2018 que salta les Amphlett; «pèrdua de temps i de diners» a Tubetube; arròs i llaunes; recuperar l'ulai → `kuehling21` pp. 264–266.
- Tres obligacions, hau, «grand potlatch», invitació, assegurança social, *homo oeconomicus* → `mauss`.
- Potlatch: «donar» en chinook, testimonis, prohibició del 19-4-1884, 1921 Village Island (45 detinguts, 20 a la presó, objectes confiscats), supressió el 1951, recuperació des de finals dels cinquanta → `umista`.
- Diari en polonès (1914–1915, 1917–1918), publicat el 1967, menyspreu i insults racistes → `geertz`.

## No verificat directament o deixat fora

- **Annette Weiner (1976)**, *Women of Value, Men of Renown*: no s'ha pogut llegir el llibre (archive.org només en préstec). El que en diu l'article (els intercanvis de farcells de fulla de plataner, *doba*, de les dones de les Trobriand) ve de Kuehling (2025), i així consta a la Metodologia.
- **Kuehling (2017)**, «"We die for kula"», *JPS* 126(2), DOI 10.15286/jps.126.2.181-208 (verificat a Crossref): no s'ha pogut llegir; no se'n cita res. La història de Kibu ve de Kuehling (2021), que hi remet.
- **Malinowski (1935)**, *Coral Gardens and Their Magic*: Kuehling (2025) en cita una confessió («lured by the dramatic…»); no s'ha trobat a l'OCR consultat i s'ha deixat fora.
- **Humphrey (1985)** sobre el mite del bescanvi (DOI 10.2307/2802221): no s'ha pogut llegir; s'ha deixat fora.
- L'any de la represa del kula després de la guerra no consta a la font («since the war»); a la cronologia es dibuixa el 1946 i es diu.
- Les dates del braçalet Kibu («finals dels anys seixanta») es dibuixen el 1968.

## Revisió crítica (24-11-2026): canvis i el que s'ha deixat fora

Aplicat, amb verificació a la font:
- «Objectes que ningú no es pot quedar» → «que s'han de fer passar»; Malinowski (p. 94) només hi troba un o dos objectes guardats com a herència a les Trobriand, i el Kibu amb prou feines s'ha mogut en gairebé quaranta anys (Kuehling 2021, p. 251).
- Fora «no serveix per aconseguir res útil» i el metatext de la introducció.
- El cercle és un model: els objectes avancen per camins (<i>'eda</i>/<i>keda</i>, Kuehling 2021, p. 241); les Amphlett «feien» de pont (p. 265).
- 1918: 154 braçalets aconseguits a Kiriwina, només trenta de To'uluwa, el març (Malinowski, pp. 474–475); la flota s'endu 304 + 344 = 648 braçalets segons el recompte a la platja (p. 391). A la p. 489 Malinowski parla d'«uns 800 parells»: es fa servir el recompte detallat i la discrepància s'explica a «Els gràfics».
- Terrissa de les Amphlett: «veritables obres mestres», i Malinowski només hi va veure treballar dones molt grans (pp. 284–288).
- Abans de la guerra: el que estava reservat a caps i líders era el privilegi de viatjar a socis llunyans (Kuehling 2021, p. 262, citant Swadling i Bence 2016).
- Mauss contra el «regal pur» (Essai, «au fond inapplicable») i rectificació de Malinowski a <i>Crime and Custom</i> (1926, pp. 40–41, llegit a archive.org).
- Hau: el text de Tamati Ranapiri el va recollir Elsdon Best (1909); Mauss el llegeix de segona mà. Crítiques de Lévi-Strauss i Firth i lectura de Sahlins («The Spirit of the Gift», 1969/1972, pp. 149–160): el hau com a fruit o rendiment del regal. Mauss escriu «Ranaipiri»; l'article fa servir la grafia de Best i Sahlins, «Ranapiri».
- Sahlins: l'assaig sobre la reciprocitat és del 1965 (Banton, ed.), recollit el 1972; DOI dels capítols comprovats a Crossref (10.4324/9781315184951-4 i -5).
- Present etnogràfic: les regles de Malinowski, en passat i situades a les Trobriand. «A Dobu diuen» en lloc de «els illencs diuen». Treball de camp de Malinowski a les Trobriand: 1915–1916 i 1917–1918.
- Potlatch reduït a un paràgraf dins el §5, sense noms; «la major part» a Ottawa i Toronto; retorns del Museu Nacional, del ROM (1988) i del museu de l'Smithsonian (U'mista).
- Pàgines de Kuehling 2021 corregides (mapa de pàgines del PDF): 10.000 illencs, trenta illes i la canoa, p. 247; herència «idealment», p. 235.
- «Milne Bay» tret (no hi havia font); el text diu «arxipèlag Massim», com Malinowski.

Deixat fora (no verificat):
- Els <i>kitoum</i>, objectes amb amo que es poden posar o treure del kula (Damon 1983 a Leach i Leach, eds., <i>The Kula</i>; Weiner 1992, <i>Inalienable Possessions</i>): no s'han pogut llegir. Tampoc no surten a Kuehling 2021 ni 2025. L'article només diu que s'han de fer passar i les excepcions verificades.
- Parry (1986), <i>Man</i> 21(3): no llegit; no se'n cita res.
- L'entrada en vigor de la llei del potlatch (1-1-1885): no consta a U'mista; només es dona el 19-4-1884.
