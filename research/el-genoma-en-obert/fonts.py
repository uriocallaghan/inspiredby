#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fonts de «El genoma que es va publicar en una nit».
S = { clau: (referència en HTML, [afirmacions que hi recolzen]) }
Cada clau es cita al text amb [[clau#n]] (n = l'afirmació). Totes les URL i DOI
s'han obert i verificat el 24-11-2026; les notes de verificació són a fonts.md.
"""

S = {

"virological": ('Holmes, E. C., en nom del consorci dirigit per Zhang Yong-Zhen. <i>Novel 2019 coronavirus genome</i>. '
  'Virological.org, 11-01-2020, 01.05 UTC (el text duu la data del 10 de gener). '
  '<a href="https://virological.org/t/novel-2019-coronavirus-genome/319">virological.org/t/novel-2019-coronavirus-genome/319</a>', [
  "El text que va fer pública la seqüència el va penjar Edward C. Holmes, de la Universitat de Sydney, en nom del consorci dirigit per Zhang Yong-Zhen.",
  "L'API del fòrum data el missatge l'11 de gener del 2020 a les 01.05.33 UTC.",
  "Hi van col·laborar el Centre Clínic de Salut Pública de Xangai i l'Escola de Salut Pública de la Universitat Fudan, l'Hospital Central de Wuhan, el centre de control de malalties de Wuhan, l'institut nacional de control de malalties transmissibles del CDC xinès i la Universitat de Sydney.",
  "El missatge deia que la seqüència també s'havia dipositat a GenBank, amb el número MN908947, i que s'alliberaria al més aviat possible.",
  "El text convidava explícitament a descarregar, compartir, usar i analitzar les dades, i demanava que qui en publicés resultats s'hi posés en contacte.",
  "Andrew Rambaut hi va anunciar, el 12 de gener del 2020, que cinc genomes més s'havien dipositat a GISAID.",
  "Trevor Bedford hi va anunciar, el 14 de gener del 2020, una primera anàlisi filogenètica dels sis genomes a Nextstrain, amb el codi obert.",
  ]),

"natura10": ('Cyranoski, D. «Zhang Yongzhen: Genome sharer», dins <i>Nature’s 10: ten people who helped shape science in 2020</i>. '
  '<i>Nature</i>, 15-12-2020. '
  '<a href="https://www.nature.com/immersive/d41586-020-03435-6/index.html">nature.com/immersive/d41586-020-03435-6</a>', [
  "El laboratori de Zhang Yong-Zhen, al Centre Clínic de Salut Pública de Xangai, va rebre una mostra del patogen el 3 de gener del 2020.",
  "Després de 40 hores de feina, a les 2 de la matinada del 5 de gener, Chen Yan-Mei va avisar Zhang que el virus estava emparentat amb el del SARS.",
  "Aquell mateix dia Zhang va avisar l'autoritat sanitària municipal de Xangai i va pujar les dades a l'NCBI, i després va esperar que l'NCBI processés la pujada.",
  "L'11 de gener, quan Zhang era a punt d'enlairar-se en un vol cap a Pequín, Holmes el va trucar per demanar-li que alliberessin les dades; Zhang va demanar un minut per pensar-hi i va respondre: «Eddie, t'autoritzo a alliberar les dades».",
  "Holmes ho va penjar a virological.org i Zhang va demanar a l'NCBI que alliberés el genoma.",
  "En dos dies, Tailàndia havia fet servir el genoma per confirmar que el virus havia creuat la frontera, i equips dels Estats Units ja el feien servir per dissenyar una vacuna.",
  "L'equip de Zhang va rebre una ordre governamental de «rectificació» i durant un temps no va poder estudiar el virus; Zhang nega que fos un càstig i diu que els van demanar actualitzar els protocols de bioseguretat després d'haver mogut equips durant unes obres, i que a finals de gener ja tornaven a seqüenciar coronavirus.",
  "Zhang recorda que els científics de tot el món li diuen que l'11 de gener va ser un punt d'inflexió.",
  ]),

"genbank": ('National Center for Biotechnology Information. <i>Severe acute respiratory syndrome coronavirus 2 isolate Wuhan-Hu-1, complete genome</i>. '
  'GenBank MN908947, versions .1 (12-01-2020), .2 (14-01-2020) i .3 (17-01-2020), descarregades amb e-utils el 24-11-2026. '
  '<a href="https://www.ncbi.nlm.nih.gov/nuccore/MN908947">ncbi.nlm.nih.gov/nuccore/MN908947</a>', [
  "La primera versió pública del genoma Wuhan-Hu-1 (MN908947.1, 12-01-2020) tenia 30.473 bases; la segona, 29.875, i la tercera, del 17-01-2020, que és la de referència, en té 29.903.",
  "El registre diu que es va enviar («Submitted») el 5 de gener del 2020 des del Centre Clínic de Salut Pública de Xangai i l'Escola de Salut Pública de la Universitat Fudan.",
  "El registre es va fer públic el 12 de gener del 2020, que és la data de la primera versió i la que donen les metadades del conjunt obert de Nextstrain; la mostra hi consta recollida el 26 de desembre del 2019.",
  ]),

"wu2020": ('Wu, F., Zhao, S., Yu, B., Chen, Y.-M., …, Holmes, E. C. i Zhang, Y.-Z. «A new coronavirus associated with human respiratory disease in China». '
  '<i>Nature</i> 579, 265–269 (2020). Rebut el 7 de gener del 2020, publicat el 3 de febrer. '
  '<a href="https://doi.org/10.1038/s41586-020-2008-3">doi.org/10.1038/s41586-020-2008-3</a>', [
  "L'article que descriu el genoma el va rebre <i>Nature</i> el 7 de gener del 2020 i es va publicar el 3 de febrer.",
  ]),

"don": ('Organització Mundial de la Salut. <i>Pneumonia of unknown cause – China</i>. Disease Outbreak News, 05-01-2020. '
  '<a href="https://www.who.int/emergencies/disease-outbreak-news/item/2020-DON229">who.int/emergencies/disease-outbreak-news/item/2020-DON229</a>', [
  "A 3 de gener del 2020, les autoritats xineses havien notificat a l'OMS 44 persones amb pneumònia de causa desconeguda a la ciutat de Wuhan, onze d'elles en estat greu i trenta-tres estables.",
  ]),

"oms": ('Organització Mundial de la Salut. <i>Timeline of WHO’s response to COVID-19</i> (cronologia oficial, última actualització del 29-01-2021). '
  '<a href="https://www.who.int/news/item/29-06-2020-covidtimeline">who.int/news/item/29-06-2020-covidtimeline</a>', [
  "L'1 de gener del 2020, l'OMS va demanar informació a les autoritats xineses sobre el grup de pneumònies de Wuhan i va activar el seu equip de gestió d'incidents.",
  "El 9 de gener del 2020, l'OMS va informar que les autoritats xineses havien determinat que el brot el causava un coronavirus nou.",
  "L'11 de gener del 2020, l'OMS va dir que havia rebut les seqüències genètiques del coronavirus nou i que esperava que es fessin públiques ben aviat.",
  "El 13 de gener del 2020, Tailàndia va notificar el primer cas confirmat fora de la Xina i l'OMS va publicar el primer protocol de PCR per diagnosticar el virus nou.",
  "El 30 de gener del 2020, l'OMS va declarar el brot emergència de salut pública d'importància internacional; aleshores hi havia 98 casos fora de la Xina i cap mort.",
  "L'11 de març del 2020, l'OMS va considerar que la COVID-19 es podia qualificar de pandèmia.",
  ]),

"corman": ('Corman, V. M., Landt, O., Kaiser, M., …, Koopmans, M. P. G. i Drosten, C. «Detection of 2019 novel coronavirus (2019-nCoV) by real-time RT-PCR». '
  '<i>Eurosurveillance</i> 25(3): 2000045 (2020). Rebut el 21 de gener, acceptat el 22 i publicat el 23 de gener del 2020. '
  '<a href="https://doi.org/10.2807/1560-7917.ES.2020.25.3.2000045">doi.org/10.2807/1560-7917.ES.2020.25.3.2000045</a>', [
  "L'equip va dissenyar i validar una prova de PCR sense disposar de material del virus, perquè els aïllats no estaven disponibles.",
  "El disseny es basava en la proximitat genètica amb el coronavirus del SARS i en àcids nucleics sintètics fets a partir de la seqüència.",
  "La prova es va comprovar amb 297 mostres clíniques originals que contenien tot l'espectre de virus respiratoris humans, per assegurar que no les confonia.",
  "L'article es va rebre el 21 de gener del 2020 i es va publicar el 23.",
  "La primera versió del protocol de diagnòstic, amb les dades de qualificació tècnica i les proves d'exclusivitat sobre 75 mostres clíniques, es va fer arribar a l'OMS el 13 de gener del 2020.",
  ]),

"corbett": ('Corbett, K. S., Edwards, D. K., Leist, S. R., …, Graham, B. S. «SARS-CoV-2 mRNA vaccine design enabled by prototype pathogen preparedness». '
  '<i>Nature</i> 586, 567–571 (2020). '
  '<a href="https://doi.org/10.1038/s41586-020-2622-0">doi.org/10.1038/s41586-020-2622-0</a>', [
  "En menys de 24 hores des de la publicació de les seqüències, el 10 de gener del 2020, l'equip ja havia introduït les dues mutacions estabilitzadores a la proteïna de l'espícula per dissenyar l'antigen.",
  "L'assaig en humans de la vacuna d'ARN va començar el 16 de març del 2020, 66 dies després que es publiqués la seqüència del virus.",
  ]),


"bermuda96": ('Human Genome Organisation (HUGO). <i>Summary of Principles Agreed at the First International Strategy Meeting on Human Genome Sequencing</i> '
  '(Bermuda, 25–28 de febrer de 1996). Còpia de l’arxiu del Projecte Genoma Humà del Departament d’Energia dels Estats Units. '
  '<a href="https://web.archive.org/web/20100607175847/http://www.ornl.gov/sci/techresources/Human_Genome/research/bermuda.shtml">web.archive.org · ornl.gov/…/bermuda.shtml</a>', [
  "Els participants van acordar que tota la seqüència genòmica humana generada per centres finançats per seqüenciar a gran escala havia de ser lliurement disponible i de domini públic, per fomentar la recerca i maximitzar-ne el benefici per a la societat.",
  "Van acordar que els fragments muntats s'alliberessin tan aviat com fos possible: en alguns centres, tot el que passés d'un quiloparell de bases s'alliberaria automàticament cada dia.",
  "La raó explícita era evitar que aquells centres es quedessin una posició privilegiada en l'explotació i el control de la informació genòmica humana.",
  "Hi havia representants i científics del Wellcome Trust, del consell de recerca mèdica britànic, del centre nacional de recerca del genoma humà i del Departament d'Energia dels Estats Units, del programa alemany del genoma, de la Comissió Europea, de HUGO i del projecte japonès.",
  "L'acta recull que alguns centres podien tenir dificultats legals per aplicar-ho i que, per això, calia que els finançadors ho impulsessin.",
  "A la segona reunió, del 27 de febrer al 2 de març de 1997, els principis d'alliberament ràpid i accés públic es van reafirmar, i es va demanar als científics i als finançadors que vetllessin perquè tothom els complís.",
  ]),

"maxson": ('Maxson Jones, K., Ankeny, R. A. i Cook-Deegan, R. «The Bermuda Triangle: The Pragmatics, Policies, and Principles for Data Sharing in the History of the Human Genome Project». '
  '<i>Journal of the History of Biology</i> 51, 693–805 (2018). '
  '<a href="https://doi.org/10.1007/s10739-018-9538-7">doi.org/10.1007/s10739-018-9538-7</a>', [
  "La història dels principis de Bermuda i de com es van negociar és l'objecte d'aquest estudi, el més detallat que se n'ha publicat; els principis es van adoptar el febrer del 1996 i es van convertir en polítiques formals a principis del 1998.",
  "Sobre el seu compliment, l'estudi diu que l'alliberament diari «pot haver esdevingut una condició formal de finançament» als instituts nacionals de salut dels Estats Units i al Wellcome Trust, però que els responsables d'altres agències que finançaven el projecte, sobretot fora dels Estats Units, van trobar maneres d'esquivar o revisar les seves polítiques per continuar essent-hi conformes.",
  ]),


"toronto": ('Toronto International Data Release Workshop Authors. «Prepublication data sharing». '
  '<i>Nature</i> 461, 168–170 (2009). '
  '<a href="https://doi.org/10.1038/461168a">doi.org/10.1038/461168a</a>', [
  "El 2009, un taller internacional a Toronto va proposar estendre l'alliberament de dades abans de publicar-les més enllà del genoma humà.",
  ]),

"modjarrad": ('Modjarrad, K., Moorthy, V. S., Millett, P., Gsell, P.-S., Roth, C. i Kieny, M.-P. «Developing Global Norms for Sharing Data and Results during Public Health Emergencies». '
  '<i>PLOS Medicine</i> 13(1): e1001935 (2016). '
  '<a href="https://doi.org/10.1371/journal.pmed.1001935">doi.org/10.1371/journal.pmed.1001935</a>', [
  "El setembre del 2015, en una consulta de l'OMS a Ginebra, responsables de tot el món van afirmar que compartir dades i resultats de manera ràpida i transparent durant les emergències de salut pública ha de ser la norma mundial.",
  "La consulta va concloure que compartir les dades ràpidament ha de ser la norma per defecte en una emergència, i que les revistes no han de penalitzar qui ho fa.",
  ]),

"fidler": ('Fidler, D. P. «Influenza Virus Samples, International Law, and Global Health Diplomacy». '
  '<i>Emerging Infectious Diseases</i> 14(1), 88–94 (2008). '
  '<a href="https://doi.org/10.3201/eid1401.070700">doi.org/10.3201/eid1401.070700</a>', [
  "A finals del 2006, Indonèsia va decidir deixar de compartir mostres del virus de la grip aviària A(H5N1) amb l'OMS.",
  "La decisió venia que una empresa australiana havia desenvolupat una vacuna a partir d'una soca que Indonèsia havia cedit a l'OMS, i que s'havien demanat patents sobre versions modificades de mostres compartides sense el consentiment dels països que les havien donat.",
  "L'argument d'Indonèsia era que els països de renda baixa donaven mostres i informació, i que les empreses dels països industrialitzats les explotaven i patentaven productes que després aquells països no es podien permetre.",
  "El 23 de maig del 2007, l'Assemblea Mundial de la Salut va aprovar una resolució sobre la compartició de virus de la grip i l'accés a les vacunes, després d'una negociació d'última hora.",
  ]),

"elbe": ('Elbe, S. i Buckland-Merrett, G. «Data, disease and diplomacy: GISAID’s innovative contribution to global health». '
  '<i>Global Challenges</i> 1(1), 33–46 (2017). '
  '<a href="https://doi.org/10.1002/gch2.1018">doi.org/10.1002/gch2.1018</a>', [
  "GISAID es va posar en marxa el 2008 com un mecanisme per incentivar la compartició internacional de dades de virus, nascut de l'amenaça de la grip aviària A(H5N1).",
  "El motiu pel qual molts científics no comparteixen dades abans de publicar-les és la por que altres hi publiquin primer i que la seva contribució no es reconegui.",
  "Investigadors de països de renda baixa i mitjana s'han queixat que les anàlisis de les mostres que havien compartit (perquè no tenien la capacitat dels laboratoris dels països rics) es presentaven després en congressos internacionals sense avisar-los abans i sense incloure'ls entre els autors.",
  "L'accés a GISAID es regeix per un acord: qui en descarrega dades s'identifica i es compromet a reconèixer els laboratoris que han aportat les mostres i generat les seqüències.",
  "La decisió d'Indonèsia de tornar a compartir dades d'A(H5N1) a través de GISAID, el 2008, es va celebrar com un èxit diplomàtic.",
  "L'abril del 2009, durant el brot de grip A(H1N1), el CDC dels Estats Units va penjar a GISAID el primer genoma complet del virus nou el dia 25.",
  ]),

"hadfield": ('Hadfield, J., Megill, C., Bell, S. M., Huddleston, J., Potter, B., Callender, C., Sagulenko, P., Bedford, T. i Neher, R. A. '
  '«Nextstrain: real-time tracking of pathogen evolution». <i>Bioinformatics</i> 34(23), 4121–4123 (2018). '
  '<a href="https://doi.org/10.1093/bioinformatics/bty407">doi.org/10.1093/bioinformatics/bty407</a>', [
  "Nextstrain és una eina oberta, publicada el 2018, que reconstrueix i mostra l'evolució d'un patògen a partir de genomes compartits.",
  ]),

"nextstrain": ('Nextstrain. <i>Genomic epidemiology of SARS-CoV-2 with subsampling focused globally since pandemic start</i> '
  '(conjunt obert <code>ncov_open_global_all-time</code>, construcció del 22-11-2026; descarregat el 24-11-2026). '
  '<a href="https://nextstrain.org/ncov/open/global/all-time">nextstrain.org/ncov/open/global/all-time</a>', [
  "L'arbre que es mostra és la construcció oberta de Nextstrain, amb 3.078 genomes triats per representar la diversitat global des de l'inici de la pandèmia.",
  "El conjunt de metadades obert conté 9.445.676 genomes de SARS-CoV-2 dipositats a les bases públiques d'INSDC (comptatge propi).",
  "Dels 9.414.376 genomes amb país de la mostra, els Estats Units i el Regne Unit en sumen 7.050.131, el 74,9 % (comptatge propi).",
  ]),

"otoole": ('O’Toole, Á., Scher, E., Underwood, A., Jackson, B., Hill, V., McCrone, J. T., …, Rambaut, A. '
  '«Assignment of epidemiological lineages in an emerging pandemic using the pangolin tool». <i>Virus Evolution</i> 7(2): veab064 (2021). '
  '<a href="https://doi.org/10.1093/ve/veab064">doi.org/10.1093/ve/veab064</a>', [
  "L'eina oberta pangolin assigna un llinatge epidemiològic a un genoma de SARS-CoV-2, dins la nomenclatura dinàmica que descriu aquest article.",
  ]),

"volz": ('Consorci COG-UK; Volz, E., Mishra, S., Chand, M., …, Ferguson, N. M. «Assessing transmissibility of SARS-CoV-2 lineage B.1.1.7 in England». '
  '<i>Nature</i> 593, 266–269 (2021). '
  '<a href="https://doi.org/10.1038/s41586-021-03470-x">doi.org/10.1038/s41586-021-03470-x</a>', [
  "La transmissibilitat de la variant Alfa (llinatge B.1.1.7) es va mesurar combinant els genomes compartits amb les dades epidemiològiques de casos d'Anglaterra.",
  ]),

"deng": ('Deng, X., Gu, W., Federman, S., …, Chiu, C. Y. «Genomic surveillance reveals multiple introductions of SARS-CoV-2 into Northern California». '
  '<i>Science</i> 369(6503), 582–587 (2020). '
  '<a href="https://doi.org/10.1126/science.abb9263">doi.org/10.1126/science.abb9263</a>', [
  "Comparant genomes es va poder veure que el virus havia entrat diverses vegades, per vies diferents, al nord de Califòrnia.",
  ]),

"brito": ('Brito, A. F., Semenova, E., Dudas, G., …, Faria, N. R. (Grup de treball de vigilància genòmica de la COVID-19). '
  '«Global disparities in SARS-CoV-2 genomic surveillance». <i>Nature Communications</i> 13: 7003 (2022). '
  '<a href="https://doi.org/10.1038/s41467-022-33713-y">doi.org/10.1038/s41467-022-33713-y</a>', [
  "En els dos primers anys de pandèmia, el 78 % dels països de renda alta van seqüenciar més del 0,5 % dels seus casos, i només el 42 % dels de renda baixa i mitjana hi van arribar.",
  "Al voltant del 25 % dels genomes dels països de renda alta es van publicar en menys de 21 dies, davant del 5 % dels de renda baixa i mitjana.",
  "Els autors proposen com a objectiu seqüenciar un 0,5 % dels casos i publicar-los en menys de 21 dies.",
  "Fins al 9 de juny del 2022 s'havien compartit més d'11,3 milions de seqüències consens a la base EpiCoV de GISAID i més de 5,5 milions a les bases de l'INSDC; l'estudi n'analitza 8.947.455.",
  ]),

"chen": ('Chen, Z., Azman, A. S., Chen, X., …, Yu, H. «Global landscape of SARS-CoV-2 genomic surveillance and data sharing». '
  '<i>Nature Genetics</i> 54, 499–507 (2022). '
  '<a href="https://doi.org/10.1038/s41588-022-01033-y">doi.org/10.1038/s41588-022-01033-y</a>', [
  "La capacitat de seqüenciar i de compartir genomes es reparteix de manera molt desigual pel món.",
  ]),

"nature2024": ('Mallapaty, S. «Chinese virologist who was first to share COVID-19 genome sleeps on street after lab shuts». '
  '<i>Nature</i>, notícia del 01-05-2024 (actualitzada el 3 de maig). '
  '<a href="https://doi.org/10.1038/d41586-024-01293-0">doi.org/10.1038/d41586-024-01293-0</a>', [
  "<i>Nature</i> descriu Zhang Yong-Zhen com la primera persona que va fer pública la seqüència del genoma del virus que causa la COVID-19.",
  "L'abril del 2024, Zhang va acampar davant del seu laboratori després que el tanquessin, en una picabaralla pública amb el Centre Clínic de Salut Pública de Xangai que, segons la notícia, es va acabar resolent.",
  ]),

"gorbalenya": ('Coronaviridae Study Group of the International Committee on Taxonomy of Viruses. '
  '«The species <i>Severe acute respiratory syndrome-related coronavirus</i>: classifying 2019-nCoV and naming it SARS-CoV-2». '
  '<i>Nature Microbiology</i> 5, 536–544 (2020). '
  '<a href="https://doi.org/10.1038/s41564-020-0695-z">doi.org/10.1038/s41564-020-0695-z</a>', [
  "El comitè internacional de taxonomia de virus va classificar el virus nou i li va posar el nom de SARS-CoV-2 a partir de la comparació del seu genoma amb els dels seus parents.",
  ]),

"ptrans": ('Oldenburg, H. «Epistle dedicatory». <i>Philosophical Transactions of the Royal Society of London</i> 1, i–ii (6 de març de 1665). '
  '<a href="https://doi.org/10.1098/rstl.1665.0001">doi.org/10.1098/rstl.1665.0001</a>', [
  "El primer número de les <i>Philosophical Transactions</i> de la Royal Society, que encara es publiquen, duu la data del 6 de març de 1665.",
  ]),


}
