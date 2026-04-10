# BUGS.md — Hoja de referencia del presentador

> Privado. Los tres bugs están sembrados a propósito y no deben arreglarse antes de la demo.

---

## Bug 1 — Warm-up (determinista)

- **Archivo:** `src/utils/hours.ts`
- **Línea aprox.:** 14
- **Test que lo expone:** `src/utils/hours.test.ts` — `"9:00→17:00 es 8 horas brutas"` (determinista, siempre falla).
- **Síntoma:** `computeWeeklyHours([9:00→17:00])` devuelve `7` en vez de `8`.
- **Causa:** se resta 1 hora "por descanso" dentro del loop; el spec pide horas brutas.
- **Fix correcto (mínimo):**
  ```ts
  total += (eh - sh) + (em - sm) / 60;
  ```
  **Fix más robusto (sugerencia de mentor):** trabajar en minutos:
  ```ts
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  total += (endMin - startMin) / 60;
  ```
- **Qué enseñar con este bug:** loop básico de Claude Code (leer test → leer impl → proponer fix → aplicar → verificar). Abre la demo con una victoria rápida.

---

## Bug 2 — Medio (race con closure)

- **Archivo:** `src/mocks/handlers.ts`
- **Línea aprox.:** 35 (dentro del handler `PUT /api/shifts/:id`)
- **Test que lo expone:** `src/features/weekly/WeeklyView.test.tsx` — `"la respuesta de un PUT refleja su propio payload"` (falla de forma determinista cuando dos PUTs arrancan con `Promise.all`).
- **Síntoma:** dos `updateShift` en paralelo reciben la respuesta del otro: como `lastUpdated` se reasigna antes del `await delay`, ambos handlers resuelven viendo el payload del último.
- **Causa:** la variable `lastUpdated` vive en el closure del módulo. El primer handler asigna, hace `await delay(...)` y retorna la variable del closure — que ya ha sido sobreescrita por la segunda llamada.
- **Fix correcto:**
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
  (Se puede eliminar `lastUpdated` directamente del archivo.)
- **Qué enseñar con este bug:** subagent `test-runner` para correr el test N veces y caracterizar el fallo (aunque hoy es determinista, el patrón aplica a tests flaky reales). Aísla el trabajo repetitivo en otro contexto. Demuestra que los subagents son útiles incluso sin escribir código nuevo.

---

## Bug 3 — Difícil (ultrathink)

- **Archivo:** `src/hooks/useUpdateShift.ts`
- **Línea aprox.:** 10 (dentro de `onSuccess`)
- **Síntoma:** reproducible visualmente, no por test. Editar un turno en `DailyView` → volver a `WeeklyView` → los datos siguen viejos hasta que el usuario pulsa F5.
- **Causa:** `onSuccess` invalida solo `['schedule', 'day', variables.date]`; la vista semanal tiene queryKey hermana `['schedule', 'week', variables.weekId]` que nadie invalida.
- **Fix correcto (opción A, explícito):**
  ```ts
  onSuccess: (_data, variables) => {
    qc.invalidateQueries({ queryKey: ['schedule', 'day', variables.date] });
    qc.invalidateQueries({ queryKey: ['schedule', 'week', variables.weekId] });
  },
  ```
- **Fix correcto (opción B, al nivel padre):**
  ```ts
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['schedule'] });
  },
  ```
  Opción B es más robusta a futuras vistas (mensual, por empleado…). Buen tema para discutir en vivo con `ultrathink`.
- **Qué enseñar con este bug:** flujo completo `/explore-bug` → `ultrathink` → `/plan-fix` → aplicar. El caso canónico para justificar pensar antes de codear. CLAUDE.md §5 ya advierte literalmente: _"nunca olvides las vistas hermanas"_; el reviewer puede detectarlo.

---

## Cómo reactivar los bugs después de la demo

Si durante los ensayos arreglaste alguno, usa `git restore` desde el commit inicial:

```bash
git restore src/utils/hours.ts
git restore src/mocks/handlers.ts
git restore src/hooks/useUpdateShift.ts
```

O directamente `git reset --hard <hash del commit inicial>` si tienes pendiente muchas modificaciones.
