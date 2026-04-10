---
description: Invoca al subagent code-reviewer sobre el diff actual (HEAD o staged) y devuelve su reporte.
---

# /review-pr

Invoca al subagente `code-reviewer` para que revise el diff actual contra las convenciones de `CLAUDE.md`.

Argumentos opcionales: $ARGUMENTS (rango de git, por ejemplo `main..HEAD`).

Si no se pasa rango, el revisor usará `git diff --staged` si hay cambios staged, o `git diff HEAD` en caso contrario.

Devuelve el reporte del revisor tal cual, sin añadirle opiniones propias.
