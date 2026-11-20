#!/usr/bin/env python3
"""Genera web/articles/xifrat-extrem-a-extrem/index.html a partir de index.src.html i fonts.json.

El cos de l'article són els fitxers body-*.html (en aquest ordre). Al text font, cada cita s'escriu [[clau.n]] o [[clau.n,clau2.m]]: «clau» és una font de fonts.json
i «n» (1, 2…) l'afirmació d'aquella font que hi recolza. El guió numera les fonts per ordre
d'aparició, crea els <sup class="nr"> d'un sol clic i escriu la llista «Fonts» amb «Hi recolza:».
Ús: python3 research/xifrat-extrem-a-extrem/build-cites.py
"""
import json, re, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SRC = HERE / "index.src.html"
OUT = ROOT / "web/articles/xifrat-extrem-a-extrem/index.html"
fonts = json.loads((HERE / "fonts.json").read_text(encoding="utf-8"))

html = SRC.read_text(encoding="utf-8")
body = "\n".join((HERE / f).read_text(encoding="utf-8") for f in ["body-obertura.html", "body-tecnic.html", "body-reflexio.html", "body-final.html"])
html = html.replace("<!--BODY-->", body)
DESC = "Cada missatge de WhatsApp o Signal viatja tancat amb una clau que no té ni l'empresa que el porta. Com funciona el xifrat d'extrem a extrem, fins on és segur i què diu de nosaltres saber callar."
html = html.replace("DESC", DESC.replace("'", "&#39;"))
order, num, first = [], {}, {}
cid = [0]
used = {}

def sup(m):
    out = []
    for tok in m.group(1).split(","):
        tok = tok.strip()
        key, _, n = tok.partition(".")
        n = n or "1"
        if key not in fonts:
            sys.exit(f"Font desconeguda: {key}")
        if int(n) > len(fonts[key]["claims"]):
            sys.exit(f"{key} no té l'afirmació {n}")
        if key not in num:
            order.append(key); num[key] = len(order)
        cid[0] += 1
        c = f"c{cid[0]}"
        first.setdefault(key, c)
        used.setdefault(key, set()).add(int(n))
        N = num[key]
        out.append(f'<a href="#font-{N}" id="{c}" data-c="u{N}-{n}">{N}</a>')
    return '<sup class="nr">' + ",".join(out) + "</sup>"

html = re.sub(r"\[\[([^\]]+)\]\]", sup, html)

items = []
for key in order:
    f = fonts[key]; N = num[key]
    us = "; ".join(f'<span id="u{N}-{i+1}">{cl}</span>' for i, cl in enumerate(f["claims"]) if (i + 1) in used[key])
    items.append(f'    <li id="font-{N}"><a class="bk" href="#{first[key]}" aria-label="Torna al text">↑</a> {f["ref"]}<span class="us">Hi recolza: {us}.</span></li>')

html = html.replace("<!--FONTS-->", "\n".join(items))
unused = [k for k in fonts if k not in num]
OUT.write_text(html, encoding="utf-8")
print(f"{len(order)} fonts citades, {cid[0]} cites. Sense citar: {', '.join(unused) or 'cap'}")
