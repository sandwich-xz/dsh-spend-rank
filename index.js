/**
 * Host half of the Daily Spend Ranking bundle.
 *
 * The feature is browser-only: the Client module reads the per-day cost buckets
 * that the dsh-context `contextActivity` projection already folds, so the Host
 * row exists only to mount the bundle row and activate the client entry.
 */
export function apply() {}
