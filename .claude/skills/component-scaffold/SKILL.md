---
name: component-scaffold
description: Use cuando el usuario quiera crear un componente React nuevo siguiendo los patrones del proyecto (PascalCase, colocalización, testing-library).
---

# component-scaffold

Crea un componente nuevo en `src/features/<feature>/` junto con su test.

## Instrucciones

1. Si no tienes nombre de componente + feature, pregúntalos. Nombre en `PascalCase`, feature en `kebab-case`.
2. Lee `CLAUDE.md` (secciones de naming y de estrategia de TanStack Query / Zustand).
3. Crea dos archivos:
   - `src/features/<feature>/<Component>.tsx`
   - `src/features/<feature>/<Component>.test.tsx`
4. Scaffold mínimo del componente:
   - Functional component tipado con `interface Props`.
   - No importes nada innecesariamente; empieza sin hooks.
   - Exporta con export nombrado: `export function <Component>`.
5. Scaffold mínimo del test:
   - Importa `render, screen` de `@testing-library/react`.
   - Un único test de humo que monta el componente y assertea un texto visible.
   - Usa `describe`/`it` y `expect` globales de Vitest.
6. Respeta el orden de imports: externos primero, luego `../../...`, luego relativos, luego tipos.
7. NO inventes props ni lógica que el usuario no pidió. Pregunta antes si hay ambigüedad.

## Ejemplo

Usuario: "scaffold `<ShiftCard>` en feature `weekly`".

Archivos generados:

```tsx
// src/features/weekly/ShiftCard.tsx
import type { Shift } from '../../types';

interface Props {
  shift: Shift;
}

export function ShiftCard({ shift }: Props) {
  return (
    <article>
      {shift.startTime}–{shift.endTime}
    </article>
  );
}
```

```tsx
// src/features/weekly/ShiftCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShiftCard } from './ShiftCard';

describe('ShiftCard', () => {
  it('renders the shift window', () => {
    render(
      <ShiftCard
        shift={{
          id: 'x',
          employeeId: 'e1',
          date: '2026-04-13',
          weekId: '2026-W15',
          startTime: '09:00',
          endTime: '17:00',
        }}
      />,
    );
    expect(screen.getByText('09:00–17:00')).toBeInTheDocument();
  });
});
```
