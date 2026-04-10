---
description: A partir del diagnóstico de un bug, genera un plan de fix detallado (archivos, cambios, tests, riesgos). NO escribe código.
---

# /plan-fix

A partir del diagnóstico previo (suyo o de `/explore-bug`), produce un plan de fix estructurado. Si no existe diagnóstico en el contexto, pide uno antes de continuar.

## Estructura del plan

1. **Root cause** (1–3 frases). Qué está mal y por qué.
2. **Archivos a tocar.** Lista con un bullet por archivo y qué cambia en cada uno.
3. **Cambios concretos.** Por cada archivo, un pseudo-diff o descripción precisa del cambio (no hace falta código exacto; sí paths y símbolos).
4. **Tests.**
   - Qué tests existentes cubren ya el caso (si alguno).
   - Qué tests nuevos se necesitan y dónde viven (`*.test.ts(x)` colocalizado).
   - Casos borde que conviene cubrir.
5. **Riesgos y rollback.** Qué podría romper el fix. Cómo revertir si falla en producción.
6. **Alternativas descartadas.** Si hay más de una forma de arreglarlo, explica brevemente por qué elegiste la propuesta.

## Restricciones

- NO uses Edit ni Write.
- NO corras el fix — solo lo planeas.
- Termina preguntando al usuario si aprueba el plan antes de pasar a implementarlo.
