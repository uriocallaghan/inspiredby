import re, json, os
SP = os.path.dirname(os.path.abspath(__file__)) + '/'
ART = '/Users/uriocallaghan/Documents/Claude Code/InspiredBy Magazine/web/articles/el-jesus-historic/'
OLD = json.load(open(SP + 'fonts-old.json'))
BCI = 'https://bci.cat/biblia/capitol/'
def mc(c, v, txt=None):
    return f'<a href="{BCI}{1144+c}#verse-{1144+c}-{v}">{txt or f"Mc {c},{v}"}</a>'
CW = 'https://commons.wikimedia.org/wiki/File:'

def item(img, w, h, alt, t, d, c):
    return f'''    <figure class="art-item">
      <div class="art-frame">
        <img src="img/{img}" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async">
      </div>
      <figcaption class="art-cap">
        <span class="art-t">{t}</span>
        <span class="art-d">{d}</span>
        <span class="art-c">{c}</span>
      </figcaption>
    </figure>'''

OBJECTES = '\n'.join([
 item('pilat-pedra.jpg',613,820,"Bloc de pedra calcària amb una inscripció llatina on es llegeixen les paraules TIBERIEVM, PILATVS i IVDAEAE",
  'Pedra de Pilat (26–36 dC)','Trobada el 1961 al teatre romà de Cesarea. És la inscripció que dona el nom i el càrrec de Ponç Pilat: <i lang="la">[praef]ectus Iuda[ea]e</i>, prefecte de Judea (algunes lletres són restituïdes).',
  f'Israel Museum, Jerusalem. Foto: Carole Raddato, CC BY-SA 2.0, <a href="{CW}Dedicatory_inscription_found_reused_in_the_staircase_of_the_theatre_of_Caesarea,_the_first_and_only_mention_of_Pontius_Pilates%27_name_ever_unearthed,_26-36_AD,_Israel_Museum,_Jerusalem_(15655925251).jpg">Wikimedia Commons</a>.'),
 item('caifas-ossari.jpg',820,545,"Caixa d'ossos de pedra calcària decorada amb rosetes, amb una inscripció gratada en un lateral",
  'Ossari de «Josep fill de Caifàs» (s. I)','Trobat el 1990 en una tomba de Jerusalem amb les restes d\'un home d\'uns 60 anys. Probablement és el del gran sacerdot Caifàs dels evangelis, però no és segur.',
  f'Israel Museum, Jerusalem. Foto: Gary Todd, CC0, <a href="{CW}Limestone_Ossuary_of_%22Joseph_Son_of_Caiaphas%22_Jerusalem,_1st_Century_AD_(41409261800).jpg">Wikimedia Commons</a>.'),
 item('yehohanan-talo.jpg',820,545,"Os del taló travessat per un clau de ferro rovellat, exposat sobre un suport",
  'El taló de Yehohanan (s. I)','Un os del peu travessat per un clau d\'11,5 cm, trobat el 1968 dins un ossari de Jerusalem. És un dels dos únics casos coneguts de crucifixió romana amb el clau encara a l\'os, i l\'únic de la terra de Jesús.',
  f'Exposició de l\'Israel Museum (probablement la rèplica). Foto: Gary Todd, CC0, <a href="{CW}Nail_%26_Heel_Bone_Only_Known_Evidence_of_Crucifixion,_Jerusalem,_1st_C._AD_(29347803498).jpg">Wikimedia Commons</a>.'),
 item('magdala-pedra.jpg',820,545,"Bloc de pedra esculpit amb un canelobre de set braços entre dues gerres i columnes",
  'Pedra de Magdala (s. I aC – s. I dC)','Apareguda el 2009 en una sinagoga de Magdala, el poble d\'on la tradició fa venir Maria Magdalena, a la riba del llac de Galilea. Una de les poques sinagogues conegudes de l\'època de Jesús.',
  f'Rèplica al Centre Yigal Allon, Ginossar. Foto: Oren Rozen, CC BY-SA 4.0, <a href="{CW}Ginosar_090926_Magdala_Stone.jpg">Wikimedia Commons</a>.'),
 item('barca-galilea.jpg',820,563,"Restes del buc d'una barca de fusta antiga dins d'una sala de museu",
  'Barca del llac de Galilea (s. I aC – s. I dC)','Va aparèixer el 1986, en una sequera, al fang de la riba. Fa uns 8 metres: és com les barques de pescadors que surten als evangelis, tot i que no té cap relació demostrada amb Jesús.',
  f'Centre Yigal Allon, Ginossar. Foto: Yong Woo Park, CC0, <a href="{CW}Ancient_Sea_of_Galilee_Boat_1st_Century_AD_at_Yigal_Allon_Centre_Ginosar_Israel.jpg">Wikimedia Commons</a>.'),
])

