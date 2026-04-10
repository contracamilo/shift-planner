# Shift Planner

Pequeño planificador semanal/diario de turnos. Sirve como terreno de juego para demostrar Claude Code: subagents, skills, slash commands, alternancia de modelos, ultrathink, memory y MCPs.

> ⚠️ **Este repo contiene bugs sembrados a propósito.** Están documentados en `BUGS.md` (privado para el presentador). No los arregles antes de la demo.

## Requisitos

- Node 20+
- npm

## Instalación

```bash
npm install
npm run dev   # http://localhost:5173
```

## Scripts

```bash
npm run dev         # Vite + MSW worker en el navegador
npm test            # vitest --run
npm run test:watch  # vitest en watch
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # build de producción
```

## Arquitectura

Consulta [`CLAUDE.md`](./CLAUDE.md) para el detalle: stack, convenciones, query keys, patrón de stores y reglas prohibidas.

## Claude Code

El repo incluye configuración lista para demear:

- **`CLAUDE.md`** — memoria del proyecto (se carga al arrancar Claude Code en este directorio).
- **`.claude/agents/`** — subagentes (`test-runner`, `code-reviewer`).
- **`.claude/skills/`** — skills (`commit-conventional`, `component-scaffold`).
- **`.claude/commands/`** — slash commands (`/explore-bug`, `/plan-fix`, `/review-pr`).
- **`.mcp.json`** — servidores MCP: `filesystem` (local) y `github` (remoto).

### Configurar el MCP de GitHub

1. Crea un token en https://github.com/settings/tokens (scope: `repo`).
2. Exporta en tu shell:
   ```bash
   # ~/.zshrc
   export GITHUB_TOKEN=ghp_xxx
   ```
3. `source ~/.zshrc` y reinicia Claude Code.
4. Dentro de Claude Code ejecuta `/mcp` para verificar que el servidor `github` aparece conectado.

El MCP `filesystem` funciona sin configuración extra (solo depende de que tengas `npx` en el PATH).

## Estructura

```
src/
├── api/         # fetch wrappers
├── mocks/       # MSW handlers + seed data
├── hooks/       # TanStack Query wrappers
├── stores/      # Zustand (solo UI state)
├── features/    # weekly/, daily/, editor/
├── utils/       # helpers puros
└── types.ts
```
