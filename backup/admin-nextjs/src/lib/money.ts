/**
 * Money crosses the wire as integer **paisa**, never a decimal.
 *
 * The backend stores it that way because floating point cannot represent 0.1,
 * and a rounding error in a ledger is a bug you find months later in a
 * reconciliation report. The browser is where that rule is easiest to break —
 * `<input type="number">` hands back a float, and multiplying it by 100 is
 * exactly the mistake — so conversion happens here and nowhere else.
 */

/** `10000` → `"100.00"`. For display and for prefilling an edit field. */
export function paisaToBdt(paisa: number): string {
  return (paisa / 100).toFixed(2);
}

/** `"100.00"` → `10000`. Returns null for anything that is not a valid amount.
 *
 * Rounds rather than truncates: `19.99` reaches here as `1998.9999…` through
 * binary floating point, and `Math.trunc` would quietly sell it for one paisa
 * less. Negative and non-finite input is rejected, not clamped — a price the
 * operator did not mean is worth an error, not a guess.
 */
export function bdtToPaisa(value: string): number | null {
  const amount = Number(value.trim());
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

/** `10000` → `"৳ 100.00"`. Display only. */
export function formatBdt(paisa: number): string {
  return `৳ ${paisaToBdt(paisa)}`;
}
