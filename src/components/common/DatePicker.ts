import { ComponentProps, ComponentType } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export type ExtendedDatePickerProps = ComponentProps<typeof ReactDatePicker> & {
  className?: string;
};

const DatePicker = ReactDatePicker as any;

export default DatePicker;
