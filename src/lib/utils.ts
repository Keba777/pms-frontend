import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to conditionally merge Tailwind CSS classes.
 * Uses clsx for conditional class joining and twMerge for Tailwind-specific merging.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
