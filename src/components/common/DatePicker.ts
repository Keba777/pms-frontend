import { ComponentProps, ComponentType, ReactNode } from "react";
import EtDatePicker from "habesha-datepicker";

export type ExtendedDatePickerProps = ComponentProps<typeof EtDatePicker> & {
  showTimeSelect?: boolean;
  timeIntervals?: number;
  timeFormat?: string;
  dateFormat?: string;
  placeholderText?: string;
  className?: string;
  popperContainer?: ComponentType<{ children?: ReactNode }>;
  popperPlacement?: string;
};

const DatePicker = EtDatePicker as ComponentType<ExtendedDatePickerProps>;

export default DatePicker;

