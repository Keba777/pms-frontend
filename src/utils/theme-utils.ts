export const hexToNumber = (hex: string): number => {
    return parseInt(hex.replace("#", ""), 16);
};

export const numberToHex = (num: number): string => {
    return `#${num.toString(16).padStart(6, "0")}`;
};

export const isValidHex = (hex: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(hex);
};

// Helper to convert hex to RGB values
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
};

// OKLCH conversion helpers (simplified approximation for now, or we can just use hex variables)
// Since the existing global.css uses oklch, it might be better to output hex values directly 
// if tailwind v4 can handle them, OR stick to converting to oklch.
// However, standard CSS custom properties can just hold hex values if we use them with `var(--color-primary)`.
// But global.css uses `oklch(...)`. 
// For simplicity and compatibility with standard color pickers, we will output Hex or RGB 
// and update globals.css to accept standard color formats if possible, OR we supply a converter.

// Given the complexity of accurate OKLCH conversion, and that Tailwind v4 supports arbitrary values,
// we will focus on generating the CSS variables that Tailwind uses.
// If the global.css defines `--primary: oklch(...)`, we should redefine `--primary` with the new color.
// We can set `--primary` to a hex value if Tailwind's theme config allows it, or we need to respect the color space.
// If Tailwind expects `oklch` components, we must provide them.
// Let's look at `globals.css` again: `--primary: oklch(0.21 0.034 264.665);`
// This suggests the variable holds the generated OKLCH string.
// Overriding it with a Hex string might break opacity modifiers if Tailwind expects components usage like `oklch(var(--primary) / <alpha-value>)`.
// Actually, in Tailwind 4, variables usually hold the whole color value.
// If we change it to `--primary: #0e7490`, Tailwind should handle it fine for `bg-primary`, `text-primary`.
// Opacity with hex variables (`bg-primary/50`) usually requires `rgb` component variables or extensive checks.
// For now, let's assume we can set the variable to the full color string (Hex).

export interface ThemeColors {
    primaryColor: number;
    backgroundColor: number;
    cardColor: number;
    cardForegroundColor: number;
    popoverColor: number;
    popoverForegroundColor: number;
    primaryForegroundColor: number;
    secondaryColor: number;
    secondaryForegroundColor: number;
    mutedColor: number;
    mutedForegroundColor: number;
    accentColor: number;
    accentForegroundColor: number;
    destructiveColor: number;
    destructiveForegroundColor: number;
    borderColor: number;
    // We can derive "primary-dark" (cyan-800 equivalent) from primaryColor if needed
}

export const generateThemeFromBranding = (branding: ThemeColors) => {
    return {
        "--background": numberToHex(branding.backgroundColor),
        "--foreground": "#1a1a1a", // Assuming standard foreground or derived
        "--card": numberToHex(branding.cardColor),
        "--card-foreground": numberToHex(branding.cardForegroundColor),
        "--popover": numberToHex(branding.popoverColor),
        "--popover-foreground": numberToHex(branding.popoverForegroundColor),
        "--primary": numberToHex(branding.primaryColor),
        "--primary-foreground": numberToHex(branding.primaryForegroundColor),
        "--secondary": numberToHex(branding.secondaryColor),
        "--secondary-foreground": numberToHex(branding.secondaryForegroundColor),
        "--muted": numberToHex(branding.mutedColor),
        "--muted-foreground": numberToHex(branding.mutedForegroundColor),
        "--accent": numberToHex(branding.accentColor),
        "--accent-foreground": numberToHex(branding.accentForegroundColor),
        "--destructive": numberToHex(branding.destructiveColor),
        "--destructive-foreground": numberToHex(branding.destructiveForegroundColor),
        "--border": numberToHex(branding.borderColor),
        "--input": numberToHex(branding.borderColor), // Reuse border for input
        "--ring": numberToHex(branding.primaryColor), // Ring usually follows primary

        // Custom mappings for "cyan-700" replacement if we want to retain class semantics but change value
        // However, best practice is to switch code to use `bg-primary`, `text-primary`.
        // We can also create variables for specific shades if we want to emulate the palette.
        // user said: "add the primary with opacity for my cyan-800"
        // We can generate a darker shade for hover states
    };
};

export const themeColorsToCssVariables = (
    themeColors: Record<string, string>
): Record<string, string> => {
    return themeColors;
};
