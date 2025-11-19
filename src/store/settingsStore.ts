// stores/settingsStore.ts
import { create } from 'zustand';

interface SettingsState {
  useEthiopianDate: boolean;
  toggleEthiopianDate: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  useEthiopianDate: false,
  toggleEthiopianDate: () => set((state) => ({ useEthiopianDate: !state.useEthiopianDate })),
}));