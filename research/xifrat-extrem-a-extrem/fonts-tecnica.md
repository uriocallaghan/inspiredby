# Xifrat d'extrem a extrem: fonts tècniques, històriques i polítiques

Recerca per a l'article sobre el xifrat d'extrem a extrem (E2EE). Una entrada per afirmació. Les cites són literals i curtes (menys de 15 paraules), en l'idioma original. Totes les URL i els DOI es van obrir el 2026-11-20. Els DOI es van resoldre amb l'API de Crossref (títol, autors, revista, volum i pàgines coincideixen). Quan alguna cosa no s'ha pogut verificar, es diu explícitament.

Llegenda de la nota de verificació:
- **Comprovat**: obert i comprovat el 2026-11-20; la font diu el que s'hi atribueix.
- **Comprovat (metadades)**: DOI resolt i metadades comprovades; el text complet no era accessible (mur de pagament o bloqueig), i el contingut ve d'una còpia o resum que sí s'ha obert.
- **No verificat**: no s'ha pogut obrir la font primària. No s'ha de publicar sense revisar-ho.

---

## 1. Què és l'E2EE (davant del xifrat en trànsit i del xifrat en repòs)

**1.1 Xifrat en trànsit (TLS).** El xifrat de la capa de transport (TLS) protegeix el missatge entre el teu dispositiu i el servidor de l'aplicació; el servidor el pot llegir.
- Cita: «protects messages as they travel from your device to the app’s servers»
- Font: Electronic Frontier Foundation, *Surveillance Self-Defense*, «What Should I Know About Encryption?». https://ssd.eff.org/module/what-should-i-know-about-encryption
- Verificació: comprovat el 2026-11-20.

**1.2 Xifrat d'extrem a extrem.** Protegeix el missatge des de l'emissor fins al receptor; ni els servidors de l'aplicació el poden llegir.
- Cites: «End-to-end encryption protects messages in transit all the way from sender to receiver.» / «No one, including the servers of the app you are using, can “listen in”»
- Font: EFF SSD, mateixa pàgina.
- Verificació: comprovat el 2026-11-20.

**1.3 Xifrat en repòs.** Les dades «en repòs» són les emmagatzemades (mòbil, portàtil, servidor, disc extern); es protegeixen amb xifrat de disc complet («device encryption»).
- Cita: «Data “at rest” is data that is stored somewhere»
- Font: EFF SSD, mateixa pàgina.
- Verificació: comprovat el 2026-11-20.

**1.4 Definició del NIST (atenció: és antiga i més estreta).** El glossari del NIST defineix l'E2EE com a xifrat de comunicacions en què les dades van xifrades per la xarxa però les dades d'encaminament queden visibles. És útil per a la idea de les metadades, però no és la definició moderna (no parla de qui té les claus).
- Cita: «but routing information remains visible.»
- Font: NIST CSRC Glossary, «end-to-end encryption», que remet a NIST SP 800-12 Rev. 1 (DOI 10.6028/NIST.SP.800-12r1). https://csrc.nist.gov/glossary/term/end_to_end_encryption
- Verificació: comprovat el 2026-11-20.

**1.5 Definició de WhatsApp (whitepaper).** WhatsApp defineix l'E2EE com a comunicacions que es mantenen xifrades d'un dispositiu controlat per l'emissor a un de controlat pel receptor, sense que cap tercer, «ni tan sols WhatsApp o Meta», hi pugui accedir. Les converses amb empreses que fan servir la Cloud API de Meta **no** les considera E2EE.
- Cita: «not even WhatsApp or our parent company Meta, can access the content»
- Font: WhatsApp, *WhatsApp Encryption Overview. Technical white paper*, versió 10, 30-10-2026, apartat «Defining End-to-End Encryption», p. 36. https://www.whatsapp.com/security/WhatsApp-Security-Whitepaper.pdf
- Verificació: PDF descarregat i llegit el 2026-11-20.

---

## 2. Els orígens de la criptografia de clau pública

**2.1 Diffie i Hellman (1976).** Primer article públic sobre criptografia de clau pública i intercanvi de claus.
- Referència: W. Diffie i M. E. Hellman, «New Directions in Cryptography», *IEEE Transactions on Information Theory*, vol. 22, núm. 6, pp. 644–654, novembre de 1976. DOI: 10.1109/TIT.1976.1055638
- Verificació: comprovat (metadades) el 2026-11-20. IEEE Xplore no va servir el text; no he pogut citar-ne literalment l'abstract.

**2.2 RSA (1978).** Rivest, Shamir i Adleman publiquen el primer sistema pràctic de xifrat i signatura de clau pública.
- Referència: R. L. Rivest, A. Shamir i L. Adleman, «A Method for Obtaining Digital Signatures and Public-Key Cryptosystems», *Communications of the ACM*, vol. 21, núm. 2, pp. 120–126, febrer de 1978. DOI: 10.1145/359340.359342
- Verificació: comprovat (metadades) el 2026-11-20. Ellis (2.4) en dona com a precedent el memoràndum tècnic del MIT del 4-4-1977.

**2.3 El GCHQ ja ho sabia, en secret (1969/1970–1975).** La placa de l'IEEE Milestone, inaugurada el 5-10-2010 a Cheltenham, diu que el 1975 James Ellis ja havia demostrat que no calia un sistema de clau secreta, que Clifford Cocks i Malcolm Williamson van mostrar com fer-ho i que tot es va mantenir en secret fins al 1997.
- Cita: «the essential principles were known but were kept secret until 1997.»
- Font: IEEE / Engineering and Technology History Wiki, «Milestones: Invention of Public-key Cryptography, 1969–1975» (Milestone núm. 104). https://ethw.org/Milestones:Invention_of_Public-key_Cryptography,_1969_-_1975
- Verificació: comprovat el 2026-11-20.

