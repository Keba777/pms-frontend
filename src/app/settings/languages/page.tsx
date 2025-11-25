// pages/settings/language.tsx or app/settings/language/page.tsx (assuming app router)
"use client";

import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const LanguageSettings = () => {
  const { useEthiopianDate, toggleEthiopianDate } = useSettingsStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Language & Date Settings</h1>
      <div className="flex items-center space-x-4">
        <Switch
          id="ethiopian-date"
          checked={useEthiopianDate}
          onCheckedChange={toggleEthiopianDate}
          className="data-[state=checked]:bg-cyan-700"
        />
        <Label htmlFor="ethiopian-date" className="text-gray-700">
          Use Ethiopian Date Format 
        </Label>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        This setting changes date displays to Ethiopian calendar. 
      </p>
    </div>
  );
};

export default LanguageSettings;