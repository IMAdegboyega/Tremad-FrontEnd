import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface Activity {
  name: string;
  date: string;
  time: string;
  actionType: string;
  outcome: 'Success' | 'Failed' | 'Error';
}

interface RecentActivityProps {
  activities: Activity[];
  isFullView?: boolean;
  onViewAll?: () => void;
  onBack?: () => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ 
  activities, 
  isFullView = false,
  onViewAll,
  onBack 
}) => {
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Success':
        return 'text-green-600';
      case 'Failed':
        return 'text-red-600';
      case 'Error':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  // Render full view
  if (isFullView) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Recent Activity</h1>
        </div>

        {/* Full Activity Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Time</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Action type</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{activity.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.time}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.actionType}</td>
                    <td className={`px-6 py-4 text-sm font-medium ${getOutcomeColor(activity.outcome)}`}>
                      {activity.outcome}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Render compact preview view (default mode)
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-sm cursor-pointer text-green-700 hover:text-green-900"
          >
            View all <span className="ml-1">››</span>
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto overflow-auto rounded-lg border border-gray-100">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 items-center justify-center p-2 border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 p-2">Name</th>
              <th className="text-left text-xs font-medium text-gray-500 p-2">Date</th>
              <th className="text-left text-xs font-medium text-gray-500 p-2">Time</th>
              <th className="text-left text-xs font-medium text-gray-500 p-2">Action type</th>
              <th className="text-left text-xs font-medium text-gray-500 p-2">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr key={index} className="border-t border-gray-100 last:border-b-0">
                <td className="p-2 pt-4 pb-4 text-sm text-gray-900">{activity.name}</td>
                <td className="p-2 pt-4 pb-4 text-sm text-gray-600">{activity.date}</td>
                <td className="p-2 pt-4 pb-4 text-sm text-gray-600">{activity.time}</td>
                <td className="p-2 pt-4 pb-4 text-sm text-gray-600">{activity.actionType}</td>
                <td className={`p-2 pt-4 pb-4 text-sm font-medium ${getOutcomeColor(activity.outcome)}`}>
                  {activity.outcome}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivity;