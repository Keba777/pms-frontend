export type DatePickerValue =
  | Date
  | string
  | [Date | null, Date | null]
  | null
  | undefined;

export const normalizeDatePickerValue = (
  value: DatePickerValue
): Date | null => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [start] = value;
    return start ?? null;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return value;
};

