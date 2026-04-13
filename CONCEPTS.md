# CONCEPTS.md — Guía pragmática de Claude Code

Cada sección explica **qué es**, **cómo se configura** y **cómo se usa** con ejemplos concretos de este proyecto. Nada de teoría abstracta: todo lo que está aquí se puede probar en este repo.

---

## 1. MCP (Model Context Protocol)

### ¿Qué es?

MCP es un estándar abierto para conectar un LLM con servicios externos: filesystems, GitHub, Jira, bases de datos, APIs propias. Claude Code actúa como **cliente MCP** y se conecta a **servidores MCP** que exponen herramientas (tools).

### ¿Dónde se configura?

| Scope    | Archivo                              | Se comparte por git |
| -------- | ------------------------------------ | ------------------- |
| Proyecto | `.mcp.json` (raíz del repo)          | Sí                  |
| Local    | `~/.claude.json`                     | No                  |
| Usuario  | Sección en `~/.claude/settings.json` | No                  |

### Configuración de este proyecto

Archivo `.mcp.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/ruta/al/proyecto"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}" }
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

- `filesystem`: le da a Claude acceso de lectura/escritura al directorio del proyecto vía MCP (complementa los tools nativos Read/Write).
- `github`: le da acceso a repos, issues, PRs y releases de GitHub. Requiere un token con scope `repo`.
- `playwright`: le da a Claude un navegador Chromium controlable para navegar, hacer click, tomar screenshots, etc. Sin config adicional.

### Cómo verificar

Dentro de Claude Code:

```
/mcp
```

Muestra todos los servidores conectados con su estado (verde = OK, rojo = error). Si un servidor falla, revisa que el comando (`npx`) esté en tu PATH y que el token esté exportado en tu shell.

### Cómo agregar un servidor

```bash
# Desde terminal (fuera de Claude Code):
claude mcp add --transport stdio mi-server -- npx -y @mi-org/mi-mcp-server

# O editar .mcp.json directamente.
```

### Configuración de Playwright (browser automation)

El MCP de Playwright le da a Claude un **navegador real** que puede controlar: navegar a URLs, hacer click, rellenar formularios, tomar screenshots y leer el DOM.

**Paso 1 — Agregar al `.mcp.json`:**

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

No requiere tokens ni variables de entorno. Solo `npx`.

**Paso 2 — Verificar:**

```
/mcp
```

Debe aparecer `playwright` en verde.

**Paso 3 — Usar:**

```
Abre el navegador y navega a http://localhost:5173
```

Claude invoca `browser_navigate` y abre un Chromium controlado. Desde ahí puedes pedirle cosas como:

```
Toma un screenshot de la página actual
Haz click en el botón "Agregar turno"
Llena el formulario con nombre "Juan" y horario "9:00-17:00"
```

**Tools principales de Playwright:**

| Tool                      | Qué hace                                     |
| ------------------------- | -------------------------------------------- |
| `browser_navigate`        | Navega a una URL                             |
| `browser_snapshot`        | Lee el estado actual del DOM (accesibilidad) |
| `browser_click`           | Click en un elemento                         |
| `browser_fill_form`       | Rellena campos de formulario                 |
| `browser_take_screenshot` | Captura la pantalla                          |
| `browser_press_key`       | Presiona una tecla                           |
| `browser_tabs`            | Lista pestañas abiertas                      |
| `browser_close`           | Cierra el navegador                          |

**Nota:** El navegador corre con `--no-sandbox` por defecto, lo que genera un warning en la barra del navegador. Es esperado y no afecta la funcionalidad para desarrollo local.

### Ejemplo de uso en la demo

```
Usando el MCP de GitHub, lista los 3 últimos issues abiertos del repo contracamilo/shift-planner.
```

Claude invocará las tools del MCP `github` (como `list_issues`) automáticamente.

---

## 2. Subagentes (Agents)

### ¿Qué es?

Un subagente es un **contexto aislado** que Claude Code puede invocar para delegar una tarea. Cada subagente tiene su propio system prompt, sus tools permitidos, y opcionalmente su propio modelo. Su output vuelve al agente principal sin ensuciar el historial de la conversación.

### ¿Dónde se configura?

| Scope    | Ruta                         | Se comparte por git |
| -------- | ---------------------------- | ------------------- |
| Proyecto | `.claude/agents/nombre.md`   | Sí                  |
| Personal | `~/.claude/agents/nombre.md` | No                  |

### Formato del archivo

```yaml
---
name: nombre-del-agente # identificador único
description: > # cuándo delegar a este agente
  Describe brevemente qué hace. Claude lee esto para decidir
  si invoca al agente automáticamente.