MON = '\n'.join([
 item('alexamenos-dibuix.jpg',699,820,"Dibuix d'un grafit antic: un home crucificat amb cap d'ase vist d'esquena i un noi que l'adora, amb lletres gregues",
  'Grafit d\'Alexàmenos (c. 200)','Una burla gratada en una paret del Palatí de Roma: un crucificat amb cap d\'ase i la frase «Alexàmenos venera [el seu] déu».',
  f'Museu Palatí, Roma. Dibuix publicat el 1904, domini públic, <a href="{CW}Graffito_d%27Alexamenos.jpg">Wikimedia Commons</a>.'),
 item('kongo-crucifix.jpg',607,820,"Crucifix de llautó daurat amb un Crist de trets africans i petites figures agenollades als braços de la creu",
  'Crucifix del regne del Congo (s. XVI–XVII)','Després de la conversió dels reis del Congo, els fonedors locals el fan amb trets africans i hi afegeixen petites figures agenollades.',
  f'The Metropolitan Museum of Art, Nova York (1999.295.7), CC0, <a href="{CW}Crucifix_MET_DP326205.jpg">Wikimedia Commons</a>.'),
 item('ploma-mexic.jpg',677,820,"Mosaic de plomes blaves i iridescents amb Crist al sepulcre envoltat dels instruments de la Passió i un papa que celebra missa",
  'La missa de sant Gregori (1539)','Feta amb plomes per artesans nahues de la Ciutat de Mèxic sota el governador Diego de Alvarado Huanitzin, divuit anys després de la conquesta, i dedicada al papa Pau III.',
  f'Musée des Amériques, Auch. Foto: Didier Descouens, CC BY-SA 4.0, <a href="{CW}(Auch)_Messe_de_saint_Gr%C3%A9goire_-_Mus%C3%A9e_des_Am%C3%A9riques_%E2%80%93_Auch.jpg">Wikimedia Commons</a>.'),
 item('mughal-abgar.jpg',522,820,"Miniatura mogol: Jesús assegut amb túnica fosca mentre un pintor el retrata envoltat de personatges vestits a l'europea",
  'Un pintor retrata Jesús (1602–1604)','Miniatura d\'una còpia de la vida de Crist en persa del jesuïta Jerome Xavier, feta per al príncep Salim, el futur Jahangir. Mostra la llegenda del pintor que el rei Abgar d\'Edessa va enviar a retratar Jesús.',
  f'The Cleveland Museum of Art (2005.145.143.a), CC0, <a href="{CW}Northern_India,_Uttar_Pradesh,_Allahabad,_Mughal_period_-_Jesus_being_portrayed_by_King_Abgar%27s_painter,_from_a_Mir%27at_al-quds_-_2005.145.21_-_Cleveland_Museum_of_Art.tif">Wikimedia Commons</a>.'),
 item('zapata-cuy.jpg',726,820,"Pintura del Sant Sopar amb Jesús i els apòstols al voltant d'una taula; al centre, en una safata, un conill d'índies rostit",
  'El Sant Sopar de Cusco (c. 1753)','Atribuït a Marcos Zapata. Al centre de la taula hi ha un <i lang="qu">cuy</i>, el conill d\'índies rostit que és menjar de festa als Andes.',
  f'Catedral de Cusco (Perú). Domini públic, <a href="{CW}Zapata-%C3%BAltima_cena.jpg">Wikimedia Commons</a>.'),
 item('fumie.jpg',703,820,"Placa de llautó amb un Crist crucificat en relleu, amb la cara i el cos gastats i llisos",
  'Fumi-e (Japó, època Edo)','Placa per trepitjar: al Japó Tokugawa, els habitants de Nagasaki i d\'altres dominis l\'havien de trepitjar cada any per demostrar que no eren cristians. La cara de Crist ha quedat llisa.',
  f'Museu Nacional de Tòquio (C-1011). Foto: ColBase, CC BY 4.0, <a href="{CW}C-1011_E0175941.jpg">Wikimedia Commons</a>.'),
])

