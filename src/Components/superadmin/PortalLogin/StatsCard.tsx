import Image from 'next/image';
import React from 'react';

interface StatsCardProps {
  title: string;
  count?: number;
  change: string;
  storage?: number;
  date?: string;
  icon:string;
  isPositive: boolean;
  isCountPositive?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count, storage, date, icon, change, isPositive, isCountPositive }) => {

  const textColorClass =
  isCountPositive === true
    ? "text-green-600"
    : isCountPositive === false
      ? "text-red-600"
      : "text-gray-600";

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className={"text-sm font-medium text-gray-600"}>{title}</h3>
        <Image src={icon} alt={title} width={28} height={28} />
      </div>
      <div className="flex flex-col space-y-4 justify-between">
        <div className={`text-3xl ${textColorClass} font-semibold`}>{count !== undefined && count.toLocaleString()}
          {storage !== undefined && `${storage} MB`}
          {date && date}</div>
        <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;