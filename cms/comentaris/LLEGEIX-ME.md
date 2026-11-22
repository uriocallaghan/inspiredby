Comentaris de l'editor fets al CMS (/admin/), un fitxer per comentari: <slug o portada>--<id>.json.
L'agent els llegeix amb `node scripts/comentaris.mjs` i, quan n'ha fet un, l'esborra amb
`node scripts/comentaris.mjs resol <id>` al mateix commit que la correcció; així desapareix del CMS.
