'use client'

import React from 'react';
import { Copy } from 'lucide-react';
import Image from 'next/image';

interface ResultStatsCardProps {
  title: string;
  value: string;
  change: string;
  trinket: string;
  isPositive: boolean;
  valueColor?: string;
}

const ResultStatsCard: React.FC<ResultStatsCardProps> = ({
  title,
  value,
  change,
  isPositive,
  trinket,
  valueColor = 'text-gray-900',
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <button className="text-gray-400 hover:text-gray-600">
          <Image
            src={trinket}
            alt={title}
            width={20}
            height={20}
          />
        </button>
      </div>
      <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
      <p className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
        {change}
      </p>
    </div>
  );
};

export default ResultStatsCard;