tools: Bash, Read, Grep # tools permitidos (csv)
model: sonnet # opcional: sonnet, opus, haiku, inherit
---
# Instrucciones del agente

Aquí va el system prompt completo.
El agente NO ve el historial de la conversación principal;
solo ve este prompt + lo que el agente principal le pasa.
```

### Campos opcionales del frontmatter

| Campo            | Qué hace                    | Ejemplo                   |
| ---------------- | --------------------------- | ------------------------- |
| `model`          | Modelo que usa el subagente | `haiku` (barato y rápido) |
| `permissionMode` | Nivel de permisos           | `auto`, `default`, `plan` |
| `background`     | Corre en background         | `true`                    |
| `skills`         | Skills precargados          | `[testing-patterns]`      |

### Agentes de este proyecto

**`test-runner`** — Corre tests afectados por un cambio. Útil para verificar flakiness corriendo N veces.

**`code-reviewer`** — Revisa un diff contra las convenciones de CLAUDE.md. No toca archivos.

**`pr-reviewer`** — Revisa un PR de GitHub con `gh` CLI y deja un review comment directo en el PR.

### Tres formas de invocar un subagente

```
# 1. Delegación automática (Claude decide por el description)
Hay un test flaky en WeeklyView.test.tsx, córrelo 8 veces y dime si es intermitente.
# → Claude invoca test-runner porque el description matchea.

# 2. Mención explícita
Usa el subagente test-runner para correr los tests de src/utils/ 5 veces.

# 3. @-mención (garantiza invocación)
@pr-reviewer 42
# → Invoca pr-reviewer pasándole el PR #42.
```

### Ejemplo completo: pr-reviewer

El agente `pr-reviewer` de este proyecto (`.claude/agents/pr-reviewer.md`) puede:

1. Leer el diff de un PR con `gh pr diff <número>`.
2. Analizar los cambios contra CLAUDE.md.
3. Dejar un review con `gh pr review <número> --comment`.

**Prompt para usarlo:**

```
Revisa el PR #3 del repo. Usa el subagente pr-reviewer para que lea
el diff, lo analice contra nuestras convenciones y deje un review
comment en GitHub.
```

**Qué esperar:** el subagente corre `gh pr view 3`, lee CLAUDE.md, analiza el diff, y ejecuta `gh pr review 3 --comment --body "..."` directamente.

### Cuándo usar un subagente vs. hacerlo inline

| Situación                                               | Usa subagente | Hazlo inline |
| ------------------------------------------------------- | :-----------: | :----------: |
| Tarea repetitiva (correr tests N veces)                 |      ✅       |              |
| No quieres ensuciar el contexto principal               |      ✅       |              |
| Necesitas un modelo diferente (haiku para algo trivial) |      ✅       |              |
| La tarea depende de lo que se acaba de discutir         |               |      ✅      |
| Cambio de una línea                                     |               |      ✅      |

---

## 3. Memoria

Claude Code tiene tres capas de memoria. Piensa en ellas como: lo que **tú le dices** (CLAUDE.md), lo que **él aprende solo** (auto-memory), y lo que **nadie olvida** (global).

### Capa 1: CLAUDE.md (tú escribes, todos leen)

El archivo `CLAUDE.md` en la raíz del proyecto es lo primero que Claude carga al abrir una sesión. Es la "constitución" del proyecto.

**Ubicaciones** (de mayor a menor prioridad):

| Archivo                     | Quién lo escribe | Se comparte                          |
| --------------------------- | ---------------- | ------------------------------------ |
| `CLAUDE.md` (raíz del repo) | El equipo        | Sí (git)                             |
| `.claude/CLAUDE.md`         | El equipo        | Sí (git)                             |
| `CLAUDE.local.md`           | Tú               | No (gitignored)                      |
| `~/.claude/CLAUDE.md`       | Tú               | No (global para todos tus proyectos) |

**Buenas prácticas:**

- Mantenerlo bajo 200 líneas (se carga en cada sesión).
- Incluir: stack, comandos, convenciones de naming, reglas prohibidas, patrones de código.
- NO incluir: tutoriales, documentación exhaustiva, cosas que cambian a menudo.

**Generar uno automáticamente:**

```
/init
```

Claude lee tu repo y genera un CLAUDE.md inicial.

### Capa 2: Auto-memory (Claude escribe, Claude lee)

Claude guarda notas automáticamente en `~/.claude/projects/<proyecto>/memory/MEMORY.md`. Las primeras 200 líneas se cargan en cada sesión.

```
# Ver y gestionar la memoria
/memory

