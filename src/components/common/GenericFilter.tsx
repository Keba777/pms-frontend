"use client";

import React, { useState, useEffect } from "react";
import { LucideIcon, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface Option<T = unknown> {
  label: string;
  value: T;
}

export type FieldType = "select" | "multiselect" | "text" | "number" | "date" | "daterange";

export interface FilterField<T = unknown> {
  name: string;
  label: string;
  type: FieldType;
  options?: Option<T>[];
  placeholder?: string;
  required?: boolean;
}

export type FilterValues = Record<string, any>;

export interface GenericFilterProps {
  fields: FilterField[];
  Icon?: LucideIcon;
  onFilterChange: (values: FilterValues) => void;
}

export const GenericFilter: React.FC<GenericFilterProps> = ({
  fields,
  onFilterChange,
}) => {
  const [values, setValues] = useState<FilterValues>(() => {
    const initial: FilterValues = {};
    fields.forEach(f => {
      if (f.type === "multiselect") initial[f.name] = [];
      else if (f.type === "daterange") initial[f.name] = { from: undefined, to: undefined };
      else initial[f.name] = "";
    });
    return initial;
  });

  useEffect(() => {
    onFilterChange(values);
  }, [values, onFilterChange]);

  const handleFieldChange = (name: string, newValue: any) => {
    setValues((prev) => ({ ...prev, [name]: newValue }));
  };

  const clearFilter = (name: string, type: FieldType) => {
    let empty: any = "";
    if (type === "multiselect") empty = [];
    if (type === "daterange") empty = { from: undefined, to: undefined };
    handleFieldChange(name, empty);
  };

  return (
    <div className="bg-primary/[0.03] p-6 rounded-xl border border-primary/10 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 w-full">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2 min-w-0">
              <label className="text-xs font-bold text-primary/70 uppercase tracking-wider px-1">
                {field.label}
              </label>
              <div className="relative group">
                {field.type === "text" || field.type === "number" ? (
                  <div className="relative">
                    <Input
                      type={field.type}
                      placeholder={field.placeholder ?? field.label}
                      value={values[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="pr-8 bg-white border-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-lg"
                    />
                    {values[field.name] && (
                      <button
                        onClick={() => clearFilter(field.name, field.type)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : field.type === "select" ? (
                  <Select
                    value={values[field.name] || ""}
                    onValueChange={(val) => handleFieldChange(field.name, val)}
                  >
                    <SelectTrigger className="bg-white border-primary/20 focus:ring-primary/20 focus:border-primary rounded-lg">
                      <SelectValue placeholder={field.placeholder ?? `Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={String(opt.value)} value={String(opt.value)} className="focus:bg-primary/10 focus:text-primary">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "multiselect" ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal text-left overflow-hidden bg-white border-primary/20 hover:bg-gray-50 hover:border-primary/40 rounded-lg h-10 px-3"
                      >
                        <span className="truncate">
                          {Array.isArray(values[field.name]) && values[field.name].length > 0
                            ? `${values[field.name].length} selected`
                            : field.placeholder ?? `Select ${field.label}`}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                      <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                        {field.options?.map((opt) => (
                          <div key={String(opt.value)} className="flex items-center space-x-2 p-2 hover:bg-primary/5 rounded-md transition-colors cursor-pointer group">
                            <Checkbox
                              id={`filter-${field.name}-${opt.value}`}
                              checked={(values[field.name] as any[]).includes(opt.value)}
                              onCheckedChange={(checked) => {
                                const current = values[field.name] as any[];
                                const updated = checked
                                  ? [...current, opt.value]
                                  : current.filter(v => v !== opt.value);
                                handleFieldChange(field.name, updated);
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={`filter-${field.name}-${opt.value}`}
                              className="text-sm font-medium cursor-pointer flex-1 group-hover:text-primary transition-colors"
                            >
                              {opt.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      {Array.isArray(values[field.name]) && values[field.name].length > 0 && (
                        <div className="pt-2 mt-2 border-t border-gray-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-9 text-xs text-primary hover:text-primary hover:bg-primary/10 font-bold"
                            onClick={() => clearFilter(field.name, field.type)}
                          >
                            Clear Selection
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                ) : field.type === "date" ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white border-primary/20 hover:bg-gray-50 hover:border-primary/40 rounded-lg",
                          !values[field.name] && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {values[field.name] ? format(new Date(values[field.name]), "PPP") : (field.placeholder ?? "Pick a date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={values[field.name] ? new Date(values[field.name]) : undefined}
                        onSelect={(date) => handleFieldChange(field.name, date?.toISOString())}
                        initialFocus
                        className="rounded-md border-primary/10"
                      />
                    </PopoverContent>
                  </Popover>
                ) : field.type === "daterange" ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 overflow-hidden bg-white border-primary/20 hover:bg-gray-50 hover:border-primary/40 rounded-lg",
                          !values[field.name]?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate">
                          {values[field.name]?.from ? (
                            values[field.name].to ? (
                              <>
                                {format(values[field.name].from, "MMM dd, y")} -{" "}
                                {format(values[field.name].to, "MMM dd, y")}
                              </>
                            ) : (
                              format(values[field.name].from, "MMM dd, y")
                            )
                          ) : (
                            field.placeholder ?? "Pick a date range"
                          )}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={values[field.name]?.from}
                        selected={{
                          from: values[field.name]?.from ? new Date(values[field.name].from) : undefined,
                          to: values[field.name]?.to ? new Date(values[field.name].to) : undefined,
                        }}
                        onSelect={(range) => handleFieldChange(field.name, range)}
                        numberOfMonths={2}
                        className="rounded-md border-primary/10"
                      />
                    </PopoverContent>
                  </Popover>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => {
              const resetValues: FilterValues = {};
              fields.forEach(f => {
                if (f.type === "multiselect") resetValues[f.name] = [];
                else if (f.type === "daterange") resetValues[f.name] = { from: undefined, to: undefined };
                else resetValues[f.name] = "";
              });
              setValues(resetValues);
            }}
            className="text-primary hover:text-primary hover:bg-primary/10 font-bold uppercase tracking-wider text-xs h-10 px-4"
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenericFilter;

interface ChevronDownProps {
  className?: string;
}
function ChevronDown({ className }: ChevronDownProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
