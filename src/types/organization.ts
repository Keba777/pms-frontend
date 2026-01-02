export interface Organization {
    id: string;
    orgName: string;
    logo?: string | null;
    favicon?: string | null;
    primaryColor?: number | null;
    backgroundColor?: number | null;
    cardColor?: number | null;
    cardForegroundColor?: number | null;
    popoverColor?: number | null;
    popoverForegroundColor?: number | null;
    primaryForegroundColor?: number | null;
    secondaryColor?: number | null;
    secondaryForegroundColor?: number | null;
    mutedColor?: number | null;
    mutedForegroundColor?: number | null;
    accentColor?: number | null;
    accentForegroundColor?: number | null;
    destructiveColor?: number | null;
    destructiveForegroundColor?: number | null;
    borderColor?: number | null;
    createdAt?: string;
    updatedAt?: string;
    users?: { id: string }[];
}
