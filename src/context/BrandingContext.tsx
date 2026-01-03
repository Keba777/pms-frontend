"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeColors, generateThemeFromBranding } from "../utils/theme-utils";
import { DEFAULT_THEME_COLORS } from "../constants/branding";

interface BrandingContextType {
    branding: ThemeColors;
    setBranding: (branding: ThemeColors) => void;
    resetBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

interface BrandingProviderProps {
    children: React.ReactNode;
    initialBranding?: ThemeColors | null;
}

export function BrandingProvider({
    children,
    initialBranding,
}: BrandingProviderProps) {
    const [branding, setBranding] = useState<ThemeColors>(
        initialBranding || DEFAULT_THEME_COLORS
    );

    useEffect(() => {
        // Generate CSS variables from the branding object
        const themeVariables = generateThemeFromBranding(branding);
        const root = document.documentElement;
        Object.entries(themeVariables).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
    }, [branding]);

    const resetBranding = () => {
        setBranding(DEFAULT_THEME_COLORS);
    };

    const value: BrandingContextType = {
        branding,
        setBranding,
        resetBranding,
    };

    return (
        <BrandingContext.Provider value={value}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error("useBranding must be used within a BrandingProvider");
    }
    return context;
}