# Claude aprende de errores recurrentes y patrones
# confirmados. No guarda cosas de una sola sesión.
```

**Puedes pedirle que recuerde algo explícitamente:**

```
Recuerda: en este proyecto siempre usamos npm, nunca yarn ni pnpm.
```

**O que olvide:**

```
Olvida lo que guardaste sobre usar bun.
```

### Capa 3: Global (~/.claude/CLAUDE.md)

Reglas que aplican a TODOS tus proyectos:

```markdown
# ~/.claude/CLAUDE.md

- Siempre responde en español.
- Prefiere rtk para ejecutar comandos de terminal.
- Nunca auto-commites sin preguntarme.
```

### Ejemplo práctico en este proyecto

El `CLAUDE.md` de Shift Planner incluye:

```markdown
## Estrategia de TanStack Query

### Reglas de invalidación

Al mutar un shift: invalida ambas vistas relacionadas (day y week).
Nunca olvides las vistas hermanas.
```

Esta regla es lo que hace que el **Bug 3** sea detectable automáticamente: Claude (o el agente `code-reviewer`) puede leer CLAUDE.md y reportar que `useUpdateShift.ts` viola la regla de invalidación.

---

## 4. Ultrathink (Extended Thinking)

### ¿Qué es?

Claude Code usa modelos con **pensamiento adaptativo**: deciden cuánto "pensar" según la complejidad del problema. Ultrathink fuerza el máximo de razonamiento para un prompt específico.

### Cómo activarlo

**Para un prompt específico** — incluye "ultrathink" en el texto:

```
ultrathink: antes de decidir el fix, razona sobre el diseño de query keys.
¿Es mejor invalidar las dos vistas explícitamente o invalidar al nivel
del prefijo ['schedule']? ¿Qué dice CLAUDE.md al respecto? ¿Qué pasaría
si mañana añado una vista mensual?
```

**Para toda la sesión** — ajusta el nivel de esfuerzo:

```
/effort high     → razonamiento profundo (default en la mayoría de planes)
/effort max      → máximo razonamiento (solo Opus, más lento)
/effort low      → rápido y barato (ideal para ediciones literales)
/effort medium   → balance (default en Pro/Max)
```

### Cuándo usarlo vs. cuándo no

| Caso                                             | Nivel                        |
| ------------------------------------------------ | ---------------------------- |
| Decidir entre dos arquitecturas con trade-offs   | `ultrathink` o `/effort max` |
| Diagnosticar un bug complejo con múltiples capas | `ultrathink`                 |
| Planificar una migración de schema               | `/effort high`               |
| Cambiar un string literal                        | `/effort low`                |
| Corregir un off-by-one evidente                  | No necesita                  |

### Ejemplo en este proyecto (Bug 3)

```
ultrathink: el usuario reporta datos stale al volver de DailyView a
WeeklyView después de editar un shift. Razona paso a paso:
1. Qué hace useUpdateShift.ts en onSuccess
2. Qué query keys usa el proyecto (ver CLAUDE.md §5)
3. Por qué la vista semanal no se actualiza
4. Dos opciones de fix y sus trade-offs
```

**Qué esperar:** Claude dedica más tokens a razonar internamente. Verás una respuesta más larga, más estructurada, con pros/contras explícitos. Puede tardar 10-20 segundos más que un prompt normal.

---

## 5. Modelos

### Modelos disponibles

| Alias    | Modelo real | Cuándo usarlo                                       |
| -------- | ----------- | --------------------------------------------------- |
| `opus`   | Opus 4.6    | Bugs complejos, arquitectura, refactors grandes     |
| `sonnet` | Sonnet 4.6  | Trabajo diario, la mayoría de tareas                |
| `haiku`  | Haiku 4.5   | Ediciones triviales, renombrar, generar boilerplate |

### Cómo cambiar de modelo

**Durante la sesión:**

```
/model haiku
```

**Al arrancar Claude Code:**

```bash
claude --model opus
```

**Permanente** (en `~/.claude/settings.json`):

```json
{ "model": "sonnet" }
```

**Modelo especial** — planear con Opus, ejecutar con Sonnet:

```
/model opusplan
```

### Patrón de alternancia en la demo

```
# Arrancar con Opus para el diagnóstico pesado
/model opus
/explore-bug cuando edito un shift en DailyView y vuelvo a WeeklyView los datos son viejos

