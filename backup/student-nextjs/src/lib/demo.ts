/**
 * The few constants and helpers the profile screen needs that are not
 * per-student data.
 *
 * Everything shown on the student screens is now wired to real endpoints:
 *
 *   name, email, phone            GET /auth/me
 *   student id, department, batch GET /auth/me → student
 *   rides remaining               GET /shop/tickets
 *   transaction history           GET /shop/orders
 *   single-trip fare              GET /shop/products
 *   live buses                    GET /track/nearby
 *
 * The only thing here that is not fetched is the university name, and that is
 * because it is not per-student: this is a single-campus ULAB deployment, so
 * the value is a deployment constant rather than a column anyone fills in at
 * registration. If UniTrack ever runs for a second campus this moves to config.
 */

export const UNIVERSITY = "University of Liberal Arts Bangladesh";

const TAKA = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 });

/**
 * Paisa rendered the way a fare is spoken about.
 *
 * Whole taka, because every price in this system is a whole number of them and
 * "৳15.00" on a bus door reads like a bank statement. Grouped, so a four-figure
 * amount is legible at a glance.
 */
export function taka(paisa: number): string {
  return `৳${TAKA.format(Math.round(paisa / 100))}`;
}

/** Initials for the avatar, so no screen depends on an image asset. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}
