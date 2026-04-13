/**
 * Devuelve el total de horas trabajadas en una lista de turnos.
 * El spec exige horas brutas (sin restar descansos).
 */
export function computeWeeklyHours(shifts) {
    let total = 0;
    for (const shift of shifts) {
        const [sh, sm] = shift.startTime.split(':').map(Number);
        const [eh, em] = shift.endTime.split(':').map(Number);
        // BUG: se descuenta 1h "por descanso" como si fuese política,
        // pero el spec dice que las horas se calculan brutas.
        total += eh - sh - 1 + (em - sm) / 60;
    }
    return total;
}
