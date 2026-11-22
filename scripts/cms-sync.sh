#!/bin/sh
# Sincronia amb el CMS de l'editor (/admin/), que fa commits directament a main a GitHub.
# El criden els hooks de Claude Code (.claude/settings.json):
#   scripts/cms-sync.sh inici   → en obrir una sessió: baixa main i ensenya què ha canviat l'editor i els comentaris pendents
#   scripts/cms-sync.sh prompt  → a cada missatge: si main ha avançat, ho diu (i ho baixa si la còpia local és neta)
# Mai no fa merge a la força ni toca canvis locals sense desar.
cd "$(dirname "$0")/.." || exit 0
MODE="${1:-inici}"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
[ "$BRANCH" = "main" ] || exit 0
git fetch -q origin main 2>/dev/null || exit 0

BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
if [ "$BEHIND" -gt 0 ]; then
  CMS=$(git log --format='%an' HEAD..origin/main | grep -c 'CMS')
  LOG=$(git log --format='  - %h %an: %s' HEAD..origin/main | head -12)
  if [ -z "$(git status --porcelain --untracked-files=no)" ]; then
    if git merge -q --ff-only origin/main 2>/dev/null; then
      echo "Sincronia: he baixat $BEHIND commits nous de main ($CMS de l'editor des del CMS). Treballa sobre aquesta versió:"
      echo "$LOG"
    else
      echo "ATENCIÓ: main té $BEHIND commits nous (CMS de l'editor) i no s'han pogut baixar sols. Fes git pull --rebase origin main abans de tocar res."
      echo "$LOG"
    fi
  else
    echo "ATENCIÓ: main té $BEHIND commits nous que no tens ($CMS de l'editor des del CMS) i tens canvis locals sense desar."
    echo "Abans de continuar editant: git stash && git pull --rebase origin main && git stash pop. En un conflicte de text, mana la redacció del CMS (l'editor)."
    echo "$LOG"
  fi
fi

if [ "$MODE" = "inici" ] && [ -f cms/comentaris.json ]; then
  N=$(node -e 'try{console.log(require("./cms/comentaris.json").comentaris.length)}catch(e){console.log(0)}' 2>/dev/null)
  if [ "${N:-0}" -gt 0 ]; then
    echo "L'editor té $N comentaris pendents al CMS per a l'agent (node scripts/comentaris.mjs per veure'ls). No els resolguis si no t'ho demana."
  fi
fi
exit 0