# ---------- FONTS (clau → html) ----------
F = {
 'morgan': OLD['1'], 'blum': OLD['2'], 'ilan': OLD['3'], 'reed': OLD['4'], 'harris': OLD['6'], 'taylor': OLD['7'], 'nagar': OLD['8'],
 'bbc': OLD['9'], 'jensen': OLD['10'], 'sanders': OLD['11'], 'heschel': OLD['12'], 'schweitzer': OLD['13'], 'barton': OLD['14'],
 'prothero': OLD['15'], 'yougov': OLD['16'], 'plos': OLD['17'], 'bci': OLD['18'],
 'brit_nom': 'Encyclopaedia Britannica: «<a href="https://www.britannica.com/biography/Joshua">Joshua</a>», «<a href="https://www.britannica.com/topic/J-letter">J (letter)</a>» i «<a href="https://www.britannica.com/biography/Jesus">Jesus</a>». <i lang="en">Jewish Encyclopedia</i> (1906), «<a href="https://www.jewishencyclopedia.com/articles/8906-joshua-jehoshua">Joshua (Jehoshua)</a>». Treccani, «<a href="https://www.treccani.it/enciclopedia/gian-giorgio-trissino_(Enciclopedia-dell\'Italiano)/">Trissino, Gian Giorgio</a>». Graduate Theological Union Library, «<a href="https://www.gtuarchives.org/KJV/kingjamesbible.html">The King James Bible</a>» (Nou Testament del 1612).',
 'suetoni': 'Suetoni, <i>Vida de Claudi</i> 25,4, text llatí i traducció de J. C. Rolfe (<a href="https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Claudius*.html">LacusCurtius, Univ. de Chicago</a>). Liddell–Scott–Jones, «χρηστός» (<a href="https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0057:entry=xrhsto/s">Perseus</a>).',
 'arameu': 'Encyclopaedia Britannica, «<a href="https://www.britannica.com/topic/Aramaic-language">Aramaic language</a>». Buth, Randall i Notley, R. Steven (eds.). <i lang="en">The Language Environment of First Century Judaea</i>. Brill, 2014, DOI: <a href="https://doi.org/10.1163/9789004264410">10.1163/9789004264410</a>.',
 'dionis': 'Encyclopaedia Britannica: «<a href="https://www.britannica.com/biography/Dionysius-Exiguus">Dionysius Exiguus</a>», «<a href="https://www.britannica.com/biography/Saint-Bede-the-Venerable">St. Bede the Venerable</a>» i «<a href="https://www.britannica.com/topic/Common-Era">Common Era</a>».',
 'herodes': 'Encyclopaedia Britannica: «<a href="https://www.britannica.com/biography/Herod-king-of-Judaea">Herod</a>», «<a href="https://www.britannica.com/biography/Pontius-Pilate">Pontius Pilate</a>». Flavi Josep, <i>Antiguitats jueves</i> XVII, 6,4 (eclipsi), trad. W. Whiston (<a href="https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0146:book=17:whiston%20chapter=6:whiston%20section=4">Perseus</a>).',
 'humphreys': 'Humphreys, Colin J. i Waddington, W. Graeme. «Dating the Crucifixion», <i lang="en">Nature</i> 306 (1983): 743–746, DOI: <a href="https://doi.org/10.1038/306743a0">10.1038/306743a0</a>.',
 'cronograf': '<i lang="la">Cronògraf de 354</i>: <i lang="la">Depositio martyrum</i> i calendari de Filòcal, ed. Th. Mommsen (<a href="https://www.tertullian.org/fathers/chronography_of_354_12_depositions_martyrs.htm">part 12</a>, <a href="https://www.tertullian.org/fathers/chronography_of_354_06_calendar.htm">part 6</a>). McGowan, Andrew. «<a href="https://www.biblicalarchaeology.org/daily/people-cultures-in-the-bible/jesus-historical-jesus/how-december-25-became-christmas/">How December 25 Became Christmas</a>», <i lang="en">Bible Review</i> (2002). Encyclopaedia Britannica, «<a href="https://www.britannica.com/topic/Christmas">Christmas</a>».',
 'tarragona': 'Enciclopèdia Catalana: «<a href="https://www.enciclopedia.cat/gran-enciclopedia-catalana/era-hispanica">era hispànica</a>» i <i>Catalunya Romànica</i>, «<a href="https://www.enciclopedia.cat/catalunya-romanica/els-arquebisbes-de-tarragona-fins-el-1300">Els arquebisbes de Tarragona fins el 1300</a>». Mundó, Anscari M. «El concili de Tarragona de 1180: dels anys dels reis francs als de l\'Encarnació», <i>Analecta Sacra Tarraconensia</i> 67/1 (1994): XXIII–XLIII.',
 'ehrman': 'Ehrman, Bart D. <i lang="en">Did Jesus Exist? The Historical Argument for Jesus of Nazareth</i>. HarperOne, 2012. Dunn, James D. G. <i lang="en">Jesus Remembered</i>. Eerdmans, 2003.',
 'autors': 'Flavi Josep, <i>Antiguitats jueves</i> XVIII, 63–64 i XX, 200, trad. W. Whiston (<a href="https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0146:book=18:whiston%20chapter=3:whiston%20section=3">Perseus</a>). Tàcit, <i>Annals</i> XV, 44 (<a href="https://www.thelatinlibrary.com/tacitus/tac.ann15.shtml">The Latin Library</a>). Goldberg, G. J. «<a href="https://josephus.org/testhist.htm">The Mystery of the Testimonium Flavianum</a>».',
 'objectes': 'Israel Museum: «<a href="https://www.imj.org.il/en/collections/395572">Latin dedicatory inscription mentioning Pontius Pilate</a>» i «<a href="https://www.imj.org.il/en/collections/191542">Elaborate ossuary of “Joseph son of Caiaphas”</a>». Center for Online Judaic Studies: «<a href="https://cojs.org/ossuary_of_the_high_priest_caiaphas-_18-36_ce/">Ossuary of the High Priest Caiaphas</a>». Google Arts &amp; Culture / Israel Museum, «<a href="https://artsandculture.google.com/asset/ossuary-of-yehohanan-son-of-hagkol-with-heel-bone-and-nail/8gEPRIAlblWlqw">Ossuary of “Yehohanan son of Hagkol” with heel bone and nail</a>». Autoritat d\'Antiguitats d\'Israel, comunicat sobre la sinagoga de Magdala (2009), reproduït a la <a href="https://www.jewishvirtuallibrary.org/jsource/Archaeology/magdala.html">Jewish Virtual Library</a>. Wachsmann, Shelley. <i lang="en">The Excavations of an Ancient Boat in the Sea of Galilee</i>. <i>\'Atiqot</i> 19, 1990. Biblical Archaeology Society, «<a href="https://www.biblicalarchaeology.org/daily/news/verdict-not-guilty/">Verdict: Not Guilty</a>» (ossari de Jaume, 2012).',
 'damon': 'Damon, P. E. et al. «Radiocarbon dating of the Shroud of Turin», <i lang="en">Nature</i> 337 (1989): 611–615, DOI: <a href="https://doi.org/10.1038/337611a0">10.1038/337611a0</a>.',
 'dark': 'Dark, Ken. «Early Roman-period Nazareth and the Sisters of Nazareth Convent», <i lang="en">The Antiquaries Journal</i> 92 (2012): 37–64, DOI: <a href="https://doi.org/10.1017/S0003581512001308">10.1017/S0003581512001308</a>. Autoritat d\'Antiguitats d\'Israel, «<a href="https://www.jewishvirtuallibrary.org/excavation-discovers-remains-of-building-from-time-of-jesus">Remains of a building from the time of Jesus</a>» (Natzaret, 2009).',
 'colosseo': 'Parco archeologico del Colosseo, «<a href="https://colosseo.it/en/opere/scratched-graffito-with-blasphemous-crucifix/">Scratched graffito with blasphemous crucifix</a>».',
 'mon': 'The Metropolitan Museum of Art, «<a href="https://www.metmuseum.org/art/collection/search/318323">Crucifix</a>» (1999.295.7). The Cleveland Museum of Art, «<a href="https://clevelandart.org/art/2005.145.143.a">Jesus being portrayed by King Abgar\'s painter</a>» (2005.145.143.a). Smarthistory, «<a href="https://human.libretexts.org/Bookshelves/Art/Art_History_and_Theory/SmartHistory_of_Art_2e/SmartHistory_of_Art_XIc_-_Latin_America_1500_to_1900/02%3A_New_Spain_(Spanish_colonies)/2.02%3A_16th_century/2.2.09%3A_Featherworks/2.2.9.01%3A_The_Mass_of_St._Gregory">The Mass of St. Gregory</a>». Agència de Turisme del Japó, «<a href="https://www.mlit.go.jp/tagengo-db/common/001561252.pdf">Chronology of Christianity in Japan Centered on Nagasaki</a>» i «<a href="https://www.mlit.go.jp/tagengo-db/common/001561254.pdf">Artifacts Related to Hidden Christians</a>».',
 'quran': 'Alcorà, text àrab i traducció Sahih International (<a href="https://quran.com/">Quran.com</a>; recompte sobre el text complet de l\'<a href="https://api.quran.com/api/v4/quran/verses/imlaei_simple">API de Quran.com</a>). Smith, Jane I. i Haddad, Yvonne Y. «The Virgin Mary in Islamic Tradition and Commentary», <i lang="en">The Muslim World</i> 79.3–4 (1989): 161–187.',
 'tomas': 'Encyclopaedia Britannica, «<a href="https://www.britannica.com/topic/Infancy-Gospel-of-Thomas">Infancy Gospel of Thomas</a>». James, M. R. <i lang="en">The Apocryphal New Testament</i>. Oxford, 1924 (Evangeli de la infància de Tomàs, cap. II).',
 'schafer': 'Talmud de Babilònia, Sanhedrín 43a, edició William Davidson (<a href="https://www.sefaria.org/Sanhedrin.43a">Sefaria</a>). Schäfer, Peter. <i lang="en"><a href="https://press.princeton.edu/books/paperback/9780691143187/jesus-in-the-talmud">Jesus in the Talmud</a></i>. Princeton University Press, 2007.',
 'jueus': 'University of Edinburgh, «<a href="https://jnjr.div.ed.ac.uk/primary-sources/modern/joseph-klausners-jesus-of-nazareth-1922-a-modern-jewish-study-of-the-founding-figure-of-christianity/">Joseph Klausner\'s Jesus of Nazareth (1922)</a>». Vermes, Geza. <i lang="en">Jesus the Jew</i>. Collins, 1973. Levine, Amy-Jill. <i lang="en">The Misunderstood Jew</i>. HarperSanFrancisco, 2006.',
 'xian': 'Estela de Xi\'an (781), Museu del Bosc d\'Esteles de Xi\'an; text xinès i estudi a l\'<a href="https://www.iranicaonline.org/articles/christianity-v/"><i lang="en">Encyclopaedia Iranica</i>, «Christianity v»</a>.',
 'pew': 'Pew Research Center. «<a href="https://www.pewresearch.org/religion/2025/06/09/how-the-global-religious-landscape-changed-from-2010-to-2020/">How the Global Religious Landscape Changed From 2010 to 2020</a>», 9 de juny de 2025.',
 'japo': 'Encyclopaedia Britannica, «<a href="https://www.britannica.com/topic/Kirishitan">Kirishitan</a>».',
 'hong': 'Encyclopaedia Britannica, «<a href="https://www.britannica.com/biography/Hong-Xiuquan">Hong Xiuquan</a>» i «Taiping Rebellion». Columbia University, Asia for Educators, «<a href="https://afe.easia.columbia.edu/special/china_1750_taiping.htm">The Taiping Rebellion</a>». Platt, Stephen R. <i lang="en">Autumn in the Heavenly Kingdom</i>. Knopf, 2012.',
 'shingo': 'Okamoto Ryōsuke, «<a href="https://www.nippon.com/ja/japan-topics/g00658/">キリストの墓</a>» (La tomba de Crist), nippon.com, 2019.',
 'notovitch': 'Müller, F. Max. «The Alleged Sojourn of Christ in India», <i lang="en">The Nineteenth Century</i> (1894); Douglas, J. Archibald. «The Chief Lama of Himis on the Alleged “Unknown Life of Christ”», <i lang="en">The Nineteenth Century</i> (1896) (<a href="https://tertullian.org/rpearse/scanned/notovitch.htm">tertullian.org</a>).',
}

