"""PISA 2022 (OCDE): fitxer d'alumnes -> reixa de densitat (ESCS x matemàtiques) i bretxa per quarts.
Ús: python -I pisa_proc.py <fitxer.sas7bdat> <sortida.json>"""
import sys, json, math
import pandas as pd
import numpy as np

src, out = sys.argv[1], sys.argv[2]
PV = [f"PV{i}MATH" for i in range(1, 11)]
COLS = ["CNT", "OECD", "REGION", "ESCS", "W_FSTUWT"] + PV
import pyreadstat
df, _ = pyreadstat.read_sas7bdat(src, usecols=COLS)
print("total", len(df), file=sys.stderr)
df = df[df["ESCS"].notna()]
df["MATH"] = df[PV].mean(axis=1)

def wq(x, w, qs):
    o = np.argsort(x); x = x[o]; w = w[o]; c = np.cumsum(w) / w.sum()
    return [x[np.searchsorted(c, q)] for q in qs]

def gaps(d):
    x = d["ESCS"].values; w = d["W_FSTUWT"].values
    q1, q2, q3 = wq(x, w, [.25, .5, .75])
    res = []
    for lo, hi in [(-99, q1), (q1, q2), (q2, q3), (q3, 99)]:
        m = (x > lo) & (x <= hi) if lo > -99 else (x <= hi)
        # mitjana de les 10 PV ponderada
        res.append(float(np.average(d.loc[m, PV].values.mean(axis=1), weights=w[m])))
    return {"q": [float(q1), float(q2), float(q3)], "mean": res, "all": float(np.average(d["MATH"], weights=w))}

oecd = df[df["OECD"] == 1]
per = {c: gaps(g) for c, g in oecd.groupby("CNT")}
avg = [float(np.mean([p["mean"][k] for p in per.values()])) for k in range(4)]
print("OECD countries", len(per), "avg quartile means", avg, "gap", avg[3] - avg[0], file=sys.stderr)

XB = (-4.5, 3.5, 100)   # ESCS
YB = (100, 900, 100)    # punts
def grid(d):
    H, _, _ = np.histogram2d(d["ESCS"].values, d["PV1MATH"].values, bins=[XB[2], YB[2]], range=[XB[:2], YB[:2]])
    return [int(v) for v in H.T.flatten()]  # files = punts (de baix a dalt), columnes = ESCS

R = {"xb": XB, "yb": YB, "views": {}}
R["views"]["oecd"] = {"n": int(len(oecd)), "countries": len(per), "grid": grid(oecd), "qmean": avg,
                      "q": [float(np.mean([p["q"][k] for p in per.values()])) for k in range(3)],
                      "mean": float(np.mean([p["all"] for p in per.values()]))}
esp = df[df["CNT"] == "ESP"]
if len(esp):
    ge = gaps(esp)
    R["views"]["esp"] = {"n": int(len(esp)), "grid": grid(esp), "qmean": ge["mean"], "q": ge["q"], "mean": ge["all"]}
    cat = esp[esp["REGION"] == 72409]   # Catalunya (codis de regió en ordre alfabètic; mitjana 469, la publicada)
    gc = gaps(cat)
    R["views"]["cat"] = {"n": int(len(cat)), "grid": grid(cat), "qmean": gc["mean"], "q": gc["q"], "mean": gc["all"]}
    print("CAT", gc, file=sys.stderr)
    if "REGION" in esp.columns:
        print("ESP regions", esp["REGION"].value_counts().head(25).to_dict(), file=sys.stderr)
json.dump(R, open(out, "w"))
print("ok", file=sys.stderr)
