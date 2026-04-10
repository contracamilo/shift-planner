# DEMO.md — Guion privado (30 min)

> Documento interno para el presentador. No compartir con la audiencia antes de la charla.

## Antes de arrancar (T-10 min)

- [ ] `npm install` hecho y con la última versión del lockfile.
- [ ] `npm run dev` funciona → abrir navegador en `http://localhost:5173` y cerrarlo (solo para calentar).
- [ ] `npm test` corre al menos una vez → confirmar que `hours.test.ts` está en rojo determinista.
- [ ] `npm test src/features/weekly/WeeklyView.test.tsx` corrido 5 veces → confirmar que falla de forma determinista (Bug 2, race por closure compartido).
- [ ] Claude Code abierto en `/Users/home/Documents/cursos/clau`, modelo **Opus 4.6**.
- [ ] `/mcp` verifica que `filesystem` y `github` están verdes. Si `github` falla, seguir con Plan B.
- [ ] Terminal con zoom grande. Editor a la derecha o en otro desktop.
- [ ] Airplane mode OFF, notificaciones OFF, Slack/mail cerrados.
- [ ] `git status` limpio (si no, hacer `git stash`).

---

## Acto 0 — Contexto (2 min)

**Qué decir:** "Este es un repo real: Shift Planner, planificador de turnos. Tiene tres bugs que no he visto nunca; los introdujo un colega ayer. Vamos a arreglarlos con Claude Code, y en el camino veréis subagents, skills, ultrathink, slash commands, memory y MCPs."

**Qué mostrar:**
1. `ls` en terminal → enseñar la estructura.
2. Abrir `CLAUDE.md` → leer las secciones 1, 2, 5 y 7 en voz alta (pocos segundos cada una). Recalcar: "Claude Code ya conoce estas reglas antes de que yo abra la boca."

---

## Acto 1 — Bug 1, warm-up (4 min)

**Objetivo:** abrir con una victoria rápida. Mostrar el loop básico: ver un test en rojo → pedir a Claude Code que lo arregle → confirmar en verde.

**Prompt exacto:**
```
npm test acaba de fallar en src/utils/hours.test.ts. Lee el test, lee la implementación, dime por qué falla y propón el fix. Luego aplícalo.
```

**Qué esperar que haga Claude Code:**
- Lee `hours.test.ts` y `hours.ts`.
- Detecta el `-1` sospechoso con su comentario sobre "descanso".
- Propone eliminar el `-1` (o reescribir la fórmula como minutos totales, que es aún mejor).
- Edita y vuelve a correr el test → verde.

**Qué decir durante las pausas:** "Fijaos cómo lee primero el test. Eso es el principio básico: entender el contrato antes de tocar el código."

**Si algo falla:** aplica el fix a mano:
```ts
total += (eh - sh) + (em - sm) / 60;
```

---

## Acto 2 — Bug 2, subagent (7 min)

**Objetivo:** mostrar un subagente en acción. Demostrar que los subagents son útiles para tareas repetitivas (correr tests N veces hasta reproducir un flaky).

**Prompt exacto:**
```
Hay un test en src/features/weekly/WeeklyView.test.tsx que está en rojo. Usa el subagente test-runner para correrlo 8 veces y reportar cuántas veces pasa. Luego diagnostica la causa leyendo los archivos implicados, pero sin tocar nada todavía.
```

**Qué esperar:**
- Claude Code invoca al subagente `test-runner`.
- El subagente corre el test 8 veces y reporta el ratio de fallos (hoy: 8/8 en rojo).
- De vuelta en el hilo principal, Claude lee `WeeklyView.test.tsx` → `api/shifts.ts` → `mocks/handlers.ts`.
- Identifica la variable `lastUpdated` en el closure del handler PUT como la causa del race.

**Segundo prompt (una vez diagnosticado):**
```
Aplica el fix mínimo: captura el payload local antes del delay y retorna esa captura, no la variable compartida.
```

**Qué decir:** "Los subagents tienen su propio contexto. Esto es oro: correr 8 tests no ensucia el historial del agente principal. Y los tools del subagente están limitados — solo lee y ejecuta, no puede editar por accidente."

**Si algo falla:** edita `handlers.ts` a mano:
```ts
http.put('/api/shifts/:id', async ({ request, params }) => {
  const incoming = (await request.json()) as Shift;
  const id = params.id as string;
  const idx = currentShifts.findIndex((s) => s.id === id);
  if (idx >= 0) currentShifts[idx] = { ...currentShifts[idx], ...incoming };
  await delay(50 + Math.random() * 80);
  return HttpResponse.json(incoming);
}),
```

---

## Acto 3 — Bug 3, ultrathink + slash commands (10 min)

**Objetivo:** el plato fuerte. Mostrar la secuencia completa: `/explore-bug` → `ultrathink` → `/plan-fix` → aplicar.

**Contexto a levantar en voz alta:** "Un usuario reporta que cuando edita un turno en la vista diaria y vuelve a la semanal, los datos están viejos hasta que recarga la página."

**Prompt 1 — exploración:**
```
/explore-bug cuando edito un shift en DailyView y vuelvo a WeeklyView, los datos son los viejos hasta que hago F5
```

