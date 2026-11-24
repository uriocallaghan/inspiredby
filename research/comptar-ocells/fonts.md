# Fonts i verificació · Comptar ocells

Totes les fonts s'han obert el 24-11-2026. Els DOI s'han comprovat a Crossref (el de l'USGS, a DataCite). Les claus són les de `fonts.py`.

## Afirmació → font

| Afirmació de l'article | Font | Com s'ha comprovat |
|---|---|---|
| Recompte entre el 14 de desembre i el 5 de gener; començat el dia de Nadal del 1900 per proposta de Frank M. Chapman, com a alternativa a caçar; 27 persones, 25 recomptes | `hist` | Pàgina d'Audubon llegida (text extret) |
| Caceres de Nadal per equips; 27 participants, 25 llocs dels EUA i el Canadà, 89 espècies; Manhattan, un dels llocs del 1900; el 1987, quota per publicar els resultats | `mag125` | Article d'Audubon Magazine (2024) llegit |
| Chapman va fer la proposta en un article de *Bird-Lore* del 1900; temporada 73: 20.373 observadors en 1.031 cercles; equips de caçadors que competien | `s125` | Resum de la temporada 125 llegit |
| Temporada 126: 2.701 recomptes (473 Canadà, 2.051 EUA, 177 Amèrica Llatina, Carib i Pacífic) i 85.222 participants, rècord | `s126` | Resum de la temporada 126 llegit |
| 3.138 cercles inscrits a la temporada 126 | `arcgis` | Capa pública consultada (només codi, nom i coordenades) |
| Cercle de 24,1 km; no dissenyat per seguir poblacions, l'esforç s'ha de corregir; densitat de cercles i població; 37 % de Maryland; la sèrie més llarga i estesa de l'hemisferi occidental | `dunn` | Text complet (BioOne, accés obert) |
| S'anoten les hores, les persones, la distància i el mitjà de transport (a peu, cotxe, barca) | `readme` | PDF d'Audubon llegit |
| BBS: rutes de 39,2 km, 50 parades cada 800 m, 3 minuts, radi de 400 m, sobretot al juny | `bbs` | Pàgina del catàleg de dades de l'USGS |
| BBS: unes 2.500 persones, gairebé totes voluntàries; 4.500 rutes; des del 1966 | `usgs` | Pàgina de l'USGS |
| BBS: l'idea d'un biòleg del govern per vigilar els pesticides, amb una xarxa d'aficionats | `sauer` | Resum (OpenAlex) |
| SOCC: ICO i Generalitat, 2002; +200 participants; 161 espècies; 3 km, 6 trams, 4 censos al matí; tria de l'itinerari; +600 dissenyats, +200 sense col·laborador | `socc` | Pàgines de socc.cat llegides |
| 644 itineraris, 436 amb col·laborador actiu | `soccapi` | Dades del web del SOCC |
| Indicadors: forestals +8,9 %, oberts −33,8 %, humides −16,1 %, agrícoles −3,6 %, estèpics −42,4 % | `soccind` | Pàgina d'indicadors i dades JSON |
| Oreneta vulgar al SOCC: disminució moderada (−0,7 %/any llarg termini, −2,8 % curt termini) | `socctend` | Taula de tendències de primavera |
| eBird, 2002; primera llista el 8 de maig del 2002; regla de la llista completa | `ebird20` | Pàgina dels 20 anys d'eBird |
| Més de 2.000 milions d'observacions, 150 milions de llistes, més d'un milió d'usuaris | `cornell` | Cornell Chronicle (19-8-2025) |
| Dades d'eBird obertes | `gbifeod` | Descripció del conjunt a GBIF |
| 254 espècies, 1975–2004, centre d'abundància 1,03 km/any cap al nord | `lasorte` | Resum (OpenAlex) |
| 58 % de 305 espècies cap al nord; mitjana ~35 milles (56 km); prats: 10 de 26 al nord, 9 al sud | `aud2009` | Nota de premsa d'Audubon llegida |
| Índex de temperatura de la comunitat | `devictor08` | Resum (OpenAlex) |
| Europa 1990–2008: ocells 37 km, papallones 114 km, temperatura 249 km (37 + 212) | `devictor` | Resum a nature.com |
| 2.900 milions menys (29 %), 529 espècies, radar −13,6 % (2007–2017), prats −53 %, zones humides +13 %, ànecs i oques +56 %, gestió i protecció d'aiguamolls, dades del BBS i del recompte de Nadal i agraïment als voluntaris; taula 1 per al gràfic | `rosenberg` | Manuscrit acceptat dels autors (PDF de l'American Bird Conservancy); les xifres coincideixen amb el resum publicat |
| eBird, 495 espècies, 2007–2021, 75 % baixen, més on són més abundants | `johnston` | Resum (OpenAlex) |
| Factors humans regionals: ~18 % del desplaçament del centre d'abundància | `lasorte` | Resum (OpenAlex) |
| A Catalunya, abandonament de conreus, incendis i urbanització pesen tant com la temperatura en els indicadors | `clavero` | Resum i mètodes (Europe PMC, PMC3080866; atles 1999–2002) |
| Biaixos d'eBird: espacial, esforç, espècies apuntades; les llistes completes milloren més | `johnston21` | Resum (OpenAlex) |
| Llista completa: totes les espècies identificades; s'ha de declarar | `ebhelp` | Pàgina d'ajuda d'eBird |
| eBird el gestiona el Cornell Lab | `ebabout` | Pàgina «About» d'eBird |
| Oreneta: cria a gairebé tota l'Amèrica del Nord i Euràsia; hiverna a l'Amèrica Central i del Sud | `bow` | Introducció de Birds of the World (accés obert) |
| SOCC iniciat el 2002 per l'ICO i el Departament de Medi Ambient i Habitatge | `enc` | Enciclopèdia Catalana |
| Participació gratuïta des del 2012 | `faq` | Preguntes freqüents d'Audubon |