# ---------- NOTES (clau → html, {f:clau} = enllaç a font) ----------
N = {
 'sallman': 'Warner Sallman, <i lang="en">Head of Christ</i> (1940, basat en un carbó del 1924), repartit en còpies de butxaca als soldats nord-americans per la YMCA i l\'Exèrcit de Salvació; més de 500 milions d\'impressions documentades per David Morgan {f:morgan} {f:blum}.',
 'nom': '<i>Iēsoûs</i> com a traducció de <i>Yeshuaʿ</i>, forma curta de <i>Yehoshuaʿ</i> (Josuè), i la Septuaginta, que ja escriu Josuè Ἰησοῦς. La lectura «Jahvè salva» és la tradicional (Mt 1,21); la <i lang="en">Jewish Encyclopedia</i> en proposa una altra {f:brit_nom}.',
 'noms': 'Freqüència dels noms jueus a la Palestina del 330 aC – 200 dC: Tal Ilan (2002) i Richard Bauckham (2006/2017) {f:ilan}.',
 'crist': 'Britannica, «Jesus»: <i lang="en">Christ was not originally a name but a title</i>. Suetoni, <i>Claudi</i> 25,4: <i lang="la">«Iudaeos impulsore Chresto assidue tumultuantis Roma expulit»</i>; l\'editor de l\'edició Loeb hi veu un error per <i lang="la">Christus</i>, però el debat continua obert {f:brit_nom} {f:suetoni}.',
 'j': 'La J va néixer com una variant gràfica de la I; la diferenciació «va començar cap al segle XIV i no es va completar fins al XVII» (Britannica). Gian Giorgio Trissino va proposar distingir <i>i</i> i <i>j</i> el 1524. El Nou Testament del rei Jaume del 1612 encara porta al títol «Iesus Christ» {f:brit_nom}.',
 'arameu': 'L\'arameu, llengua de Jesús i dels apòstols (Britannica). Sobre el paper de l\'hebreu i el grec, que es debat: Buth &amp; Notley (2014) {f:arameu}.',
 'marc': f'Paraules arameues a Marc: {mc(3,17)}, {mc(5,41)}, {mc(7,34)}, {mc(14,36)} i {mc(15,34)} (BCI) {{f:bci}}.',
 'dionis': 'Dionís l\'Exigu (525), que va continuar les taules pasquals de Ciril d\'Alexandria (comptades en anys de Dioclecià) i va preferir comptar <i lang="la">ab incarnatione</i>, i el seu error de càlcul; difusió per Beda (<i lang="la">De temporum ratione</i>, 725; <i lang="la">Historia ecclesiastica</i>, 731); absència de l\'any zero {f:dionis}.',
 'herodes': 'Mort d\'Herodes el març o l\'abril del 4 aC i naixement de Jesús cap al 6–4 aC (Britannica); eclipsi de lluna a Flavi Josep, <i>Antiguitats</i> XVII, 6,4. Una minoria d\'estudiosos situa la mort d\'Herodes l\'1 aC {f:herodes} {f:brit_nom}.',
 'mort': 'Pilat, prefecte del 26 al 36 dC; crucifixió «entre el 29 i el 33 dC, possiblement el 30» (Britannica); el divendres 3 d\'abril del 33 segons Humphreys &amp; Waddington (1983) {f:herodes} {f:humphreys}.',
 'nadal': 'Primera atestació del 25 de desembre a la <i lang="la">Depositio martyrum</i> del Cronògraf de 354 (llista probablement redactada cap al 336) i <i lang="la">N·INVICTI·CM·XXX</i> al calendari de Filòcal del mateix còdex. Un passatge d\'Hipòlit (c. 204) ja dona la data, però la seva autenticitat es discuteix. Teories del Sol Invicte i del càlcul, i dates armènia i juliana: McGowan (2002) i Britannica {f:cronograf}.',
 'tarragona': 'Concili provincial de Tarragona del 1180, sota l\'arquebisbe Berenguer de Vilademuls; abans ja hi convivien les dues datacions, amb predomini dels anys dels reis francs, i era hispànica (del 38 aC; abolida a Castella el 1383 i a Portugal el 1422) {f:tarragona}.',
 'existencia': 'Existència de Jesús, baptisme i crucifixió com a fets gairebé unànimement acceptats: Ehrman (2012), Dunn (2003) i E. P. Sanders (1993) {f:ehrman} {f:sanders}.',
 'autors': 'Flavi Josep, <i>Antiguitats</i> XX, 200 (Jaume) i XVIII, 63–64 (el <i lang="la">Testimonium Flavianum</i>, amb un nucli probablement autèntic i afegits cristians); Tàcit, <i>Annals</i> XV, 44: <i lang="la">«Christus Tiberio imperitante per procuratorem Pontium Pilatum supplicio adfectus erat»</i> {f:autors}.',
 'objectes': 'Pedra de Pilat (Cesarea, 1961), ossari de Caifàs (Jerusalem, 1990; identificació probable però no segura), taló de Yehohanan (Giv\'at ha-Mivtar, 1968; altres casos: un de possible a Gavello, Itàlia, publicat el 2018, i un a Fenstanton, Anglaterra, amb el clau al taló, datat entre el 130 i el 360 dC i publicat el 2021), sinagoga de Magdala (2009; IAA: 50 aC – 100 dC), barca de Galilea (1986) i judici de l\'ossari de Jaume (2012) {f:objectes}.',
 'sindone': 'Datació de la Síndone per tres laboratoris (Arizona, Oxford i Zuric): 1260–1390 dC amb un 95 % de confiança {f:damon}.',
 'natzaret': 'Població estimada de Natzaret (Reed 2000: 200–400; Dark 2020: 400–1.000) i cases del segle I: Dark (2012) i excavació de Yardenna Alexandre per a l\'IAA (2009) {f:reed} {f:dark}.',
 'tekton': f'Jesús anomenat <i lang="el">téktōn</i>: {mc(6,3)} (BCI). Ofici rural: John P. Meier (1991) i E. P. Sanders (1993) {{f:sanders}}.',
 'lectura': 'Alfabetització: Meir Bar-Ilan (1992, menys d\'un 3 %), amb qui coincideix Catherine Hezser (2001); William V. Harris (1989, ~10 % a l\'Imperi romà) {f:harris}.',
 'taylor': f'Absència de descripció física als evangelis ({mc(14,44)}, BCI), pell, cabells, roba i complexió: Joan E. Taylor (2018) {{f:taylor}}.',
 'alcada': 'Alçada mitjana jueva del segle I (homes 166 cm, dones 147 cm): Nagar &amp; Torge (2003), corroborada per Arensburg &amp; Rak (1975) {f:nagar} {f:taylor}.',
 'yehohanan': 'Yehohanan: alçada estimada per Haas (1970) i reavaluació de Zias &amp; Sekeles (1985) {f:nagar} {f:objectes}.',
 'goliat': 'Necròpolis de Jericó (mitjana masculina ~169 cm) i ossari de Yeho\'ezer «Goliat» (~188,5 cm): Hachlili (1979) i Hachlili &amp; Smith (1979) {f:nagar}.',
 'cabells': 'Pau sobre els cabells: <a href="https://bci.cat/biblia/capitol/1265#verse-1265-14">1Co 11,14</a> (BCI); anàlisi de Taylor (2018) {f:taylor}.',
 'tzitzit': f'«La borla del seu mantell» (<i lang="el">kráspedon</i> = <i lang="he">tzitzit</i>): {mc(6,56)} (BCI), prescrit a Nm 15,38–39 {{f:taylor}}.',
 'alexamenos': 'Grafit d\'Alexàmenos, Palatí (Roma), c. 200: ΑΛΕΞΑΜΕΝΟΣ ΣΕΒΕΤΕ ΘΕΟΝ, «Alexàmenos venera [el seu] déu» (Solin &amp; Itkonen-Kaila 1966, núm. 246). Una gemma màgica del British Museum (1986,0501.1, s. II–III) és una altra de les representacions més antigues de la crucifixió {f:colosseo} {f:jensen}.',
 'imberbe': 'Dura-Europos (c. 232, Yale 1932.1202), catacumbes de Priscil·la i Cal·lixt, mosaic de Hinton St Mary (British Museum; la identificació amb Crist és la més acceptada, però es discuteix) i sarcòfag de Juni Bas (359): Robin M. Jensen (2005) {f:jensen}.',
 'barbut': 'Commodil·la, Santa Pudenziana (c. 401–417), Sant\'Apollinare Nuovo (c. 500–526), Pantocràtor del Sinaí (s. VI) i <i lang="la">solidus</i> de Justinià II (692–695) {f:jensen}.',
 'medieval': 'Seda de Dunhuang (s. IX, British Museum, identificació debatuda), Pantocràtor de Taüll (c. 1123, MNAC), evangelis etíops il·lustrats i <i>Carta de Lèntul</i> (s. XIII–XIV, impresa el 1474) {f:jensen} {f:taylor}.',
 'mon': 'Mosaic de plomes de la Missa de sant Gregori (Mèxic, 1539), crucifix del Congo (Met), miniatura mogol del <i>Mir\'at al-quds</i> (1602–1604), Sant Sopar de Cusco atribuït a Marcos Zapata (c. 1753) i fumi-e (introduïts cap al 1628–1629, abolits el 1858) {f:mon}.',
 'rembrandt': 'Rembrandt, <i>Cap de Crist</i> (c. 1648, Gemäldegalerie Berlin); l\'inventari del 1656 registra diversos caps de Crist, entre ells <i lang="nl">«een Christus tronie nae\'t leven»</i>. DeWitt (ed.), <i lang="en">Rembrandt and the Face of Jesus</i> (2011) {f:jensen}.',
 'ari': 'Institut d\'Eisenach (fundat el 6 de maig de 1939 per Walter Grundmann) i antecedents del segle XIX (Renan, 1863; Chamberlain, 1899): Susannah Heschel (2008) {f:heschel}.',
 'cinema': '<i lang="en">Jesus of Nazareth</i> (sèrie de l\'ITC i la RAI, 1977; l\'anècdota de Zeffirelli només consta en fonts secundàries) i Kim Ki-chang (<i>Vida de Jesús</i> en <i lang="ko">hanbok</i>, 1952–1953) {f:blum} {f:jensen}.',
 'neave': 'Reconstrucció forense de Richard Neave per a <i lang="en">Son of God</i> (BBC, 2001): un tipus d\'home jueu del segle I, no un retrat; valoració crítica de Joan E. Taylor (2018) {f:bbc} {f:taylor}.',
 'islam': 'Alcorà 3,45 (al-Masīḥ ʿĪsā ibn Maryam), 3,47 i 19,20 (naixement virginal), 4,157–158 (crucifixió; traducció pròpia de <i lang="ar">wa-lākin shubbiha lahum</i>), 4,171 i 19,35 (no és fill de Déu). Recompte: ʿĪsā 25 vegades, Maryam 34, Muhammad 4. Musulmans al món el 2020: Pew Research Center (2025) {f:quran} {f:pew}.',
 'ocells': 'Alcorà 19,23–25 (la palmera), 19,29–30 (el bressol), 3,49 i 5,110 (els ocells d\'argila). Evangeli de la infància de Tomàs, cap. II (dotze pardals), datat probablement a mitjan segle II {f:quran} {f:tomas}.',
 'maria': 'Maria és l\'única dona anomenada a l\'Alcorà (Smith &amp; Haddad, 1989). Mencions de la mare de Jesús pel nom al Nou Testament: Mateu 5, Marc 1, Lluc 12, Fets 1; Joan, cap. Comptant totes les Maries (Magdalena, la de Betània, etc.), el Nou Testament escriu el nom unes 54 vegades {f:quran}.',
 'talmud': 'Talmud de Babilònia, Sanhedrín 43a (<i>«la vigília de Pasqua van penjar Jesús el Natzarè»</i>, acusat de bruixeria i d\'incitar Israel); lectura de Peter Schäfer (2007), segons qui la polèmica només era possible en la relativa llibertat de la Babilònia persa. Si aquest Yeshu és el Jesús històric es discuteix {f:schafer}.',
 'jueus': 'Joseph Klausner, <i>Yeshu ha-Notsri</i> (1922); Geza Vermes (1973); Amy-Jill Levine (2006) {f:jueus}.',
 'xian': 'Estela de Xi\'an (781), de l\'Església d\'Orient (<i>Jingjiao</i>, «religió lluminosa»); segons el text, el primer missioner, Aluoben, venia de Daqin, el món romà i siríac {f:xian}.',
 'japo': 'Prohibició del cristianisme (1614–1873), cristians amagats (<i>Kakure Kirishitan</i>) i la Mare de Déu disfressada de Kannon {f:japo} {f:mon}.',
 'hong': 'Hong Xiuquan (1814–1864), el fullet de Liang Fa i el Regne Celestial dels Taiping; uns 20 milions de morts segons Britannica i Columbia University (altres estimacions són més altes) {f:hong}.',
 'shingo': 'La «tomba de Crist» de Shingō (Aomori) i els documents Takenouchi, considerats un fals; festa de Crist des del 1964 {f:shingo}.',
 'notovitch': 'Nicolas Notovitch, <i lang="fr">La vie inconnue de Jésus-Christ</i> (1894), desmuntada per Max Müller (1894) i J. Archibald Douglas (1896) {f:notovitch}.',
 'jueu': '«Cristians» a Antioquia: <a href="https://bci.cat/biblia/capitol/1219#verse-1219-26">Ac 11,26</a> (BCI). Judaisme observant de Jesús i proximitat als fariseus: E. P. Sanders (1985), Amy-Jill Levine (2006) i Paula Fredriksen (1999) {f:sanders}.',
 'apocaliptic': f'Profeta apocalíptic: {mc(9,1)} i {mc(13,30)} (BCI); Schweitzer (1906), Sanders (1985), Ehrman (1999) i Fredriksen (1999). Una minoria (John Dominic Crossan) el llegeix com un savi no apocalíptic {{f:sanders}} {{f:schweitzer}}.',
 'germans': f'{mc(3,21)}, {mc(6,3)}, <a href="https://bci.cat/biblia/capitol/1286#verse-1286-19">Ga 1,19</a> (BCI) i Flavi Josep, <i>Antiguitats</i> XX, 200. Lectures catòlica (sant Jeroni, cosins) i ortodoxa (Protoevangeli de Jaume, germanastres) {{f:sanders}} {{f:bci}}.',
 'roma': f'{mc(15,26)} (BCI), Tàcit, <i>Annals</i> XV, 44, i l\'argument de Paula Fredriksen (1999) sobre els deixebles que no van ser detinguts {{f:sanders}} {{f:bci}}.',
 'mirall': 'Albert Schweitzer es va llicenciar en medicina el 1913. George Tyrrell va ser expulsat de la Companyia de Jesús el 1906; el llibre és pòstum. Albert Schweitzer, <i lang="de">Von Reimarus zu Wrede</i> (1906); George Tyrrell, <i lang="en">Christianity at the Cross-Roads</i> (1909), p. 44 {f:schweitzer}.',
 'barton': 'Bruce Barton, <i lang="en">The Man Nobody Knows</i> (1925), número 1 de no-ficció als EUA el 1926 segons <i lang="en">Publishers Weekly</i> {f:barton}.',
 'apropiacions': 'El Jesús dels anys seixanta (Prothero, 2003) i el Jesús masculí i nacionalista de part de l\'evangelisme blanc nord-americà (Du Mez, 2020); vegeu també Crossley (2012) {f:prothero}.',
 'yougov': 'YouGov UK (23 de desembre de 2021) i YouGov USA (22 de desembre de 2020) {f:yougov}.',
 'plos': 'Jackson, Hester &amp; Gray, <i lang="en">PLOS ONE</i> 13(6): e0198745 (2018) {f:plos}.',
}

