// utils/dateUtils.ts
import { EthiopianDateUtil as EthiopianDate } from 'habesha-datepicker';
import { useSettingsStore } from '../store/settingsStore';

export const convertToEth = (gregDate: Date | string | null): { Day: number; Month: number; Year: number } | null => {
  if (!gregDate) return null;
  const date = typeof gregDate === 'string' ? new Date(gregDate) : gregDate;
  if (isNaN(date.getTime())) return null;
  return EthiopianDate.toEth(date);
};

export const convertToGreg = (ethDate: { Day: number; Month: number; Year: number } | null): Date | null => {
  if (!ethDate) return null;
  return EthiopianDate.toGreg(ethDate);
};

export const formatEthDate = (ethDate: { Day: number; Month: number; Year: number } | null): string => {
  if (!ethDate) return 'N/A';
  return `${ethDate.Day.toString().padStart(2, '0')}/${ethDate.Month.toString().padStart(2, '0')}/${ethDate.Year} ዓ.ም`;
};

export const formatGregDate = (gregDate: Date | string | null): string => {
  if (!gregDate) return 'N/A';
  const date = typeof gregDate === 'string' ? new Date(gregDate) : gregDate;
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const formatDate = (date: Date | string | null, isEthiopian: boolean = false): string => {
  if (isEthiopian) {
    const eth = convertToEth(date);
    return formatEthDate(eth);
  }
  return formatGregDate(date);
};

export const getDuration = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return `${diffDays} D`;
};

export const getDateDuration = (
    start: Date | string | null | undefined,
    end: Date | string | null | undefined
): string => {
    if (!start || !end) return "N/A";
    const startDate = typeof start === "string" ? new Date(start) : start;
    const endDate = typeof end === "string" ? new Date(end) : end;
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
        return "Invalid Date";

    const { useEthiopianDate } = useSettingsStore.getState();
    const isEthiopian = useEthiopianDate;

    let totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );
    const years = Math.floor(totalDays / 365);
    totalDays %= 365;
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    const parts = [];
    
    if (isEthiopian) {
        if (years > 0) parts.push(`${years} አ`);
        if (months > 0) parts.push(`${months} ወ`);
        if (days > 0 || parts.length === 0)
            parts.push(`${days} ቀ`);
    } else {
        if (years > 0) parts.push(`${years} ${years === 1 ? "Y" : "Ys"}`);
        if (months > 0) parts.push(`${months} ${months === 1 ? "M" : "Ms"}`);
        if (days > 0 || parts.length === 0)
            parts.push(`${days} ${days === 1 ? "D" : "Ds"}`);
    }
    return parts.join(", ");
};