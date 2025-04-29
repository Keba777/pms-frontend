// components/ui/MetricsCard.tsx
import React from "react";

interface MetricsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
}

const MetricsCard = ({
  title,
  value,
  icon,
  color = "text-cyan-700",
}: MetricsCardProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow flex items-center space-x-4">
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
    </div>
  );
};

export default MetricsCard;
