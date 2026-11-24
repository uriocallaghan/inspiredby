# Dades pròpies de «El genoma que es va publicar en una nit»

Tot el que l'article anomena «comptatge propi» surt del **conjunt obert de Nextstrain**
(`ncov_open_global_all-time`), que recull els genomes de SARS-CoV-2 dipositats a les bases
públiques d'INSDC (GenBank, ENA, DDBJ). **No inclou els genomes compartits només a GISAID**,
que demana registre; això es diu a l'article i a «Dades i fonts».

Descarregat el **24-11-2026**. Els fitxers d'origen són del 22-11-2026 (el seu `updated`).

## Fitxers d'origen (no es guarden al repositori: 954 MB i 4,5 MB)

```
https://data.nextstrain.org/files/ncov/open/metadata.tsv.zst     # metadades (954 MB comprimit)
https://data.nextstrain.org/ncov_open_global_all-time.json       # arbre filogenètic publicat
https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json
```

## Com es van generar les dades de l'article

```bash
# 1. Recomptes per dia, per país i per mes (filtre: host = Homo sapiens o desconegut)
curl -s https://data.nextstrain.org/files/ncov/open/metadata.tsv.zst | zstd -dc | python3 agg.py   # → agg.json
# 2. Setmanes per continent, retard col·lecta→publicació i els primers dipòsits
curl -s https://data.nextstrain.org/files/ncov/open/metadata.tsv.zst | zstd -dc | python3 agg2.py  # → agg2.json
# 3. Centroides dels països (Natural Earth 1:110 m + taula d'àlies i illes petites)
python3 -I centroids.py                                                                            # → centroids.json
# 4. Fitxer final de l'article
python3 mkdata.py                                                                                  # → web/articles/el-genoma-en-obert/dades.js
```

## Xifres que en surten

| Què | Valor |
|---|---|
| Genomes humans al conjunt obert | 9.445.676 |
| Amb país i data de recollida (mapa) | 9.414.376, en 133 països |
| Setmanes de la sèrie | 358 (06-01-2020 a 16-11-2026) |
| Setmana amb més genomes publicats | 19-06-2023, amb 280.247 |
| Nodes de l'arbre publicat | 5.979, dels quals 3.078 són genomes |
| Mesos de la sèrie de retard | 81 (es descarten els mesos amb menys de 30 genomes) |
| Primer registre del conjunt | MN908947, recollit el 26-12-2019 i publicat el 12-01-2020 |

El retard és la diferència entre `date` (recollida) i `date_submitted` (publicació), només per als
genomes amb data de recollida completa i amb un retard d'entre 0 i 400 dies.

`resum-lag-i-primers.json` guarda les quantitats resultants (mediana, percentil 90 i nombre de
genomes per mes) i els 40 primers dipòsits del conjunt, per poder comprovar-les sense tornar a
baixar els 954 MB.