# Bajar a Haiku para un cambio trivial
/model haiku
Cambia el título de la app de "Shift Planner" a "Shift Planner · Demo"

# Volver a Sonnet para trabajo normal
/model sonnet
```

### ¿Por qué importa?

| Modelo | Velocidad    | Costo | Profundidad |
| ------ | ------------ | ----- | ----------- |
| Haiku  | Rápido (~2s) | Bajo  | Superficial |
| Sonnet | Medio (~5s)  | Medio | Buena       |
| Opus   | Lento (~15s) | Alto  | Máxima      |

Usar el modelo correcto para cada tarea es como elegir la herramienta correcta: no uses un mazo para clavar una tachuela.

---

## 6. Skills

### ¿Qué es?

Un skill es un **prompt reutilizable con metadata** que Claude Code puede invocar automáticamente o que el usuario puede invocar con `/nombre`. Piensa en ellos como recetas: cada una describe cuándo usarla y qué pasos seguir.

### ¿Dónde se configuran?

```
.claude/skills/
├── commit-conventional/
│   └── SKILL.md           ← requerido
└── component-scaffold/
    └── SKILL.md
```

Cada skill vive en su propio directorio y requiere un `SKILL.md`.

### Formato de SKILL.md

```yaml
---
name: commit-conventional
description: >
  Use cuando el usuario quiera generar un mensaje de commit
  en formato Conventional Commits.
---

# Instrucciones del skill

1. Ejecuta `git diff --staged`.
2. Clasifica el cambio (feat, fix, refactor, test, docs, chore).
3. Infiere el scope por la ruta del archivo.
4. Redacta el subject: imperativo, < 72 chars, sin punto final.
5. Devuelve el mensaje en un bloque de código.
```

### Campos del frontmatter

| Campo                      | Qué hace                              | Ejemplo                               |
| -------------------------- | ------------------------------------- | ------------------------------------- |
| `name`                     | Identificador (obligatorio)           | `commit-conventional`                 |
| `description`              | Cuándo usar (obligatorio)             | "Use cuando quiera generar un commit" |
| `disable-model-invocation` | Solo manual (`true`) o auto (`false`) | `true`                                |
| `allowed-tools`            | Tools sin pedir permiso               | `Bash(git *)`                         |
| `context`                  | Correr en subagente                   | `fork`                                |
| `paths`                    | Solo para ciertos archivos            | `["src/features/**"]`                 |

### Variables disponibles

```yaml
$ARGUMENTS       # todo lo que el usuario escribió después del /nombre
$0, $1, $2       # argumentos individuales
${CLAUDE_SESSION_ID}
${CLAUDE_SKILL_DIR}  # directorio del skill (para archivos de apoyo)
```

### Skills de este proyecto

**`/commit-conventional`** — genera mensajes Conventional Commits:

```
# Uso:
/commit-conventional

# Claude lee el diff staged, clasifica el cambio, y propone:
# fix(utils): compute raw weekly hours without break deduction
```

**`/component-scaffold`** — genera componente + test:

```
# Uso:
/component-scaffold ShiftCard weekly

