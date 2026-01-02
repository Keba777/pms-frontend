import React from "react";
import Link from "next/link";

interface CardProps {
  title: string;
  count: number | string;
  link: string;
  Icon: React.FC<{ size?: number }>; // Pass size as a prop
  color: string;
}

const Card: React.FC<CardProps> = ({ title, count, link, Icon, color }) => {
  return (
    <div className="w-full px-2 mb-4">
      <div className="bg-white p-[22px] rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className={`text-${color}`}>
            <Icon size={35} />
          </div>
        </div>
        <span className="block text-sm font-semibold text-gray-600">{title}</span>
        <h3 className="text-[26px] text-gray-500 mb-2">{count}</h3>
        <Link href={link} className={`text-${color} font-semibold text-sm`}>
          View More →
        </Link>
      </div>
    </div>
  );
};

export default Card;