**2.4 Dates exactes dels informes del GCHQ/CESG.** Segons l'història interna escrita pel mateix Ellis i desclassificada el 1997:
- J. H. Ellis, «The Possibility of Secure Non-Secret Digital Encryption», CESG Report, **gener de 1970**.
- C. C. Cocks, «A Note on Non-Secret Encryption», CESG Report, **20 de novembre de 1973** («This is essentially the RSA Algorithm»).
- M. J. Williamson, «Non-Secret Encryption Using a Finite Field», CESG Report, **21 de gener de 1974** (equivalent a Diffie-Hellman).
- Cita: «I published the existence theorem in 1970»
- Font: J. H. Ellis, «The History of Non-Secret Encryption» (text del CESG, 1987, publicat el 1997), còpia a https://www.cryptocellar.org/cesg/ellis.pdf. Publicat també a *Cryptologia* 23(3):267–273, 1999, DOI 10.1080/0161-119991887919 (metadades comprovades a Crossref).
- Verificació: PDF de cryptocellar descarregat i llegit el 2026-11-20. Atenció: cryptocellar és un arxiu privat de confiança (Frode Weierud), no el web del GCHQ. La versió de *Cryptologia* és la referència publicable.

**2.5 Fitxa oficial del GCHQ d'Ellis.** Va concebre la «non-secret encryption». Va morir el novembre de 1997, «un mes abans» de l'anunci públic.
- Cita: «just a month before the public announcement of the GCHQ achievement»
- Font: GCHQ, «James Ellis». https://www.gchq.gov.uk/person/james-ellis
- Verificació: comprovat el 2026-11-20. **Atenció:** aquesta pàgina diu «The discovery in 1973», que no quadra amb el 1970 de l'informe d'Ellis. Probablement es refereix a la solució pràctica de Cocks. Al text, cal fer servir les dates de 2.4.

**2.6 Williamson (GCHQ).** Fitxa oficial: un dels creadors de la criptografia de clau pública al GCHQ als anys setanta; premi IEEE Milestone el 2010 juntament amb Cocks i Ellis.
- Cita: «One of the originators of Public Key Cryptography at GCHQ in the 1970s»
- Font: GCHQ, «Malcolm Williamson». https://www.gchq.gov.uk/person/malcolm-williamson
- Verificació: comprovat el 2026-11-20. La fitxa de la NSA (nsa.gov) va retornar error 403 i no s'ha pogut fer servir.

---

## 3. Principi de Kerckhoffs (1883)

**3.1** El segon dels sis «desiderata» de Kerckhoffs: el sistema no ha de requerir secret i ha de poder caure en mans de l'enemic sense cap inconvenient. Només la clau ha de ser secreta.
- Cita literal: «Il faut qu’il n’exige pas le secret, et qu’il puisse sans inconvénient tomber entre les mains de l’ennemi»
- Font: Auguste Kerckhoffs, «La cryptographie militaire», *Journal des sciences militaires*, vol. IX, gener de 1883, apartat II «Desiderata de la cryptographie militaire», p. 12. Facsímil: https://www.petitcolas.net/kerckhoffs/crypto_militaire_1.pdf (la segona part, febrer de 1883, pp. 161–191, és a crypto_militaire_2.pdf).
- Verificació: PDF del facsímil descarregat i text llegit el 2026-11-20. La cita fa 19 paraules, més del límit de 15; a l'article se'n pot fer servir la primera meitat («Il faut qu’il n’exige pas le secret») i parafrasejar la resta.

---

## 4. El protocol Signal

**4.1 X3DH.** Protocol d'acord de claus «Extended Triple Diffie-Hellman». Autors: Moxie Marlinspike i Trevor Perrin (editor). Revisió 1, 4-11-2016.
- Cita: «This document describes the "X3DH" (or "Extended Triple Diffie-Hellman") key agreement protocol.»
- Font: https://signal.org/docs/specifications/x3dh/
- Verificació: comprovat el 2026-11-20.

