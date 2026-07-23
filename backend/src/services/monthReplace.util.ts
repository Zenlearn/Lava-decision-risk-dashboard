/**
 * Shared helpers for delete-then-replace-by-month import semantics (Tier 1).
 *
 * Every month-scoped importer (Master Data, the 3 Compliance sheets, S@H, MSM)
 * treats an uploaded file as the COMPLETE truth for whichever months it covers:
 * before inserting, it deletes all existing rows for those months (across all
 * ASPs), then inserts fresh. This makes re-uploads idempotent (a repeat upload
 * replaces rather than duplicates) and handles legitimate overlapping-month
 * re-uploads (Apr–Jun now, May–Jul next month → May/Jun replaced, not doubled).
 *
 * ZPRP (spare price catalog) is deliberately NOT month-scoped — it already
 * upserts on materialCode and is excluded from this mechanism.
 */

const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Sorts a set of canonical 3-letter months into calendar order for display. */
export function sortMonths(months: Iterable<string>): string[] {
  return Array.from(new Set(months)).sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
}

/**
 * Given the months a file covers and the months that already had data in the
 * target table, splits them into "replaced" (existed before) and "added" (new)
 * — for the Tier 2 result transparency shown in the UI.
 */
export function splitReplacedAdded(
  fileMonths: Iterable<string>,
  existingMonths: Iterable<string>
): { replacedMonths: string[]; addedMonths: string[] } {
  const existing = new Set(existingMonths);
  const file = sortMonths(fileMonths);
  return {
    replacedMonths: file.filter((m) => existing.has(m)),
    addedMonths: file.filter((m) => !existing.has(m)),
  };
}
