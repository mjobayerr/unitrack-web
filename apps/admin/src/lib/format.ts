/** Money is stored on the backend as an integer number of paisa, never a float.
 * Render it as taka. */
export function taka(paisa: number | null | undefined): string {
  if (paisa == null) return "৳—";
  return `৳${Math.round(paisa / 100).toLocaleString("en-US")}`;
}

/** "Today, 8:30 AM" / "Yesterday, 9:15 AM" / "4 Jul, 8:45 AM" — the format the
 * transaction and activity lists use. */
export function relativeDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000);

  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${time}`;
}