**4.2 Double Ratchet.** Algorisme dissenyat per Trevor Perrin i Moxie Marlinspike. Revisió 1, 20-11-2016; la vigent és la revisió 4, 4-11-2025 (Rolfe Schmidt n'és coautor des de la revisió 3).
- Cita (definició de la «forward security»): «Output keys from the past appear random to an adversary who learns the KDF key»
- Cita (definició de la «break-in recovery», és a dir, la seguretat postcompromís): «Future output keys appear random to an adversary who learns the KDF key», sempre que les entrades futures hi afegeixin prou entropia.
- Font: https://signal.org/docs/specifications/doubleratchet/ (revisió 4). Revisió 1, a l'arxiu de whispersystems.org: https://web.archive.org/web/2016id_/https://whispersystems.org/docs/specifications/doubleratchet/
- Verificació: comprovat el 2026-11-20.
- Explicació per al lector: el secret cap enrere (*forward secrecy*) vol dir que, si avui et roben la clau, no poden llegir els missatges d'ahir. La seguretat postcompromís (*post-compromise security*, que Signal anomena *break-in recovery*) vol dir que, al cap de pocs missatges, el lladre també deixa de poder llegir els de demà.

**4.3 PQXDH.** «Post-Quantum Extended Diffie-Hellman». Autors: Ehren Kret i Rolfe Schmidt. Revisió 3 (24-5-2023, darrera actualització 23-1-2024). Fa servir un KEM postquàntic com a paràmetre; l'exemple de l'especificació és CRYSTALS-Kyber-1024.
- Cita: «This document describes the “PQXDH” (or “Post-Quantum Extended Diffie-Hellman”) key agreement protocol.»
- Font: https://signal.org/docs/specifications/pqxdh/
- Verificació: comprovat el 2026-11-20.

**4.4 Signal adopta PQXDH (19-9-2023).** Combina X25519 (clàssic) i CRYSTALS-Kyber (postquàntic): caldria trencar-los tots dos. Motiu declarat: un ordinador quàntic futur i l'amenaça de «recollir ara, desxifrar després».
- Cita: «adding a layer of protection against the threat of a quantum computer»
- Font: Ehren Kret, «Quantum Resistance and the Signal Protocol», Signal Blog, 19-9-2023. https://signal.org/blog/pqxdh/
- Verificació: comprovat el 2026-11-20.

**4.5 SPQR i el «Triple Ratchet» (2-10-2025).** Signal afegeix un tercer trinquet postquàntic, el Sparse Post-Quantum Ratchet (SPQR), basat en ML-KEM 768, que es combina amb el Double Ratchet: és el «Triple Ratchet». L'especificació tècnica es diu «ML-KEM Braid».
- Cites: «the Sparse Post Quantum Ratchet» / «in a combination we refer to as the Triple Ratchet»
- Font: Graeme Connell i Rolfe Schmidt, «Signal Protocol and Post-Quantum Ratchets», Signal Blog, 2-10-2025. https://signal.org/blog/spqr/ ; índex d'especificacions: https://signal.org/docs/
- Verificació: comprovat el 2026-11-20.

**4.6 Anàlisi formal.** Primera anàlisi formal de seguretat del protocol: demostra la seguretat del nucli d'intercanvi de claus i no hi troba errors greus de disseny. L'abstract diu que Signal té «well over 1 billion active users» i propietats poc habituals com la seguretat postcompromís.
- Cites: «We have found no major flaws in the design.» / «serving well over 1 billion active users»
- Referència: K. Cohn-Gordon, C. Cremers, B. Dowling, L. Garratt i D. Stebila, «A Formal Security Analysis of the Signal Messaging Protocol», *Journal of Cryptology*, vol. 33, núm. 4, pp. 1914–1983, 2020. DOI: 10.1007/s00145-020-09360-1. Versió de congrés: IEEE EuroS&P 2017, pp. 451–466, DOI 10.1109/EuroSP.2017.27. Preprint: https://eprint.iacr.org/2016/1013
- Verificació: DOI comprovats (metadades) el 2026-11-20; abstract llegit a l'ePrint de la IACR. Springer va redirigir a la pàgina d'accés.

---

## 5. Desplegament real

**5.1 WhatsApp, E2EE complet (5-4-2016).** WhatsApp anuncia que ha completat el xifrat d'extrem a extrem. Aquell dia hi havia «més de mil milions» d'usuaris.
- Cita: «Today more than a billion people are using WhatsApp»
- Font: WhatsApp Blog, «end-to-end encryption», 5-4-2016. https://blog.whatsapp.com/end-to-end-encryption
- Verificació: comprovat el 2026-11-20. El post no esmenta Open Whisper Systems. Ho fa el whitepaper (5.2).

**5.2 WhatsApp fa servir el protocol Signal.** El whitepaper (v1 del 5-4-2016, v10 del 30-10-2026) diu que el protocol Signal, dissenyat per Open Whisper Systems, és la base del seu E2EE. Claus de Curve25519 i, per a cada missatge, una clau AES-256 i una clau HMAC-SHA256.
- Cita: «The Signal Protocol, designed by Open Whisper Systems, is the basis for WhatsApp’s end-to-end encryption.»
- Detall tècnic literal: «32 bytes are used for an AES-256 key, 32 bytes for a HMAC-SHA256 key»
- Font: WhatsApp Encryption Overview, v10, pp. 3–5 (URL de 1.5).
- Verificació: llegit el 2026-11-20. Nota: la v10 no esmenta cap mecanisme postquàntic.

**5.3 Usuaris de WhatsApp: més de 3.000 milions al mes.**
- Cita (Mark Zuckerberg): «WhatsApp now has more than 3 billion monthly actives»
- Font: Meta Platforms, *First Quarter 2025 Results Conference Call*, transcripció oficial, 30-4-2025. https://s21.q4cdn.com/399680738/files/doc_financials/2025/q1/Transcripts/META-Q1-2025-Earnings-Call-Transcript-1.pdf
- Verificació: PDF oficial descarregat i text cercat el 2026-11-20. No he trobat cap xifra oficial més recent només de WhatsApp. Les comunicacions trimestrals posteriors parlen de la «Family of Apps».

**5.4 Messenger, E2EE per defecte (6-12-2023).**
- Cita: «we are rolling out default end-to-end encryption for personal messages and calls»
- Font: Loredana Crisan, «Launching Default End-to-End Encryption on Messenger», Meta Newsroom, 6-12-2023 (actualitzat l'11-12-2023). https://about.fb.com/news/2023/12/default-end-to-end-encryption-on-messenger/
- Verificació: comprovat el 2026-11-20.

**5.5 iMessage PQ3 (21-2-2024).** Apple presenta PQ3, protocol postquàntic per a iMessage, basat en Kyber, que arriba amb iOS 17.4 (i iPadOS 17.4, macOS 14.4 i watchOS 10.4). Segons Apple, és el primer protocol de missatgeria que arriba al seu «Level 3»: criptografia postquàntica tant a l'establiment inicial de claus com al renovament continu.
- Cita: «PQ3 is the first messaging protocol to reach what we call Level 3 security.»
- Font: Apple Security Engineering and Architecture, «iMessage with PQ3: The new state of the art in quantum-secure messaging at scale», Apple Security Research Blog, 21-2-2024. https://security.apple.com/blog/imessage-pq3/
- Verificació: comprovat el 2026-11-20. El «Level 3» és una escala pròpia d'Apple, no un estàndard.

---

## 6. Mida de l'espai de claus

**6.1 AES-256.** L'estàndard AES defineix tres variants: AES-128, AES-192 i AES-256. El número indica la llargada de la clau en bits.
- Cita: «the numerical suffix indicates the bit length of the associated cryptographic keys»
- Font: NIST, FIPS 197, *Advanced Encryption Standard (AES)*, 26-11-2001 (actualitzat el 9-5-2023). https://csrc.nist.gov/pubs/fips/197/final (DOI 10.6028/NIST.FIPS.197-upd1)
- Verificació: comprovat el 2026-11-20.

**6.2 Nombre de claus possibles.** 2^256 = 1,1579 × 10^77 (càlcul exacte en Python).

**6.3 Àtoms de l'univers observable: correcció important.** La comparació habitual «hi ha més claus AES-256 que àtoms a l'univers» és **falsa**. Amb ~10^80 àtoms, 2^256 ≈ 1,2 × 10^77 és unes **600–900 vegades menys**. La comparació correcta seria amb 2^266 (≈ 10^80).
- Càlcul propi documentat, amb els paràmetres de Planck 2018: Ω_b h² = 0,0224; H₀ = 67,4 km/s/Mpc; Ω_m = 0,315.
  - Densitat crítica ρ_c = 3H₀²/(8πG) = 8,53 × 10⁻²⁷ kg/m³; Ω_b = 0,0493; densitat bariònica ρ_b = 4,21 × 10⁻²⁸ kg/m³.
  - Radi comòbil de l'univers observable (integració numèrica de l'equació de Friedmann amb Ω_r ≈ 9 × 10⁻⁵): 46,1 mil milions d'anys llum (14,1 Gpc).
  - Barions (protons i neutrons) = ρ_b · V / m_p = **8,8 × 10^79**. Àtoms (75 % H i 25 % He en massa): **≈ 7 × 10^79**, és a dir, «uns 10^80».
- Font dels paràmetres: Planck Collaboration (N. Aghanim et al.), «Planck 2018 results. VI. Cosmological parameters», *Astronomy & Astrophysics* 641, A6 (2020). DOI: 10.1051/0004-6361/201833910 ; https://arxiv.org/abs/1807.06209
- Verificació: abstract comprovat el 2026-11-20 (valors de Ω_b h², H₀ i Ω_m). El càlcul és meu i reproduïble. No he trobat cap font astronòmica primària que doni «10^80» directament; el lloc més citat (Norvig, Live Science) no és font primària.

**6.4 Temps de força bruta (càlcul propi).** Hipòtesi exageradament generosa: mil milions de màquines, cadascuna capaç de provar 10^18 claus per segon (10^27 claus/s en total). De mitjana cal provar la meitat de l'espai (2^255):
- AES-256: 2^255 / 10^27 = 5,8 × 10^49 s ≈ **1,8 × 10^42 anys** ≈ **1,3 × 10^32 vegades l'edat de l'univers**.
- AES-128 amb la mateixa hipòtesi: ≈ 5.400 anys. Amb una sola màquina de 10^18 claus/s, AES-256 trigaria 1,8 × 10^51 anys.
- Edat de l'univers: 13.820 milions d'anys, segons ESA, «Planck reveals an almost perfect Universe», 21-3-2013. https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_reveals_an_almost_perfect_Universe (comprovat el 2026-11-20).
- Nota: 10^18 claus/s per màquina és una xifra hipotètica (de l'ordre d'un superordinador exaflòpic dedicat només a això), no una mesura. Cal dir-ho al peu del gràfic.

**6.5 Curve25519.** La corba que fan servir Signal i WhatsApp per a l'intercanvi de claus. Article original: D. J. Bernstein, «Curve25519: New Diffie-Hellman Speed Records», *Public Key Cryptography – PKC 2006*, Lecture Notes in Computer Science 3958, pp. 207–228, Springer, 2006. DOI: 10.1007/11745853_14 (metadades comprovades el 2026-11-20).
- Nivell de seguretat: l'RFC 7748 diu que curve25519 és «lleugerament per sota» del nivell estàndard de 128 bits (≈ 2^128 operacions per trencar-la, contra 2^256 de força bruta sobre AES-256).
- Cita: «is slightly under the standard 128-bit level»
- Font: A. Langley, M. Hamburg i S. Turner, RFC 7748, «Elliptic Curves for Security», IRTF, gener de 2016, §7. https://www.rfc-editor.org/rfc/rfc7748
- Verificació: comprovat el 2026-11-20.

---

## 7. Ordinadors quàntics

**7.1 Algorisme de Shor.** Factoritza enters i calcula logaritmes discrets en temps polinòmic en un ordinador quàntic hipotètic. Això trencaria RSA i Diffie-Hellman/corbes el·líptiques.
- Cita: «These algorithms take a number of steps polynomial in the input size»
- Referència: P. W. Shor, «Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer», *SIAM Journal on Computing*, vol. 26, núm. 5, pp. 1484–1509, octubre de 1997. DOI: 10.1137/S0097539795293172. Versió original: *Proceedings of the 35th Annual Symposium on Foundations of Computer Science* (FOCS), 1994. Preprint: https://arxiv.org/abs/quant-ph/9508027
- Verificació: DOI i abstract comprovats el 2026-11-20. La nota de l'arXiv diu «SIAM J. Sci. Statist. Comput.», però el DOI resol a *SIAM J. Comput.*: fes servir la referència del DOI.

**7.2 Algorisme de Grover.** Cerca entre N elements en ~√N passos. Aplicat a les claus simètriques, n'aproxima a la meitat la seguretat efectiva en bits (AES-256 passaria a ~128 bits).
- Cita: «the desired phone number can be obtained in only O(sqrt(N)) steps»
- Referència: L. K. Grover, «A fast quantum mechanical algorithm for database search», *Proceedings of the 28th Annual ACM Symposium on Theory of Computing* (STOC '96), pp. 212–219, 1996. DOI: 10.1145/237814.237866 ; https://arxiv.org/abs/quant-ph/9605043
- Verificació: comprovat el 2026-11-20. «AES-256 → ~128 bits» és una deducció de √N, no una cita de Grover.

**7.3 El xifrat simètric aguanta.** El NCSC (Regne Unit): la seguretat de la criptografia simètrica no queda afectada de manera significativa, i els algorismes amb claus de 128 bits o més (com AES) es poden continuar fent servir. En canvi, RSA, ECDH i ECDSA seran vulnerables a un ordinador quàntic criptogràficament rellevant (CRQC).
- Cita: «the security of symmetric cryptography is not significantly impacted by quantum computers»
- Font: NCSC, «Next steps in preparing for post-quantum cryptography», whitepaper, v2.0, 14-8-2024 (primera versió: novembre de 2023). https://www.ncsc.gov.uk/whitepaper/next-steps-preparing-for-post-quantum-cryptography
- Verificació: comprovat el 2026-11-20.

**7.4 «Recollir ara, desxifrar després».** El mateix document del NCSC: un atacant pot recollir i guardar dades avui i desxifrar-les en el futur; per això un CRQC futur ja és una amenaça rellevant ara. Ho matisa: només val la pena per a informació de molt valor.
- Cites: «collecting and storing data today and decrypting it at some point in the future» / «a CRQC in the future is a relevant threat now»
- Font: NCSC, mateix document.
- Verificació: comprovat el 2026-11-20.

**7.5 Estàndards postquàntics del NIST (13-8-2024).** FIPS 203 (ML-KEM, abans CRYSTALS-Kyber, per a l'establiment de claus), FIPS 204 (ML-DSA, abans CRYSTALS-Dilithium, per a signatures) i FIPS 205 (SLH-DSA, abans SPHINCS+, signatures basades en funcions hash). El NIST demana als administradors de sistemes que comencin la transició «al més aviat possible».
- Cita: «based on the CRYSTALS-Kyber algorithm, which has been renamed ML-KEM»
- Font: NIST, «NIST Releases First 3 Finalized Post-Quantum Encryption Standards», 13-8-2024. https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards ; DOI dels estàndards: 10.6028/NIST.FIPS.203, .204 i .205 (data de publicació 13-8-2024 a Crossref).
- Verificació: comprovat el 2026-11-20.

---

## 8. Límits de l'E2EE

**8.1 «We kill people based on metadata».** Michael Hayden, exdirector de la NSA i de la CIA, en un debat amb David Cole a la Universitat Johns Hopkins l'abril de 2014.
- Cita: «We kill people based on metadata.»
- Font: David Cole, «Michael Hayden: “We Kill People Based on Metadata”», *Just Security*, 10-5-2014. https://www.justsecurity.org/10311/michael-hayden-kill-people-based-metadata/ (inclou el vídeo del moment). El *JHU News-Letter* (3-4-2014) en confirma el lloc (Shriver Hall) i els participants: https://www.jhunewsletter.com/article/2014/04/experts-discuss-issues-of-privacy-and-security-34660
- Verificació: Just Security comprovat el 2026-11-20. La data exacta del debat (1-4-2014, segons el «dimarts» del News-Letter) **no està verificada**; escriu «abril de 2014». Segons RT (font secundària, no verificada), tot seguit Hayden va matisar: «but that's not what we do with this metadata». Si es cita la frase, s'ha d'esmentar el matís.

**8.2 Les metadades revelen la vida privada (Stanford, 2016).** 823 voluntaris van cedir les metadades del telèfon: 251.788 trucades i 1.234.231 SMS. Els investigadors van poder fer inferències sensibles, confirmades amb fonts públiques: per exemple, que un participant tenia arrítmia cardíaca i que un altre tenia un rifle AR.
- Cita: «823 participants volunteered their metadata, which included 251,788 calls and 1,234,231 text messages»
- Referència: J. Mayer, P. Mutchler i J. C. Mitchell, «Evaluating the privacy properties of telephone metadata», *PNAS*, vol. 113, núm. 20, pp. 5536–5541, 16-5-2016. DOI: 10.1073/pnas.1508081113 ; text complet a PMC4878528: https://pmc.ncbi.nlm.nih.gov/articles/PMC4878528
- Verificació: text de PMC comprovat el 2026-11-20 (pnas.org retornava 403).

**8.3 El dispositiu és el punt feble: Pegasus.** L'informe forense d'Amnistia documenta infeccions de l'spyware Pegasus (NSO Group), entre elles atacs «zero-click» que no requereixen cap acció de la víctima. Si el mòbil està infectat, el xifrat no protegeix res, perquè l'atacant llegeix el missatge ja desxifrat.
- Cita: «so-called "zero-click" attacks which do not require any interaction from the target»
- Font: Amnesty International Security Lab, «Forensic Methodology Report: How to catch NSO Group's Pegasus», 18-7-2021. https://www.amnesty.org/en/latest/research/2021/07/forensic-methodology-report-how-to-catch-nso-groups-pegasus/
- Verificació: comprovat el 2026-11-20. L'afirmació que «llegeix el missatge ja desxifrat» és una explicació meva, no una cita de l'informe. Si cal una cita literal, la de Citizen Lab no l'he obert.

**8.4 Còpies de seguretat al núvol: Advanced Data Protection (7-12-2022).** Apple anuncia l'Advanced Data Protection per a iCloud: amb l'opció activada, 23 categories de dades passen a tenir xifrat d'extrem a extrem (abans, les còpies de seguretat d'iCloud no en tenien per defecte). Disponible als EUA a finals de 2022 i a la resta del món a principis de 2023.
- Cita: «the total number of data categories protected using end-to-end encryption rises to 23»
- Font: Apple Newsroom, «Apple advances user security with powerful new data protections», 7-12-2022. https://www.apple.com/newsroom/2022/12/apple-advances-user-security-with-powerful-new-data-protections/
- Verificació: comprovat el 2026-11-20.

**8.5 Retirada al Regne Unit (21-2-2025).** Apple deixa d'oferir l'ADP als nous usuaris britànics després d'una ordre del Home Office (Investigatory Powers Act 2016) que demanava accés a les dades xifrades.
- Cites (Apple, via Reuters): «We are gravely disappointed that the protections provided by ADP will not be available»; pàgina d'Apple: «Users in the UK who have not already enabled Advanced Data Protection will no longer have the option»
- Fonts: Aditya Soni i Stephen Nellis, Reuters, 21-2-2025 (reproduït a Yahoo News: https://www.yahoo.com/news/apple-removing-end-end-cloud-151653648.html). Apple Support, «Apple can no longer offer Advanced Data Protection in the United Kingdom to new users», https://support.apple.com/en-us/122234 (data mostrada: 22-9-2025, probablement una actualització). EFF, T. Klosowski i A. Crocker, 21-2-2025: https://www.eff.org/deeplinks/2025/02/cornered-uks-demand-encryption-backdoor-apple-turns-its-strongest-security-setting
- Verificació: comprovat el 2026-11-20. Reuters.com no és accessible des de l'eina; s'ha llegit la sindicació a Yahoo, que la identifica com a «(Reuters)».

**8.6 Continuació del cas.** El 18-8-2025, la directora d'Intel·ligència Nacional dels EUA, Tulsi Gabbard, va anunciar que el Regne Unit retirava la demanda.
- Cita (AP): «Britain abandoned its demand that Apple provide so-called backdoor access»
- Font: Kelvin Chan, Associated Press, 19-8-2025 (a Yahoo: https://www.yahoo.com/news/articles/gabbard-says-uk-scraps-demand-103711923.html).
- Verificació: comprovat el 2026-11-20. **No verificat:** l'existència d'una nova ordre només per a usuaris britànics (octubre de 2025, segons el *Financial Times* citat per tercers) i si l'ADP ja torna a estar disponible al Regne Unit (la pàgina d'Apple continuava dient que no). Cal revisar-ho abans de publicar.

**8.7 Captures de pantalla i errors humans: «Signalgate» (24-3-2025).** Jeffrey Goldberg, director de *The Atlantic*, va ser afegit per error a un xat de grup de Signal on alts càrrecs del govern Trump parlaven de l'atac contra els hutis al Iemen. Va publicar-ne captures. El portaveu del Consell de Seguretat Nacional va confirmar que el xat semblava autèntic. Lliçó: l'E2EE protegeix el canal, no protegeix de convidar la persona equivocada.
- Cita (NSC, Brian Hughes): «This appears to be an authentic message chain»
- Fonts: PBS NewsHour, entrevista a Goldberg, 24-3-2025, https://www.pbs.org/newshour/amp/show/top-trump-officials-accidentally-texted-u-s-war-plans-to-journalist-jeffrey-goldberg ; Chris Benson, UPI, 24-3-2025 (a Yahoo: https://www.yahoo.com/news/journalist-accidentally-put-dod-group-210210318.html). Article original: https://www.theatlantic.com/politics/archive/2025/03/trump-administration-accidentally-texted-me-its-war-plans/682151/
- Verificació: PBS i UPI comprovats el 2026-11-20. **The Atlantic bloqueja l'accés automàtic: no he pogut obrir l'article original** ni comprovar-ne el títol exacte («The Trump Administration Accidentally Texted Me Its War Plans», deduït de l'URL) ni el nom del grup («Houthi PC small group», segons fonts secundàries). AP i Reuters no són accessibles des de l'eina.

**8.8 Salt Typhoon i la recomanació de la CISA (18-12-2024).** Després de l'espionatge de la Xina a operadores de telecomunicacions, la CISA va publicar una guia per a persones «molt exposades» (alts càrrecs polítics i de govern). La primera recomanació: fer servir només comunicacions xifrades d'extrem a extrem, amb aplicacions com Signal.
- Cites: «Only use end-to-end encrypted communications.» / «such as Signal or similar apps»
- Font: CISA, *Mobile Communications Best Practice Guidance*, v1.0, 18-12-2024; v2.0, 24-11-2025 (amplia el públic als militars i afegeix consells contra el robatori de comptes de Signal i WhatsApp). Pàgina: https://www.cisa.gov/resources-tools/resources/mobile-communications-best-practice-guidance ; PDF: https://www.cisa.gov/sites/default/files/2025-12/guidance-mobile-communications-best-practices_508c.pdf
- Verificació: PDF (v2.0, amb l'historial de versions) llegit el 2026-11-20. **Matís:** la guia no diu «Salt Typhoon», sinó «PRC-affiliated» actors. El nom «Salt Typhoon» apareix a l'avís conjunt AA25-239A de la CISA, la NSA, l'FBI i socis internacionals (27-8-2025), que diu que l'activitat coincideix amb el que la indústria anomena «Salt Typhoon»: https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a (comprovat el 2026-11-20). La v2.0 també avisa que les aplicacions recullen metadades.

---

## 9. Política: les «guerres criptogràfiques»

**9.1 Clipper Chip (16-4-1993).** La Casa Blanca anuncia un xip de xifrat, fet per enginyers del govern, amb claus en dipòsit (*key escrow*) accessibles a les forces de seguretat.
- Cita: «A state-of-the-art microcircuit called the "Clipper Chip" has been developed by government engineers.»
- Font: The White House, Office of the Press Secretary, «Statement by the Press Secretary», 16-4-1993 (arxiu de la Casa Blanca de Clinton). https://clintonwhitehouse6.archives.gov/1993/04/1993-04-16-press-release-on-clipper-chip-encryption-initiative.html
- Verificació: comprovat el 2026-11-20. La cita fa 15 paraules justes; si cal escurçar-la, es pot parafrasejar.

**9.2 Phil Zimmermann i PGP.** PGP es publica gratuïtament a internet el 1991. Zimmermann va ser objecte d'una investigació penal de tres anys, que el govern va arxivar a principis de 1996.
- Cites: «PGP was published for free on the Internet in 1991.» / «the target of a three-year criminal investigation»
- Font: Phil Zimmermann, «Background», web personal. https://philzimmermann.com/EN/background/background.html
- Verificació: comprovat el 2026-11-20. És la font del protagonista. Per al 1993–1996 no he obert cap document governamental (el tancament el va anunciar la fiscalia federal del districte nord de Califòrnia el gener de 1996; **no verificat** en font primària).

**9.3 Apple contra l'FBI (San Bernardino, 2016).** El 16-2-2016, Apple publica una carta oberta: l'FBI li demana una versió nova d'iOS per desbloquejar l'iPhone d'un dels autors de l'atemptat de San Bernardino, i Apple la qualifica de porta del darrere.
- Cita: «build a backdoor to the iPhone»
- Font: Tim Cook / Apple, «A Message to Our Customers», 16-2-2016. https://www.apple.com/customer-letter/
- Verificació: comprovat el 2026-11-20.
- Desenllaç: el 28-3-2016, el Departament de Justícia es retira del cas perquè l'FBI ha entrat al telèfon amb una tècnica d'un tercer, sense l'ajuda d'Apple.
- Cita (AP): «The FBI says it successfully used a mysterious technique without Apple's help»
- Font: Tami Abdollah, Associated Press, 28-3-2016 (a PBS: https://www.pbs.org/newshour/nation/justice-department-cracks-iphone-withdraws-legal-action-against-apple). Comprovat el 2026-11-20.

**9.4 «Keys Under Doormats» (2015).** Quinze experts (entre ells Diffie, Rivest, Schneier, Anderson i Landau) argumenten que obligar a donar accés excepcional al govern introdueix inseguretat per a tothom.
- Cita: «any proposals that alter the security dynamics online should be approached with caution»
- Referència: H. Abelson, R. Anderson, S. M. Bellovin, J. Benaloh, M. Blaze, W. Diffie, J. Gilmore, M. Green, S. Landau, P. G. Neumann, R. L. Rivest, J. I. Schiller, B. Schneier, M. A. Specter i D. J. Weitzner, «Keys under doormats: mandating insecurity by requiring government access to all data and communications», *Journal of Cybersecurity*, vol. 1, núm. 1, pp. 69–79, 2015 (en línia el 17-11-2015). DOI: 10.1093/cybsec/tyv009 ; https://academic.oup.com/cybersecurity/article/1/1/69/2367066
- Verificació: comprovat el 2026-11-20.

**9.5 Reglament europeu sobre abús sexual infantil («Chat Control»): proposta.** La Comissió el va presentar l'11-5-2022 (expedient 2022/0155 (COD); document de la Comissió COM(2022) 209). Obligava els proveïdors a detectar, denunciar i retirar material d'abús, i incloïa ordres de detecció que podien afectar serveis amb E2EE.
- Font: Consell de la UE, nota de la Presidència 10499/26, 22-6-2026, §1. https://data.consilium.europa.eu/doc/document/ST-10499-2026-INIT/en/pdf
- Verificació: llegit el 2026-11-20. El número COM(2022) 209 **no l'he pogut confirmar** a EUR-Lex (la pàgina no carregava). El Consell el cita com a document 9068/22.

**9.6 Posició del Consell (26-11-2025): sense detecció obligatòria.** El Coreper va aprovar el mandat del Consell. Excloïa les ordres de detecció obligatòries i feia permanent el règim de detecció voluntària.
- Cita (eucrim): «deliberately excluding mandatory detection orders»
- Fonts: eucrim, «CSA Regulation: Council Position Reached», https://eucrim.eu/news/csa-regulation-council-position-reached/ ; nota del Consell 10499/26, §7 («partial mandate … on 26 November 2025»).
- Verificació: comprovat el 2026-11-20. El comunicat de premsa del Consell (consilium.europa.eu) bloqueja l'accés automàtic i no l'he pogut obrir.

**9.7 Estat actual (finals de 2026).**
- Els trílegs van començar el 9-12-2025. El text provisional pactat diu que el reglament no pot afeblir el xifrat ni obligar a desxifrar o a donar accés a les dades amb E2EE.
- Cita (Consell 10499/26): «create any obligations for providers to decrypt data or create access to end-to-end encrypted data»
- El reglament provisional que permetia l'escaneig voluntari (Reglament (UE) 2021/1232) **va expirar el 3-4-2026**, després que el Parlament Europeu rebutgés la pròrroga el 26-3-2026 (nota 10499/26, §21).
- Sisè tríleg (29-9-2026): hi ha acord de principi sobre les ordres de detecció en contingut públic, però no sobre el contingut no públic (missatges privats), que continua obert. Està previst un nou tríleg abans de final d'any.
- Cita (WK 15082/2026): «did not bring a breakthrough on own-initiative searches and detection in non-public content»
- Fonts: nota de la Presidència 10499/26 (22-6-2026); nota 11501/26 (7-7-2026, resultat del tríleg del 29-6-2026), https://data.consilium.europa.eu/doc/document/ST-11501-2026-INIT/en/pdf ; document de treball WK 15082/2026 (30-9-2026), https://data.consilium.europa.eu/doc/document/WK-15082-2026-INIT/en/pdf
- Verificació: els tres PDF llegits el 2026-11-20. Són documents marcats «LIMITE» però publicats al registre del Consell. **Cal tornar a comprovar l'estat just abans de publicar**: hi ha trílegs en curs, i no he pogut obrir les pàgines de premsa del Consell (inclosa una del 2-7-2026 sobre restablir la mesura provisional).

**9.8 Carta dels científics.** El 2025, 807 científics i investigadors de 37 països van signar la carta oberta contra el reglament (signatures tancades el 12-10-2025). El 8-10-2025 els estats membres no van arribar a un acord i es va anul·lar la votació prevista. El 17-11-2025, una nova carta celebrava que s'hagués eliminat la detecció obligatòria al dispositiu, però alertava dels falsos positius de l'escaneig voluntari.
- Cita (Nov2025): «eliminated the mandatory nature of on-device CSAM detection»
- Fonts: https://csa-scientist-open-letter.org/Sep2025 (PDF) i https://csa-scientist-open-letter.org/Nov2025 (PDF). La primera carta, del 4-7-2023, tenia més de 300 signants (EDRi: https://edri.org/?p=49357, només llegit en el resum del cercador; **no verificat**).
- Verificació: els dos PDF descarregats i llegits el 2026-11-20.

**9.9 Online Safety Act 2023 (Regne Unit).** Sanció reial el 26-10-2023. La secció 121 permet a l'Ofcom exigir a un servei que faci servir «tecnologia acreditada» per identificar material d'abús sexual infantil, també en comunicacions privades. És la clàusula que va fer amenaçar Signal i WhatsApp amb marxar del país.
- Cita (s. 121(2)(a)(iii)): «whether communicated publicly or privately by means of the service»
- Font: legislation.gov.uk, Online Safety Act 2023 c. 50, s. 121. https://www.legislation.gov.uk/ukpga/2023/50/section/121 ; data de sanció: https://www.legislation.gov.uk/ukpga/2023/50/introduction/enacted
- Verificació: comprovat el 2026-11-20. La secció 121 va entrar en vigor el 10-1-2024. **No verificat:** les amenaces de Signal i WhatsApp de marxar (no n'he obert cap font).

---

## 10. Història antiga (per a la línia del temps)

**10.1 L'escítala espartana.** Plutarc descriu com els èfors d'Esparta enrotllaven una tira de pergamí al voltant d'una vara («scytale») per escriure-hi el missatge; només una vara igual el feia llegible.
- Cita: «wind it round their "scytale,"»
- Font: Plutarc, *Vida de Lisandre*, 19.5–6, ed. Loeb Classical Library, *Lives*, vol. IV (1916), a LacusCurtius: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Lysander*.html
- Verificació: comprovat el 2026-11-20. El traductor de l'edició Loeb (Bernadotte Perrin) no surt a la pàgina; ve de memòria.

**10.2 La xifra de Cèsar.** Suetoni: Cèsar escrivia en xifra canviant l'ordre de les lletres de manera que no s'entenia cap paraula. Per desxifrar-ho, la D es llegia com a A (desplaçament de 3).
- Cita: «by so changing the order of the letters of the alphabet, that not a word could be made out»
- Font: Suetoni, *Vida del diví Juli*, 56.6, ed. Loeb (1913), a LacusCurtius: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Julius*.html
- Verificació: comprovat el 2026-11-20. El traductor (J. C. Rolfe) no surt a la pàgina.

**10.3 Al-Kindi i l'anàlisi de freqüències (segle IX).** Al-Kindi (c. 801–873) explica el mètode al *Manuscrit sobre el desxiframent de missatges criptogràfics*: comptar les lletres d'un text llarg en la mateixa llengua i aparellar-les per ordre de freqüència amb els símbols del missatge xifrat. Va basar els recomptes en 7 pàgines, 3.667 lletres en total.
- Cita: «Al Kindī had based his counts on 7 pages totaling 3667 letters»
- Font: Bernard Ycart, «Letter counting: a stem cell for Cryptology, Quantitative Linguistics, and Statistics», *Historiographia Linguistica* 40(3):303–329, 2013; preprint: https://arxiv.org/abs/1211.6847. Cita l'edició crítica de Mrayati, Meer Alam i at-Tayyan (2002).
- Referència complementària: I. A. Al-Kadi, «Origins of Cryptology: The Arab Contributions», *Cryptologia* 16(2):97–126, 1992. DOI: 10.1080/0161-119291866801 (només metadades; Taylor & Francis va retornar 403).
- Verificació: PDF de l'arXiv llegit el 2026-11-20. **No verificat:** el redescobriment del manuscrit el 1987 a l'arxiu Süleymaniye d'Istanbul (només ho diu Simon Singh, divulgador).

**10.4 La xifra de Vigenère (1586).** Blaise de Vigenère publica el *Traicté des chiffres, ou Secretes manieres d'escrire* (París, Abel l'Angelier, 1586).
- Font: catàleg de la Universitat de Lieja (DONum): https://donum.uliege.be/handle/2268.1/9711 (permalink https://hdl.handle.net/2268.1/9711).
- Verificació: comprovat el 2026-11-20. **Atenció:** la xifra polialfabètica amb paraula clau que avui en diem «de Vigenère» l'havia publicada abans Giovan Battista Bellaso (1553); ho diuen els resultats del cercador, però **no ho he verificat** en font primària. Al text convé posar «atribuïda a Vigenère».

**10.5 Maria Estuard i la conspiració de Babington (1586).** El 17-7-1586, Maria, presonera a Chartley, escriu en xifra a Anthony Babington i dona el vistiplau al complot contra Elisabet I. Els espies de Walsingham intercepten la carta i el criptògraf Thomas Phelippes la desxifra; hi dibuixa una forca a la solapa de l'adreça. La còpia de l'època es conserva als National Archives com a SP 53/18/53.
- Cita: «Upon deciphering it, Phelippes drew a gallows on the address leaf»
- Font: Alan Bryson, «The Gallows Letter», British Library (blog), 5-2-2022. https://www.bl.uk/stories/blogs/posts/the-gallows-letter
- Verificació: comprovat el 2026-11-20. L'execució de Maria (8-2-1587) **no surt en aquest article**. És un fet molt conegut, però no l'he verificat en font primària en aquesta recerca. Les pàgines dels National Archives van retornar 403.

**10.6 Les cartes perdudes de Maria Estuard, desxifrades (2023).** George Lasry, Norbert Biermann i Satoshi Tomokiyo desxifren unes 57 cartes xifrades de Maria (1578–1584), adreçades sobretot a l'ambaixador francès Michel de Castelnau. Estaven mal catalogades a la Bibliothèque nationale de France.
- Referència: G. Lasry, N. Biermann i S. Tomokiyo, «Deciphering Mary Stuart’s lost letters from 1578-1584», *Cryptologia*, vol. 47, núm. 2, pp. 101–202, 2023 (en línia el 8-2-2023). DOI: 10.1080/01611194.2022.2160677
- Verificació: DOI comprovat (metadades) el 2026-11-20. Taylor & Francis va retornar 403 i no he pogut llegir l'abstract. **El nombre de cartes (55 o 57) no està verificat en la font primària**: la premsa dona totes dues xifres.

**10.7 El «one-time pad»: Vernam (1918–1919).** Gilbert S. Vernam patenta el «Secret signaling system»: xifra cada caràcter del teletip combinant-lo amb una cinta de clau.
- Referència: G. S. Vernam, patent dels EUA US 1,310,719, «Secret signaling system», sol·licitada el 13-9-1918 i concedida el 22-7-1919. https://patents.google.com/patent/US1310719A/en
- Verificació: comprovat el 2026-11-20.

**10.8 Shannon (1949): el secret perfecte existeix, però té un preu.** Shannon demostra que el secret perfecte és possible, però requereix tantes claus possibles com missatges possibles; és a dir, una clau tan llarga com el missatge. El sistema de Vernam (amb clau aleatòria i que no es repeteix) l'aconsegueix.
- Cita: «perfect secrecy is possible but requires, if the number of messages is finite, the same number of possible keys»
- Cita: «This type of perfect secrecy is realized by the Vernam system.»
- Referència: C. E. Shannon, «Communication Theory of Secrecy Systems», *Bell System Technical Journal*, vol. 28, núm. 4, pp. 656–715, octubre de 1949. DOI: 10.1002/j.1538-7305.1949.tb00928.x ; còpia llegida: https://pages.cs.wisc.edu/~rist/642-spring-2014/shannon-secrecy.pdf
- Verificació: DOI i text comprovats el 2026-11-20. La primera cita fa 16 paraules; cal escurçar-la.

**10.9 Enigma i Bletchley Park.** Bletchley Park va començar el 1939 amb unes 150 persones. El 1945, el 75 % del personal eren dones (sis de cada deu, d'uniforme). La plantilla va arribar a gairebé 9.000 persones el 1945 (dada del resum del cercador, no llegida directament). La Bombe de Turing ja ajudava a desxifrar missatges a la tardor de 1940.
- Cites: «started in 1939 with only around 150 staff» / «By 1945, 75% of the staff of Bletchley Park were women»
- Font: Bletchley Park Trust, «Who were the Codebreakers?». https://www.bletchleypark.org.uk/our-story/who-were-the-codebreakers/
- Verificació: les dues cites, comprovades el 2026-11-20. **No verificat directament:** la xifra de «gairebé 9.000» i la data de la Bombe, que són del resum del cercador sobre pàgines del mateix bletchleypark.org.uk. Abans de publicar-les, cal obrir https://www.bletchleypark.org.uk/our-story/6-facts-about-the-bombe/

---

## Pendents i advertiments per a l'editor

1. **No escriure «més claus que àtoms a l'univers».** 2^256 ≈ 1,2 × 10^77 és ~600–900 vegades menys que ~10^80 àtoms. Opcions: «un nombre de 78 xifres», «una mil·lèsima part dels àtoms de l'univers observable» o el temps de força bruta (6.4).
2. «Signalgate»: l'article original de The Atlantic no s'ha pogut obrir.
3. CISA: la guia de desembre de 2024 no anomena «Salt Typhoon». El nom surt a l'avís AA25-239A (agost de 2025).
4. «Chat Control»: el procés està obert (trílegs). Cal tornar a comprovar-ho just abans de publicar.
5. ADP al Regne Unit: no està verificat si ja s'ha restablert.
6. No verificats en font primària: data exacta del debat de Hayden, tancament del cas Zimmermann (gener de 1996), redescobriment d'al-Kindi el 1987, prioritat de Bellaso, nombre exacte de cartes de Maria Estuard (2023), «gairebé 9.000» persones a Bletchley i execució de Maria (8-2-1587).
