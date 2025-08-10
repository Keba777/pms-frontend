import React, { useState, useEffect, ChangeEvent } from "react";
import Select, {
  MultiValue,
  StylesConfig,
  GroupBase,
  CSSObjectWithLabel,
} from "react-select";
import { LucideIcon } from "lucide-react";

// Define the shape of a generic option
export interface Option<T = unknown> {
  label: string;
  value: T;
}

// Supported field types
export type FieldType = "select" | "multiselect" | "text" | "number" | "date";

// Definition for each filter field
export interface FilterField<T = unknown> {
  /** Unique key for the field, used in the result object */
  name: string;
  /** Label shown next to the input */
  label: string;
  /** Type of input */
  type: FieldType;
  /** If select or multiselect, these are the options */
  options?: Option<T>[];
  /** Placeholder text */
  placeholder?: string;
  /** Whether this field is required to trigger filters */
  required?: boolean;
}

// Record type for filter values: single value or array of values
export type FilterValues = Record<string, string | unknown[]>;

export interface GenericFilterProps {
  /** Array of field definitions to render */
  fields: FilterField[];
  /** Optional icon for the filter button */
  Icon?: LucideIcon;
  /** Called when any field changes or the filter button is clicked */
  onFilterChange: (values: FilterValues) => void;
}

export const GenericFilter: React.FC<GenericFilterProps> = ({
  fields,
  onFilterChange,
}) => {
  // Local state holds current values for each field
  const [values, setValues] = useState<FilterValues>(
    fields.reduce((acc, f) => {
      acc[f.name] = f.type === "multiselect" ? [] : "";
      return acc;
    }, {} as FilterValues)
  );

  // Whenever values update and any required fields are satisfied, emit filter change
  useEffect(() => {
    onFilterChange(values);
  }, [values, onFilterChange]);

  // Shared select styles
  const selectStyles: StylesConfig<Option, true, GroupBase<Option>> = {
    control: (provided: CSSObjectWithLabel, state) => ({
      ...provided,
      border: "1px solid #d1d5db",
      borderRadius: "0.25rem",
      minHeight: "38px",
      boxShadow: state.isFocused
        ? "0 0 0 0.2rem rgba(105,108,255,0.25)"
        : provided.boxShadow,
      "&:hover": { borderColor: "#93c5fd" },
    }),
    placeholder: (p) => ({ ...p, color: "#6b7280" }),
    menu: (p) => ({ ...p, zIndex: 9999 }),
  };

  // Unified handler for updating field values
  const handleFieldChange = (
    field: FilterField,
    newValue: string | unknown[]
  ) => {
    setValues((prev) => ({ ...prev, [field.name]: newValue }));
  };

  return (
    <div className="flex gap-3 mb-3">
      {fields.map((field) => (
        <div
          key={field.name}
          className={
            field.type === "text" || field.type === "number"
              ? "w-full md:w-1/2"
              : "w-full md:w-1/2"
          }
        >
          {field.type === "text" || field.type === "number" ? (
            <input
              type={field.type}
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
              placeholder={field.placeholder ?? field.label}
              value={values[field.name] as string}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleFieldChange(field, e.target.value)
              }
            />
          ) : field.type === "select" ? (
            <select
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
              value={values[field.name] as string}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleFieldChange(field, e.target.value)
              }
            >
              <option value="">{field.placeholder ?? field.label}</option>
              {field.options?.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <Select<Option, true>
              isMulti
              options={field.options}
              getOptionLabel={(o) => o.label}
              getOptionValue={(o) => String(o.value)}
              value={field.options?.filter((o) =>
                (values[field.name] as unknown[]).includes(o.value)
              )}
              onChange={(vals: MultiValue<Option>) =>
                handleFieldChange(
                  field,
                  vals.map((o) => o.value)
                )
              }
              placeholder={field.placeholder ?? field.label}
              styles={selectStyles}
              className="w-full"
            />
          )}
        </div>
      ))}
    </div>
  );
};
