---
description: Explora un bug a partir de un síntoma, traza el flujo en el código y enumera hipótesis ordenadas por probabilidad. NO escribe código.
---

# /explore-bug

Síntoma: $ARGUMENTS

Pasos a seguir **sin modificar archivos**:

1. **Reproduce mentalmente el síntoma.** Expresa en una frase qué observa el usuario y qué esperaría ver.
2. **Localiza los archivos involucrados.** Usa `Grep` sobre palabras clave del síntoma (nombres de componentes, endpoints, hooks, mensajes de error).
3. **Traza el flujo.** Desde el punto de entrada (acción del usuario, render, mutation) hasta donde se produce la divergencia. Usa `Read` para leer archivos completos, no solo fragmentos.
4. **Enumera hipótesis** ordenadas por probabilidad. Cada hipótesis debe incluir:
   - un `archivo:línea` concreto
   - una explicación en una frase de por qué podría ser la causa
   - cómo la descartarías o confirmarías
5. **Para y pregunta al usuario** antes de tocar código. Propón la hipótesis más probable y ofrece pasar al plan de fix con `/plan-fix`.

## Restricciones

- NO uses Edit, Write ni Bash-que-modifique.
- NO propongas código todavía.
- SÍ puedes correr tests existentes si ayudan a reproducir.
