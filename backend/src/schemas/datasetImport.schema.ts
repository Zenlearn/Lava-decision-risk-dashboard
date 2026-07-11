import { z } from 'zod';

/**
 * Zod schemas for the 5 non-Master-Data import files, applied AFTER column
 * mapping via their respective FIELD_MAP in fieldMap.config.ts. Same lenient
 * convention as import.schema.ts — unknown columns pass through to rawData,
 * only the fields the rule engine/hierarchy resolution actually touch are
 * required.
 */

const numOrStr = z.union([z.number(), z.string()]).nullable().optional();

export const QcRowSchema = z.object({
  workorder:        z.union([z.number(), z.string()]),
  aspCode:          numOrStr,
  aspName:          z.string().nullable().optional(),
  asmName:          z.string().nullable().optional(),
  busmName:         z.string().nullable().optional(),
  complianceStatus: z.string().nullable().optional(),
  qcStatus:         z.string().nullable().optional(),
  month:            z.string().nullable().optional(),
});
export type QcRow = z.infer<typeof QcRowSchema>;

export const ElsRowSchema = z.object({
  workorder:           z.union([z.number(), z.string()]),
  aspCode:             numOrStr,
  aspName:             z.string().nullable().optional(),
  asmName:             z.string().nullable().optional(),
  busmName:            z.string().nullable().optional(),
  complianceStatus:    z.string().nullable().optional(),
  nonComplianceReason: z.string().nullable().optional(),
  value:               numOrStr,
  handsetCategory:     z.string().nullable().optional(),
  month:               z.string().nullable().optional(),
});
export type ElsRow = z.infer<typeof ElsRowSchema>;

export const DefRowSchema = z.object({
  challanNo:        z.union([z.number(), z.string()]).nullable().optional(),
  workOrderNumber:  z.union([z.number(), z.string()]).nullable().optional(),
  aspCode:          numOrStr,
  partCode:         z.string().nullable().optional(),
  category:         z.string().nullable().optional(),
  complianceStatus: z.string().nullable().optional(),
  amount:           numOrStr,
  debitQty:         numOrStr,
  month:            numOrStr,
  monthLabel:       z.string().nullable().optional(),
});
export type DefRow = z.infer<typeof DefRowSchema>;

export const SahRowSchema = z.object({
  appointmentId:     z.union([z.number(), z.string()]),
  workOrderNumber:   z.union([z.number(), z.string()]).nullable().optional(),
  aspCode:           numOrStr,
  aspName:           z.string().nullable().optional(),
  asmName:           z.string().nullable().optional(),
  busmName:          z.string().nullable().optional(),
  appointmentStatus: z.string().nullable().optional(),
  appointmentDate:   z.union([z.date(), z.string()]).nullable().optional(),
  cancelReason:      z.string().nullable().optional(),
});
export type SahRow = z.infer<typeof SahRowSchema>;

export const ZprpRowSchema = z.object({
  materialCode:        z.union([z.number(), z.string()]),
  materialDescription: z.string().nullable().optional(),
  basicPrice:          numOrStr,
  distributorPrice:    numOrStr,
  taxRate:             numOrStr,
  validFrom:           z.union([z.date(), z.string()]).nullable().optional(),
  validTo:             z.union([z.date(), z.string()]).nullable().optional(),
});
export type ZprpRow = z.infer<typeof ZprpRowSchema>;
