---
name: commit-conventional
description: Use cuando el usuario quiera generar un mensaje de commit en formato Conventional Commits a partir de los cambios actuales (staged o working tree).
---

# commit-conventional

Genera un mensaje de commit en [Conventional Commits](https://www.conventionalcommits.org/) a partir del diff actual.

## Instrucciones

1. Ejecuta `git diff --staged`. Si está vacío, usa `git diff` y advierte al usuario que nada está staged.
2. Clasifica el cambio:
   - `feat`: añade capacidad nueva al usuario
   - `fix`: corrige un bug de comportamiento
   - `refactor`: cambia estructura sin alterar comportamiento
   - `test`: añade/ajusta tests
   - `docs`: solo documentación
   - `chore`: tooling, deps, configs
3. Infere el _scope_ mirando las rutas tocadas:
   - `src/hooks/**` → `hooks`
   - `src/features/weekly/**` → `weekly`
   - `src/features/daily/**` → `daily`
   - `src/features/editor/**` → `editor`
   - `src/mocks/**` → `mocks`
   - `src/api/**` → `api`
   - `src/utils/**` → `utils`
   - Si toca varios scopes, omite el scope.
4. Escribe el _subject_:
   - imperativo, minúscula inicial, < 72 chars, sin punto final.
   - describe el _porqué_ cuando el _qué_ sea obvio del diff.
5. Body opcional: úsalo solo si el cambio no es trivial. Una línea por idea, envuelto a 72 cols.
6. Footer opcional: `BREAKING CHANGE:` si aplica.
7. Devuelve el mensaje al usuario **dentro de un bloque de código** listo para copiar. NO hagas `git commit` tú mismo — solo propones el mensaje.

## Ejemplo de salida

```
fix(utils): compute raw weekly hours without break deduction

El spec pide horas brutas; el off-by-one venía de restar 1h "por
descanso" que no forma parte del cálculo.
```
