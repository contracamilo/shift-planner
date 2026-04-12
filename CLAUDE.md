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

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->