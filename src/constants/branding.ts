import { ThemeColors } from "../utils/theme-utils";

export const DEFAULT_THEME_COLORS: ThemeColors = {
    primaryColor: 0x0e7490, // cyan-700
    backgroundColor: 0xffffff, // white
    cardColor: 0xffffff, // white
    cardForegroundColor: 0x1a1a1a,
    popoverColor: 0xffffff,
    popoverForegroundColor: 0x1a1a1a,
    primaryForegroundColor: 0xffffff,
    secondaryColor: 0x374151, // gray-700
    secondaryForegroundColor: 0xffffff,
    mutedColor: 0xf3f4f6, // gray-100
    mutedForegroundColor: 0x6b7280, // gray-500
    accentColor: 0xf3f4f6, // gray-100
    accentForegroundColor: 0x1a1a1a,
    destructiveColor: 0xdc3545,
    destructiveForegroundColor: 0xffffff,
    borderColor: 0xe5e7eb, // gray-200
};

export const COLOR_FIELDS = [
    { id: "primaryColor", label: "Primary Color", defaultValue: "#0e7490" },
    { id: "backgroundColor", label: "Background Color", defaultValue: "#ffffff" },
    { id: "cardColor", label: "Card Color", defaultValue: "#ffffff" },
    { id: "cardForegroundColor", label: "Card Text Color", defaultValue: "#1a1a1a" },
    { id: "popoverColor", label: "Popover Color", defaultValue: "#ffffff" },
    { id: "popoverForegroundColor", label: "Popover Text Color", defaultValue: "#1a1a1a" },
    { id: "primaryForegroundColor", label: "Primary Text Color", defaultValue: "#ffffff" },
    { id: "secondaryColor", label: "Secondary Color", defaultValue: "#374151" },
    { id: "secondaryForegroundColor", label: "Secondary Text Color", defaultValue: "#ffffff" },
    { id: "mutedColor", label: "Muted Color", defaultValue: "#f3f4f6" },
    { id: "mutedForegroundColor", label: "Muted Text Color", defaultValue: "#6b7280" },
    { id: "accentColor", label: "Accent Color", defaultValue: "#f3f4f6" },
    { id: "accentForegroundColor", label: "Accent Text Color", defaultValue: "#1a1a1a" },
    { id: "destructiveColor", label: "Destructive Color", defaultValue: "#dc3545" },
    { id: "destructiveForegroundColor", label: "Destructive Text Color", defaultValue: "#ffffff" },
    { id: "borderColor", label: "Border Color", defaultValue: "#e5e7eb" },
];