# Claude crea:
# src/features/weekly/ShiftCard.tsx
# src/features/weekly/ShiftCard.test.tsx
```

### Skill vs. Agente: ¿cuál uso?

| Necesitas...                                         | Usa                       |
| ---------------------------------------------------- | ------------------------- |
| Un prompt reutilizable que el usuario invoca con `/` | **Skill**                 |
| Un contexto aislado con sus propias tools y modelo   | **Agente**                |
| Ambos (receta invocable que corre en otro contexto)  | Skill con `context: fork` |

---

## 7. Comandos personalizados (Slash Commands)

### ¿Qué es?

Los archivos en `.claude/commands/` crean slash commands invocables con `/project:nombre`. Son la forma más simple de crear prompts reutilizables — un Markdown plano con un placeholder `$ARGUMENTS`.

> **Nota:** los skills (sección 6) son la evolución de los comandos. Skills añaden frontmatter, variables, y la opción de correr en subagente. Los commands siguen funcionando pero para proyectos nuevos se recomiendan skills.

### ¿Dónde se configuran?

```
.claude/commands/
├── explore-bug.md
├── plan-fix.md
└── review-pr.md
```

### Formato

```yaml
---
description: Explora un bug sin modificar archivos.
---

# /explore-bug

Síntoma: $ARGUMENTS

1. Reproduce mentalmente el síntoma.
2. Localiza archivos involucrados con Grep.
3. Traza el flujo de datos.
4. Enumera hipótesis ordenadas por probabilidad.
5. Para y pregunta antes de tocar código.
```

### Invocación

```
/project:explore-bug cuando edito un shift y vuelvo a la semanal los datos son viejos
```

El texto después del nombre reemplaza `$ARGUMENTS`.

### Comandos de este proyecto

| Comando                          | Qué hace                        |
| -------------------------------- | ------------------------------- |
| `/project:explore-bug <síntoma>` | Diagnóstica sin tocar código    |
| `/project:plan-fix`              | Genera plan de fix estructurado |
| `/project:review-pr`             | Invoca al agente code-reviewer  |

### Ejemplo de flujo completo

```
# Paso 1: explorar
/project:explore-bug el total de horas semanales muestra 7 en vez de 8

# Paso 2: planear
/project:plan-fix

# Paso 3: ejecutar (Claude aplica los cambios)
adelante

