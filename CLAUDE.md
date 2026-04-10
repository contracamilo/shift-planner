# CLAUDE.md — Shift Planner

Proyecto de demo: un planificador semanal/diario de turnos. Stack pensado para ejercitar a Claude Code en un entorno realista de frontend.

---

## 1. Stack y comandos

- **Runtime:** Node 20, TypeScript 5.4, React 18.3, Vite 5.
- **Estado:** TanStack Query 5 (server state) + Zustand 4 (UI state).
- **Mocks:** MSW 2 (nodeserver en tests, worker en dev).
- **Tests:** Vitest 1 + @testing-library/react 16 + jsdom.

Comandos:

```bash
npm run dev         # arranca Vite en http://localhost:5173 con MSW
npm test            # corre la test suite una vez (vitest --run)
npm run test:watch  # watch mode
npm run lint        # eslint, falla con warnings
npm run typecheck   # tsc --noEmit
npm run build       # build de producción
```

---

## 2. Arquitectura

```
src/
├── api/         # fetch wrappers, una función por endpoint
├── mocks/       # MSW: handlers, data seed, server/worker setup
├── hooks/       # wrappers de TanStack Query (uno por recurso)
├── stores/      # Zustand stores — SOLO UI state
├── features/    # módulos por pantalla (weekly/, daily/, editor/)
├── utils/       # helpers puros, testeables en aislamiento
├── types.ts     # tipos de dominio compartidos
└── test/setup.ts
```

Regla de oro: **la capa `features/` no llama a `api/` directamente**; siempre pasa por un hook de `hooks/`.

---

## 3. Naming conventions

| Cosa                    | Patrón                     | Ejemplo                    |
| ----------------------- | -------------------------- | -------------------------- |
| Componente React        | `PascalCase.tsx`           | `WeeklyView.tsx`           |
| Hook                    | `useX.ts`                  | `useWeeklySchedule.ts`     |
| Store Zustand           | `xStore.ts`                | `editorStore.ts`           |
| Test colocalizado       | `*.test.ts(x)` junto al fuente | `hours.test.ts`        |
| Handler MSW             | `handlers.ts` único en `src/mocks/` | —                 |

- Exports **nombrados**, no default.
- Orden de imports: externos → paquetes del repo (`../../`) → relativos (`./`) → tipos.

---

## 4. Patrón de stores Zustand

Un store = un dominio de UI. State + actions en un solo `create`. Sin middleware salvo `devtools` en dev.

```ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface FooState {
  count: number;
  inc: () => void;
}

export const useFooStore = create<FooState>()(
  devtools(
    (set) => ({
      count: 0,
      inc: () => set((s) => ({ count: s.count + 1 })),
    }),
    { name: 'foo-store' },
  ),
);
```

Los stores **no** contienen server state: nada de fetch, nada de queries ahí.

---

## 5. Estrategia de TanStack Query

### Jerarquía de query keys

```
['schedule', scope, id]   donde scope ∈ {'week', 'day'}
```

Ejemplos en uso:
- `['schedule', 'week', weekId]` — usado por `useWeeklySchedule`
- `['schedule', 'day', date]` — usado por `useDailySchedule`

Son **hermanas**, no prefijo/sufijo. Invalidar una no invalida la otra.

### Reglas de invalidación

Al mutar un shift (`useUpdateShift`, `useCreateShift`, `useDeleteShift`):

> **Invalida ambas vistas relacionadas**: la diaria correspondiente **y** la semanal que la contiene. Nunca olvides las vistas hermanas.

Dos formas válidas:

```ts
// A) Explícito
qc.invalidateQueries({ queryKey: ['schedule', 'day', variables.date] });
qc.invalidateQueries({ queryKey: ['schedule', 'week', variables.weekId] });

// B) Nivel padre — más ancho, también válido
qc.invalidateQueries({ queryKey: ['schedule'] });
```

---

## 6. Convención de commits

[Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <subject>

<body opcional>
```

Tipos permitidos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.

Scope por ruta: `hooks`, `weekly`, `daily`, `editor`, `mocks`, `api`, `utils`. Cuando el cambio toca varios scopes, omítelo.

Subject: imperativo, < 72 chars, minúscula inicial, sin punto final.

---

## 7. Cosas que NO debes hacer

- ❌ Usar `any`. Preferir `unknown` + narrowing.
- ❌ Mezclar server state (TanStack Query) con UI state (Zustand) en un mismo hook o store.
- ❌ Escribir tests que dependan del orden de ejecución, del estado compartido entre tests, o de timers sin `vi.useFakeTimers()`.
- ❌ Hacer `invalidateQueries` sin pensar: invalida lo mínimo necesario, pero **nunca olvides las vistas hermanas**.
- ❌ Llamar `api/` directamente desde un componente de `features/`. Siempre pasa por un hook.
- ❌ Usar default exports.
