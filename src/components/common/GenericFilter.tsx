import React, { useState, useEffect } from "react";
import Select, {
  MultiValue,
  GroupBase,
  StylesConfig,
  CSSObjectWithLabel,
} from "react-select";
import { LucideIcon } from "lucide-react";

// Define the shape of a generic option
export interface Option<T = any> {
  label: string;
  value: T;
}

// Supported field types
export type FieldType = "select" | "multiselect" | "text" | "number" | "date";

// Definition for each filter field
export interface FilterField<T = any> {
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

export interface GenericFilterProps {
  /** Array of field definitions to render */
  fields: FilterField[];
  /** Optional icon for the filter button */
  Icon?: LucideIcon;
  /** Called when any field changes or the filter button is clicked */
  onFilterChange: (values: Record<string, any>) => void;
}

export const GenericFilter: React.FC<GenericFilterProps> = ({
  fields,
  Icon,
  onFilterChange,
}) => {
  // Local state holds current values for each field
  const [values, setValues] = useState<Record<string, any>>(
    fields.reduce((acc, f) => {
      acc[f.name] = f.type === "multiselect" ? [] : "";
      return acc;
    }, {} as Record<string, any>)
  );

  // Whenever values update and any required fields are satisfied, emit filter change
  useEffect(() => {
    onFilterChange(values);
  }, [values]);

  // Shared select styles
  const selectStyles: StylesConfig<Option, boolean, GroupBase<Option>> = {
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

  const handleChange = (field: FilterField) => (eventOrValue: any) => {
    let newValue: any;
    if (field.type === "select") {
      newValue = eventOrValue?.value ?? "";
    } else if (field.type === "multiselect") {
      newValue =
        (eventOrValue as MultiValue<Option>)?.map((o) => o.value) ?? [];
    } else {
      newValue = eventOrValue.target.value;
    }
    setValues((prev) => ({ ...prev, [field.name]: newValue }));
  };

  return (
    <div className="flex flex-wrap gap-3 mb-3">
      {fields.map((field) => (
        <div
          key={field.name}
          className={
            field.type === "text" || field.type === "number"
              ? "w-full md:w-1/4"
              : "w-full md:w-1/4"
          }
        >
          {field.type === "text" || field.type === "number" ? (
            <input
              type={field.type}
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
              placeholder={field.placeholder ?? field.label}
              value={values[field.name]}
              onChange={handleChange(field)}
            />
          ) : field.type === "select" ? (
            <select
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
              value={values[field.name]}
              onChange={handleChange(field)}
            >
              <option value="">{field.placeholder ?? field.label}</option>
              {field.options?.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <Select
              isMulti
              options={field.options}
              getOptionLabel={(o) => o.label}
              getOptionValue={(o) => String(o.value)}
              value={field.options?.filter((o) =>
                (values[field.name] as any[]).includes(o.value)
              )}
              onChange={handleChange(field)}
              placeholder={field.placeholder ?? field.label}
              styles={selectStyles}
              className="w-full"
            />
          )}
        </div>
      ))}

      <div className="flex items-center ml-auto">
        <button
          type="button"
          onClick={() => onFilterChange(values)}
          className="bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-bold py-2 px-3 rounded flex items-center gap-1"
        >
          {Icon && <Icon size={16} />} Filter
        </button>
      </div>
    </div>
  );
};