# Paso 4: commit
/commit-conventional
```

---

## 8. Hooks

### ¿Qué es?

Los hooks son **scripts de shell que se ejecutan automáticamente** en respuesta a eventos de Claude Code. Permiten automatizar tareas como logging, validación, formateo, o notificaciones sin intervención manual.

A diferencia de los agentes o skills (que Claude invoca), los hooks los ejecuta **el sistema** de forma transparente antes o después de ciertas acciones.

### ¿Dónde se configuran?

| Scope    | Archivo                       | Se comparte por git |
| -------- | ----------------------------- | ------------------- |
| Proyecto | `.claude/settings.json`       | Sí                  |
| Personal | `.claude/settings.local.json` | No                  |
| Usuario  | `~/.claude/settings.json`     | No                  |

La configuración vive dentro de la clave `"hooks"` del JSON de settings.

### Eventos disponibles

| Evento         | Cuándo se dispara                    | Caso de uso típico                  |
| -------------- | ------------------------------------ | ----------------------------------- |
| `PreToolUse`   | Antes de ejecutar una tool           | Validar, bloquear acciones          |
| `PostToolUse`  | Después de ejecutar una tool         | Logging, formateo, notificaciones   |
| `Notification` | Cuando Claude emite una notificación | Alertas externas (Slack, desktop)   |
| `Stop`         | Cuando Claude termina su turno       | Limpieza, resúmenes post-sesión     |
| `SubagentStop` | Cuando un subagente termina          | Logging de resultados de subagentes |

### Formato de configuración

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/mi-script.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

- **`matcher`**: regex que filtra por nombre de tool (`Edit`, `Write`, `Bash`, etc.). Si se omite, el hook corre para todas las tools.
- **`type`**: siempre `"command"`.
- **`command`**: ruta al script (relativa al proyecto o absoluta).
- **`timeout`**: segundos máximos de ejecución (default: 60).

### JSON que recibe el hook por stdin

El hook recibe un JSON por stdin con información del evento:

```json
{
  "session_id": "abc123",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/ruta/al/archivo.ts",
    "old_string": "...",
    "new_string": "..."
  },
  "tool_response": "..."
}
```

Los campos varían según el evento y la tool. Para `Edit`/`Write`, `tool_input.file_path` siempre indica el archivo afectado.

### Protocolo de exit codes

| Exit code | Efecto                                                     |
| --------- | ---------------------------------------------------------- |
| `0`       | OK — el hook terminó correctamente                         |
| `2`       | **Bloquear** — la acción se cancela (solo en `PreToolUse`) |
| Otro      | Error — se muestra al usuario pero no bloquea              |

Si el hook escribe a **stdout**, el mensaje se muestra a Claude como feedback. Si escribe a **stderr**, se muestra al usuario como advertencia.

### Hook de este proyecto: TODO Logger

El proyecto incluye un hook `PostToolUse` que detecta comentarios `TODO`, `FIXME`, `HACK` y `XXX` en archivos editados por Claude y los registra en `TODO_LOG.md`.

**Configuración** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/todo-logger.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**Script** (`.claude/hooks/todo-logger.sh`):

1. Lee el JSON del evento por stdin.
2. Extrae `tool_input.file_path` con `jq`.
3. Ejecuta `grep -n -E 'TODO|FIXME|HACK|XXX'` sobre el archivo.
4. Si hay matches, los escribe en `TODO_LOG.md` con timestamp.
5. Sale con `exit 0` siempre — no bloquea nada.

**`TODO_LOG.md`** está en `.gitignore` porque es un log local de cada desarrollador.

### Cómo verificar

```
/hooks
```

Muestra todos los hooks registrados con su estado. El hook `todo-logger.sh` debe aparecer asociado al evento `PostToolUse` con matcher `Edit|Write`.

**Prueba manual:**

1. Pide a Claude que edite un archivo añadiendo un `// TODO: algo`.
2. Verifica que `TODO_LOG.md` se creó en la raíz del proyecto.
3. El archivo debe contener la fecha, ruta del archivo, número de línea y contenido del TODO.

---

## Resumen visual

```
┌───────────────────────────────────────────────────────┐
│                    Claude Code                         │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ /model   │  │ /effort  │  │ /memory              │ │
│  │ opus     │  │ high     │  │ CLAUDE.md + auto      │ │
│  │ sonnet   │  │ max      │  │                       │ │
│  │ haiku    │  │ low      │  │                       │ │
│  └──────────┘  └──────────┘  └──────────────────────┘ │
│                                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  .claude/                                        │   │
│  │  ├── agents/        → subagentes aislados        │   │
│  │  ├── skills/        → prompts reutilizables      │   │
│  │  ├── commands/      → slash commands simples     │   │
│  │  ├── hooks/         → scripts automáticos        │   │
│  │  └── settings.json  → config de hooks            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  .mcp.json          → conexiones externas        │   │
│  │  filesystem, github, jira, postgres, ...         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
└───────────────────────────────────────────────────────┘
```

---

## Cheatsheet de comandos

```bash
# Modelos y esfuerzo
/model opus                    # cambiar modelo
/effort max                    # máximo razonamiento

# Memoria
/memory                        # ver/gestionar memoria
/init                          # generar CLAUDE.md automático

# MCP
/mcp                           # ver servidores conectados

# Hooks
/hooks                         # ver hooks registrados

# Skills y comandos del proyecto
/commit-conventional           # generar commit message
/component-scaffold Name feat  # crear componente + test
/project:explore-bug <síntoma> # diagnosticar un bug
/project:plan-fix              # plan de fix estructurado
/project:review-pr             # code review del diff actual

# Subagentes
@test-runner                   # correr tests focalizados
@code-reviewer                 # review contra CLAUDE.md
@pr-reviewer 42                # review de un PR de GitHub

# Utilidades
/compact                       # comprimir conversación
/cost                          # ver uso de tokens
```
