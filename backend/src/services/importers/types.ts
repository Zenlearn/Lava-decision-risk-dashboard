/** Common return shape for the 6 non-Master-Data dataset importers. */
export interface DatasetImportSummary {
  importId:      string;
  filename:      string;
  rowCount:      number;
  validCount:    number;
  rejectedCount: number;
  rejectedRows:  { rowIndex: number; errors: string[] }[];
  processingMs:  number;
  /** Months this upload REPLACED (data already existed for them). */
  replacedMonths?: string[];
  /** Months this upload ADDED (no prior data). */
  addedMonths?:    string[];
}