## Discrepàncies entre fonts

- **Espècies del primer recompte:** Audubon Magazine en dona 89; la pàgina «About» d'Audubon diu «unes 90». S'ha triat la xifra exacta.
- **Desplaçaments d'espècies concretes (Audubon 2009):** dues versions de la mateixa nota de premsa donen xifres diferents per al pinsà porprat i altres espècies (433 o 313 milles). No s'ha fet servir cap xifra per espècie; només el 58 %, les 305 espècies i la mitjana d'unes 35 milles, que coincideixen a totes dues.
- **Participants del SOCC:** el web diu «+200 participants»; una presentació de l'ICO en parla d'uns 300. S'ha fet servir la xifra del web.
- **Indicadors del SOCC:** el web dona el canvi de la tendència (p. ex. −42,4 %); el gràfic mostra l'índex del 2024 menys 100 (−43 %). Es diu al peu del gràfic.
- **Cercles inscrits (3.138) i recomptes fets (2.701):** la capa d'Audubon inclou cercles que no van fer el recompte. Es diu al text i al peu.
- **eBird a GBIF** dona menys registres que el total d'eBird (exclou espècies sensibles i arriba amb retard). Es diu al peu.

## No verificat o deixat fora

- Corregit després de la revisió: sí que hi ha font per a l'enviament de la llista a *Bird-Lore* (`mag125#4`, `s125#1`), i ara surt al text.
- Les xifres de participació del recompte de Nadal any per any: no hi ha cap sèrie oberta (el portal històric d'Audubon demana credencials). Per això no hi ha gràfic de participants.
- Devictor et al. (2012), Diamond (1966), La Sorte i Thompson (2007), Sauer et al. (2017) i Johnston et al. (2025): només s'ha llegit el resum; totes les xifres citades hi són.
- Que els cercles es concentrin a l'est dels Estats Units, la costa del Pacífic i el sud del Canadà és una observació del mapa (dades reals), no d'una font.

## Revisió crítica (24-11-2026)

Aplicat i verificat: frase de la «novetat» i paràgraf dels fore (i la font Diamond) eliminats; paràfrasi de La Sorte i el 18 % de factors humans; Clavero et al. 2011; biaixos d'eBird (Johnston et al. 2021); «la llista més útil és la completa» (ajuda d'eBird); 56 km com a mitjana de totes les espècies; ocells de prats 10 al nord i 9 al sud, amb l'explicació atribuïda a Audubon; oreneta amb Birds of the World; URL del SOCC (portada i itineraris) i font per al 2002; introducció amb camp/menjadora i majoria als EUA i el Canadà; ×4 persones i ×2,6 cercles; Maryland «cap al 2005»; cacera atribuïda a Audubon; quota fins al 2012; «sèrie més llarga d'Amèrica»; radar com a biomassa; Shemya al peu; «es poden descarregar»; pesticides com «una de les raons»; repeticions i glossari; metadades de les referències.

Deixat fora (no verificat en una font primària oberta):
- Que la National Audubon Society cofundés eBird i que eBird es fes mundial el 2010: només ho he trobat a Wikipedia. El text diu que eBird el gestiona el Cornell Lab.
- La xarxa de Wells Cooke (1881) i que les dates del 14 de desembre al 5 de gener es fixessin a la temporada 101: no s'afegeixen; simplement s'ha tret la frase que deia que la novetat era fer-ho sempre igual.
- Que Chapman fos col·leccionista d'exemplars: no s'afirma; s'ha rebaixat el contrast «comptar en lloc de matar» a la descripció i al tancament.
- Sullivan et al. 2009 (eBird, *Biological Conservation*): no he pogut llegir-ne el resum; s'usa la pàgina d'ajuda d'eBird.
- El 93 % d'Estats Units i Canadà que proposava el revisor: amb el resum de la temporada 126 surt un 95 % (80.713 de 85.222); el text diu «la gran majoria».
