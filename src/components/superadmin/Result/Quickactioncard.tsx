'use client'

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface QuickActionCardProps {
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 hover:shadow-md transition-shadow text-left w-full"
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-lg ${iconBg} flex items-center justify-center`}>
          <Image
            src={icon}
            alt={title}
            width={30}
            height={30}
            className="object-contain"
          />
        </div>
        <div className='flex flex-col'>
          <p className="text-sm font-base text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-[#189261]" />
    </button>
  );
};

export default QuickActionCard;