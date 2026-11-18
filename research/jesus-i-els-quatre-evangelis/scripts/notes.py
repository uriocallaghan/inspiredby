import re,sys
s=open('src.html').read()
BASE={'Mt':1115,'Mc':1144,'Lc':1161,'Jn':1186,'Ac':1208,'Rm':1237,'1Co':1254,'Ga':1285,'1Te':1309}
F=[('G','Associació Bíblica de Catalunya. <i>Bíblia catalana. Traducció interconfessional</i> (BCI). Evangelis i Fets dels Apòstols, amb les notes textuals. <a href="https://bci.cat/biblia">Edició digital</a>'),
('P','Pau. <i>Cartes als Tessalonicencs, als Corintis, als Gàlates i als Romans</i>, BCI. Per a la data i el lloc de 1 Corintis: Yale Bible Study, «1 Corinthians: Introduction». <a href="https://bci.cat/biblia/capitol/1265">1 Corintis 11</a> · <a href="https://yalebiblestudy.org/courses/1-corinthians/lessons/introduction-to-the-course-13/">Introducció a 1 Corintis</a>'),
('H','Sanders, E. P. «Jesus». <i>Encyclopaedia Britannica</i>. Martin, Dale B. «The Historical Jesus», RLST 152, Open Yale Courses, 2009. NABRE, nota a Lluc 2,1–2 (cens de Quirini). «First Jewish Revolt», <i>Encyclopaedia Britannica</i>. <a href="https://www.britannica.com/biography/Jesus">Jesús</a> · <a href="https://oyc.yale.edu/religious-studies/rlst-152/lecture-13">Jesús històric</a> · <a href="https://www.biblegateway.com/passage/?search=Luke%202&amp;version=NABRE">Lluc 2, nota</a> · <a href="https://www.britannica.com/event/First-Jewish-Revolt">Guerra de Judea</a>'),
('B','«Herod Antipas» i «Pontius Pilate». <i>Encyclopaedia Britannica</i>. Antipes, tetrarca de Galilea i Perea; Pilat, prefecte de Judea del 26 al 36. <a href="https://www.britannica.com/biography/Herod-Antipas">Herodes Antipes</a> · <a href="https://www.britannica.com/biography/Pontius-Pilate">Ponç Pilat</a>'),
('J','Flavi Josep. <i>Antiguitats jueves</i>, XVIII, 1–4 i 116–119; XX, 200 i 267. Traducció de William Whiston (Universitat de Chicago) i text grec de B. Niese (Perseus Digital Library). <a href="https://penelope.uchicago.edu/josephus/ant-18.html">Llibre XVIII</a> · <a href="https://penelope.uchicago.edu/josephus/ant-20.html">Llibre XX</a> · <a href="https://github.com/PerseusDL/canonical-greekLit/blob/master/data/tlg0526/tlg001/tlg0526.tlg001.perseus-grc2.xml">Text grec</a>'),
('T','Tàcit. <i>Annals</i>, XV, 44. Traducció de John Jackson, Loeb Classical Library, a LacusCurtius (Universitat de Chicago). <a href="https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Tacitus/Annals/15B*.html#44">Text</a>'),
('M','Martin, Dale B. <i>Introduction to New Testament History and Literature</i>, Open Yale Courses, 2009 (classes sobre Pau, Marc, Mateu, Lluc i Joan). Lathrop, Gordon W. <i>The Four Gospels on Sunday</i>. Fortress Press, 2012, pp. 28–30. <a href="https://oyc.yale.edu/religious-studies/rlst-152/lecture-6">Marc</a> · <a href="https://oyc.yale.edu/religious-studies/rlst-152/lecture-7">Mateu</a> · <a href="https://oyc.yale.edu/religious-studies/rlst-152/lecture-9">Lluc</a> · <a href="https://oyc.yale.edu/religious-studies/rlst-152/lecture-11">Joan</a> · <a href="https://ms.augsburgfortress.org/downloads/9780800698522Chapter1.pdf">Datacions</a>'),
('C','Yale Divinity School. «New Testament». <i>Formation of the Biblical Canon</i>, Yale Bible Study. Cartes, col·leccions, Justí, Tacià, Ireneu i Atanasi. <a href="https://yalebiblestudy.org/courses/formation-of-the-biblical-canon/lessons/new-testament-study-guide/">Guia d\'estudi</a>'),
('U','Justí. <i>Primera apologia</i>, 66–67. Text grec de G. Rauschen (Bonn, 1911), Open Greek and Latin, First1KGreek. <a href="https://github.com/OpenGreekAndLatin/First1KGreek/blob/master/data/tlg0645/tlg001/tlg0645.tlg001.1st1K-grc1.xml">Text grec</a>'),
('I','Ireneu de Lió. <i>Contra les heretgies</i>, III, 11, 8. Traducció d\'A. Roberts i W. Rambaut, <i>Ante-Nicene Fathers</i>, vol. 1, 1885. <a href="https://www.newadvent.org/fathers/0103311.htm">Text</a>'),
('A','Atanasi d\'Alexandria. <i>Carta festal</i> 39, §5 (367). <a href="https://www.newadvent.org/fathers/2806039.htm">Text</a>'),
('N','Tauber, J. K., ed. <i>MorphGNT: SBLGNT Edition</i>, versió 6.12, 2017 (text grec SBLGNT de la Society of Biblical Literature amb lematització). DOI: <a href="https://doi.org/10.5281/zenodo.376200">10.5281/zenodo.376200</a> · <a href="https://github.com/morphgnt/sblgnt">Dades</a>'),
('E','Eusebi de Cesarea. Seccions i taules canòniques dels evangelis (segle IV), descrites a la <i>Carta a Carpià</i>. Edició digital de domini públic de K. P. Edgecomb, alineada amb el text SBLGNT per A. Baker. <a href="https://github.com/adamb924/eusebian-canons">Dades</a>'),
('R','Natural Earth. Costa, terra, llacs i rius, escales 1:10m i 1:50m. Domini públic. <a href="https://www.naturalearthdata.com/">Natural Earth</a>'),
]
idx={k:i+1 for i,(k,_) in enumerate(F)}
def ref(m):
    t=m.group(1); b,rest=t.split(' ',1)
    c=re.match(r'(\d+)(?:,(\d+))?',rest); ch=int(c.group(1)); v=c.group(2)
    url=f'https://bci.cat/biblia/capitol/{BASE[b]+ch}'+(f'#verse-{BASE[b]+ch}-{v}' if v else '')
    return f'<a href="{url}">{t}</a>'
notes=[]
def note(m):
    body=m.group(1)
    body=re.sub(r'\{([^}]+)\}',ref,body)
    body=re.sub(r'@([A-Z])\b',lambda x:f'<a class="fr" href="#font-{x.group(1)}">[{idx[x.group(1)]}]</a>',body)
    n=len(notes)+1; notes.append(body)
    return f'<sup class="nr"><a href="#nota-{n}" id="ref-{n}" aria-label="Nota {n}">{n}</a></sup>'
s=re.sub(r'\[\[(.+?)\]\]',note,s,flags=re.S)
nl=''.join(f'<li id="nota-{i+1}"><a class="bk" href="#ref-{i+1}" aria-label="Torna al text">↑</a> {b.strip()}</li>' for i,b in enumerate(notes))
fl=''.join(f'<li id="font-{k}">{t}</li>' for k,t in F)
s=s.replace('%%NOTES%%',nl).replace('%%FONTS%%',fl)
open('body.html','w').write(s)
print(len(notes),'notes')