body = open(SP + 'body.html').read()
body = body.replace('{{OBJECTES}}', OBJECTES).replace('{{MON}}', MON)
body = body.replace('{{PLATES_ABC}}', open(SP + 'plates-abc.html').read()).replace('{{PLATE_EUROPA}}', open(SP + 'plate-europa.html').read())

# numeració de notes per ordre d'aparició
order, cnt = [], {}
def rep(m):
    k = m.group(1)
    if k not in N: raise SystemExit('nota desconeguda: ' + k)
    if k not in order: order.append(k)
    n = order.index(k) + 1
    cnt[k] = cnt.get(k, 0) + 1
    suf = '' if cnt[k] == 1 else chr(ord('a') + cnt[k] - 1)
    return f'<sup class="nr"><a href="#nota-{n}" id="ref-{n}{suf}" aria-label="Nota {n}">{n}</a></sup>'
body = re.sub(r'\[\[([a-z_]+)\]\]', rep, body)

forder = []
def frep(m):
    k = m.group(1)
    if k not in F: raise SystemExit('font desconeguda: ' + k)
    if k not in forder: forder.append(k)
    return f'<a class="fr" href="#font-{forder.index(k)+1}">[{forder.index(k)+1}]</a>'
notes = []
for i, k in enumerate(order):
    html = re.sub(r'\{f:([a-z_]+)\}', frep, N[k])
    notes.append(f'    <li id="nota-{i+1}"><a class="bk" href="#ref-{i+1}" aria-label="Torna al text">↑</a> {html}</li>')
fonts = [f'    <li id="font-{i+1}">{F[k]}</li>' for i, k in enumerate(forder)]
unused = [k for k in N if k not in order]
if unused: print('NOTES SENSE ÚS:', unused)
body = body.replace('{{NOTES}}', '\n'.join(notes)).replace('{{FONTS}}', '\n'.join(fonts))

head = open(SP + 'head.html').read()
desc = "No es deia Jesús, va néixer uns anys «abans de Crist» i cap text antic no descriu la seva cara: què en sap la història, com l'ha pintat cada cultura del món i com el veuen altres religions."
head = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + desc, head)
head = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + desc, head)
tail = '''
<footer class="ib-foot">
  <a href="../../"><img src="../../assets/logo.png" alt="Inspired by Magazine" width="1600" height="192"></a>
</footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js" integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js" integrity="sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67" crossorigin="anonymous"></script>
<script src="../../assets/scrolly.js"></script>
<script src="../../assets/ib-viz.js"></script>
<script src="dades.js"></script>
<script src="article.js"></script>
<script src="nom-i-temps.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open(ART + 'index.html', 'w').write(head + '\n' + body + tail)
print('notes', len(order), 'fonts', len(forder))