**Qué esperar:**
- Claude Code lee `useUpdateShift.ts`, `useWeeklySchedule.ts`, `useDailySchedule.ts`, `ShiftEditorModal.tsx`.
- Enumera hipótesis. La #1 debería ser: "`onSuccess` solo invalida `['schedule','day',date]`, falta `['schedule','week',weekId]`".
- Se para y pregunta antes de tocar nada.

**Prompt 2 — ultrathink:**
```
ultrathink: antes de decidir el fix, razona sobre el diseño de query keys del proyecto. ¿Es mejor invalidar las dos vistas explícitamente o invalidar al nivel del prefijo `['schedule']`? ¿Qué dice CLAUDE.md al respecto? ¿Qué pasaría si mañana añado una vista mensual?
```

**Qué decir mientras Claude piensa:** "`ultrathink` activa más tiempo de razonamiento. Lo usamos cuando la decisión tiene trade-offs arquitecturales, no cuando el fix es obvio. Para una line-change no merece la pena."

**Qué esperar:**
- Claude compara ambas opciones. Menciona que `['schedule']` es más robusto a cambios futuros pero más ancho; que el explícito es más preciso pero requiere recordar añadir la hermana cada vez. Puede mencionar que CLAUDE.md §5 ya advierte sobre no olvidar hermanas.

**Prompt 3 — plan:**
```
/plan-fix
```

**Qué esperar:**
- Plan estructurado con root cause, archivos, cambios, tests, riesgos.
- Te pregunta si apruebas antes de escribir código.

**Prompt 4 — ejecución:**
```
adelante
```

**Qué decir:** "Este flujo (explore → think → plan → code) es lo que más uso en mi día a día con Claude Code. Parece más lento pero evita refactors a medias."

**Si algo falla:** edita `useUpdateShift.ts` a mano añadiendo la segunda invalidación.

---

## Acto 4 — Skill commit-conventional (2 min)

**Objetivo:** enseñar que los skills son descripciones ejecutables para tareas recurrentes.

**Prompt:**
```
/commit-conventional
```

**Qué esperar:**
- Claude corre `git diff`, clasifica y propone un mensaje en bloque de código.
- Copias el mensaje manualmente y haces `git commit -m "..."` desde la terminal.

**Qué decir:** "Un skill es básicamente un prompt reutilizable con una descripción que el modelo consulta para decidir si lo invoca. No sustituye a un tool; es memoria compartida sobre cómo hacemos las cosas aquí."

---

## Acto 5 — MCP GitHub (2 min)

**Objetivo:** mostrar que Claude Code puede hablar con servicios externos vía MCP.

**Prompt:**
```
/mcp
```
Mostrar que `github` aparece conectado.

**Prompt:**
```
Usando el MCP de GitHub, lista los 3 últimos issues abiertos del repo anthropics/claude-code.
```

**Qué decir:** "MCPs son adaptadores estandarizados. Puedo sumar Jira, Linear, Postgres, Figma, mi propia API… todo con el mismo protocolo. No tengo que enseñarle al modelo un nuevo CLI cada vez."

**Plan B si el MCP de GitHub no funciona:** usar solo el MCP `filesystem` (siempre verde) y decir: "Para ahorrar tiempo, dejaré la parte de GitHub para el Q&A."

---

## Acto 6 — Alternancia de modelos (1 min)

**Objetivo:** mostrar que podemos bajar a Haiku para tareas triviales.

**Prompt:**
```
/model haiku
```
Luego:
```
Cambia el título de la app a "Shift Planner · Demo".
```

Volver a Opus:
```
/model opus
```

**Qué decir:** "Haiku es rápido y barato para ediciones literales. Opus lo reservo para diagnóstico, diseño y refactor grande. Esta alternancia es casi un reflejo muscular: el modelo correcto para el trabajo correcto."

---

## Cierre (2 min)

- Recap en 3 bullets: subagents aíslan contexto, skills codifican prácticas, ultrathink + slash commands estructuran los flujos complejos.
- Invitar a jugar con el repo: `git clone`, abrir Claude Code, probar `/explore-bug` sobre el bug 3 si no se llegó en vivo.
- Dejar visible la URL del repo.

---

## Plan B global

Si el entorno se rompe y Claude Code no responde:

1. Respira. El repo está bien y los bugs son reproducibles a mano.
2. Muestra el código de los tres bugs directamente en el editor y narra lo que haría Claude Code.
3. Enseña `.claude/agents/`, `.claude/skills/` y `.mcp.json` desde el editor como "esto es lo que Claude ejecutaría".
4. Usa los fixes de referencia de los actos 1, 2 y 3.

---

## Checklist "antes de salir a escena" (últimos 10 min)

- [ ] Repo en la rama correcta, `git status` limpio.
- [ ] Terminal con fuente ≥ 18pt, tema claro.
- [ ] Editor con el proyecto abierto, archivos de los bugs precargados en tabs.
- [ ] Claude Code abierto, modelo Opus, `/mcp` verde.
- [ ] `npm run dev` corriendo en una pestaña (por si hace falta reproducir el Bug 3 visualmente).
- [ ] `hours.test.ts` confirmado en rojo.
- [ ] `WeeklyView.test.tsx` corrido 3–5 veces, confirmado flaky.
- [ ] Agua al alcance.
- [ ] Temporizador visible fuera de la pantalla compartida.
- [ ] Modo No molestar ON en el sistema operativo.
