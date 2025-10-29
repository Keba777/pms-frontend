"use client"

import React, { useState, useEffect, ChangeEvent } from "react";
import Select, {
  MultiValue,
  StylesConfig,
  GroupBase,
  CSSObjectWithLabel,
} from "react-select";
import { LucideIcon } from "lucide-react";

export interface Option<T = unknown> {
  label: string;
  value: T;
}

export type FieldType = "select" | "multiselect" | "text" | "number" | "date";

export interface FilterField<T = unknown> {
  name: string;
  label: string;
  type: FieldType;
  options?: Option<T>[];
  placeholder?: string;
  required?: boolean;
}

export type FilterValues = Record<string, string | unknown[]>;

export interface GenericFilterProps {
  fields: FilterField[];
  Icon?: LucideIcon;
  onFilterChange: (values: FilterValues) => void;
}

export const GenericFilter: React.FC<GenericFilterProps> = ({
  fields,
  onFilterChange,
}) => {
  const [values, setValues] = useState<FilterValues>(
    fields.reduce((acc, f) => {
      acc[f.name] = f.type === "multiselect" ? [] : "";
      return acc;
    }, {} as FilterValues)
  );

  useEffect(() => {
    onFilterChange(values);
  }, [values, onFilterChange]);

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

  const handleFieldChange = (
    field: FilterField,
    newValue: string | unknown[]
  ) => {
    setValues((prev) => ({ ...prev, [field.name]: newValue }));
  };

  return (
    <div className="flex flex-wrap gap-3 mb-3">
      {fields.map((field) => (
        <div key={field.name} className="w-full sm:w-1/2 md:w-2/5">
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

export default GenericFilter;
