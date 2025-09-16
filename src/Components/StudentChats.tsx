import React from 'react';

interface AttendanceGaugeProps {
  value?: number;
  maxValue?: number;
  label?: string;
}

const AttendanceChart: React.FC<AttendanceGaugeProps> = ({ 
  value = 30, 
  maxValue = 500,
  label = "Attendance" 
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const radius = 90;
  const semicircleLength = Math.PI * radius;
  const fillLength = (percentage / 100) * semicircleLength;

  // Segment calculations (each is one-third of the semicircle)
  const segmentLength = semicircleLength / 3;
  const filledSegments = Math.floor(fillLength / segmentLength);
  const partialFill = fillLength % segmentLength;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: '240px', height: '160px' }}>
        <svg width="240" height="200" viewBox="0 0 240 120">
          <g transform="translate(120, 120)">
            {/* Background Segments */}
            <path
              d="M -90 0 A 90 90 0 0 1 -45 -77.94"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="40"
              strokeLinecap="butt"
            />
            <path
              d="M -45 -77.94 A 90 90 0 0 1 45 -77.94"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="40"
              strokeLinecap="butt"
            />
            <path
              d="M 45 -77.94 A 90 90 0 0 1 90 0"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="40"
              strokeLinecap="butt"
            />

            {/* Active Fill Segments */}
            {/* First segment */}
            <path
              d="M -90 0 A 90 90 0 0 1 -45 -77.94"
              fill="none"
              stroke="#F3F5BD"
              strokeWidth="40"
              strokeLinecap="butt"
              strokeDasharray={
                filledSegments > 0
                  ? `${segmentLength} ${semicircleLength}`
                  : `${Math.min(partialFill, segmentLength)} ${semicircleLength}`
              }
              style={{
                transition: 'stroke-dasharray 0.5s ease-in-out'
              }}
            />

            {/* Second segment */}
            <path
              d="M -45 -77.94 A 90 90 0 0 1 45 -77.94"
              fill="none"
              stroke="#E8ED6B"
              strokeWidth="40"
              strokeLinecap="butt"
              strokeDasharray={
                filledSegments > 1
                  ? `${segmentLength} ${semicircleLength}`
                  : filledSegments === 1
                    ? `${Math.min(partialFill, segmentLength)} ${semicircleLength}`
                    : `0 ${semicircleLength}`
              }
              style={{
                transition: 'stroke-dasharray 0.5s ease-in-out'
              }}
            />

            {/* Third segment */}
            <path
              d="M 45 -77.94 A 90 90 0 0 1 90 0"
              fill="none"
              stroke="#D7DF23"
              strokeWidth="40"
              strokeLinecap="butt"
              strokeDasharray={
                filledSegments > 2
                  ? `${segmentLength} ${semicircleLength}`
                  : filledSegments === 2
                    ? `${Math.min(partialFill, segmentLength)} ${semicircleLength}`
                    : `0 ${semicircleLength}`
              }
              style={{
                transition: 'stroke-dasharray 0.5s ease-in-out'
              }}
            />
          </g>
        </svg>

        {/* Center Content */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{
            left: '50%',
            bottom: '0px',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="text-3xl font-semibold text-gray-900">{value}</div>
          <div
            className="text-xs text-gray-500"
            style={{ marginTop: '4px', letterSpacing: '0.5px' }}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;


interface CircularRankChartProps {
  rank?: string;
  percentage?: number;
}

const PositionChart: React.FC<CircularRankChartProps> = ({ 
  rank = "1st",
  percentage = 50
}) => {
  // Calculate the stroke dash array for the progress
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative" style={{ width: '160px', height: '160px' }}>
        <svg
          width="160"
          height="160"
          viewBox="0 0 240 240"
          className="transform -rotate-90"
        >
          {/* Background circle - light green */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#D4F4DD"
            strokeWidth="40"
            strokeLinecap="round"
          />
          
          {/* Progress circle - dark green */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#0B6E3D"
            strokeWidth="40"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            style={{
              transition: 'stroke-dasharray 0.5s ease-in-out'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: 'rotate(0deg)' }}
        >
          <div style={{ 
            fontSize: '35px', 
            fontWeight: '500', 
            color: '#1f2937',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {rank}
          </div>
        </div>
      </div>
    </div>
  );
};

export { PositionChart };
