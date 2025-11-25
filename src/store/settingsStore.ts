// stores/settingsStore.ts
import { create } from 'zustand';

interface SettingsState {
  useEthiopianDate: boolean;
  toggleEthiopianDate: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  useEthiopianDate: true,
  toggleEthiopianDate: () => set((state) => ({ useEthiopianDate: !state.useEthiopianDate })),
}));