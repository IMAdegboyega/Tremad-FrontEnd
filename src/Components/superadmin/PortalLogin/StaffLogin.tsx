import React from 'react';
import { ArrowLeft, Search, Filter, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import Image from 'next/image';

/**
 * Basic staff information for preview view
 */
interface Staff {
  fullName: string;
  staffId: string;
  username: string;
}

/**
 * Complete staff information for full view table
 */
interface AllStaff {
  id: string;
  fullName: string;
  staffId: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string;
  department: string;
  role: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  emergencyContact: string;
  emergencyPhone: string;
  hireDate: string;
}

/**
 * Staff activity history item
 */
interface StaffActivity {
  id: string;
  date: string;
  time: string;
  deviceBrowser: string;
  actionType: string;
  status: 'Success' | 'Failed';
  ipAddress: string;
}

/**
 * Props for the StaffLogin component
 */
interface StaffLoginProps {
  staff: Staff[];
  allStaff?: AllStaff[];
  selectedStaff?: AllStaff;
  staffActivities?: StaffActivity[];
  isFullView?: boolean;
  isDetailView?: boolean;
  isHistoryView?: boolean;
  onViewAll?: () => void;
  onBack?: () => void;
  onViewDetails?: (staffId: string) => void;
  onViewAllHistory?: () => void;
  // modals
  onResetPassword?: () => void;
  onDeactivateAccount?: () => void;
  onSendCredentials?: () => void;
  onDeleteAccount?: () => void;
  // new prop
  onQuickAction?: (staffId: string, action: 'reset' | 'deactivate' | 'delete') => void;
}

/**
 * StaffLogin component with three view modes:
 * 1. Preview view - compact table
 * 2. Full view - complete table with search/filter
 * 3. Detail view - individual staff profile and history
 */
const StaffLogin: React.FC<StaffLoginProps> = ({ 
  staff, 
  allStaff = [],
  selectedStaff,
  staffActivities = [],
  isFullView = false,
  isDetailView = false,
  isHistoryView = false,
  onViewAll,
  onBack,
  onViewDetails,
  onViewAllHistory,
  // modals 
  onResetPassword,
  onDeactivateAccount,
  onSendCredentials,
  onDeleteAccount,
  onQuickAction
}) => {

  // Render full history view
  if (isHistoryView && selectedStaff) {
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Recent History - {selectedStaff.fullName}
          </h1>
        </div>

        {/* Full History Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Date & Time</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Device/Browser</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Action type</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {staffActivities.map((activity) => (
                  <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{activity.date}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.deviceBrowser}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.actionType}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'Success' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  
  // Render individual staff detail view
  if (isDetailView && selectedStaff) {
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
        </div>

        {/* Staff Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
              <Image 
                src="/avatar-placeholder.png" 
                alt={selectedStaff.fullName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Staff Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedStaff.fullName}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedStaff.staffId} • {selectedStaff.role} - {selectedStaff.department}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedStaff.status === 'Active' 
                    ? 'bg-green-50 text-green-700' 
                    : selectedStaff.status === 'Suspended'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    selectedStaff.status === 'Active' 
                      ? 'bg-green-600' 
                      : selectedStaff.status === 'Suspended'
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`} />
                  {selectedStaff.status} Account
                </span>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button onClick={onResetPassword} className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset password
                  <span className="text-xs">Via email verified</span>
                </button>
                <button onClick={onDeactivateAccount} className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Deactivate account
                  <span className="text-xs">Settings will be saved</span>
                </button>
                <button onClick={onSendCredentials} className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Send Credentials
                  <span className="text-xs">Settings will be saved</span>
                </button>
                <button onClick={onDeleteAccount} className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Account
                  <span className="text-xs">Remove all data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent History</h3>
            <button onClick={onViewAllHistory} className="text-sm cursor-pointer text-green-700 hover:text-green-900">View all ››</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Date & Time</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Device/Browser</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Action type</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {staffActivities.slice(0, 5).map((activity) => (
                  <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{activity.date}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.deviceBrowser}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.actionType}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'Success' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  
  // Render full view with complete table, search, and filter functionality
  if (isFullView) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        {/* Page Header with Back Navigation */}
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Staff login details</h1>
        </div>    
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by staff name or Staff ID..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none"
              />
            </div>
            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter by status
            </button>
          </div>
        </div>    
        {/* Complete Staff Data Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Staff</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Staff ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Last login</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Render each staff row with status indicators */}
                {allStaff.map((member, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{member.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.staffId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                    <td className="px-6 py-4">
                      {/* Status badge with color-coded indicator */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        member.status === 'Active' 
                          ? 'bg-green-50 text-green-700' 
                          : member.status === 'Suspended'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {/* Status indicator dot */}
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          member.status === 'Active' 
                            ? 'bg-green-600' 
                            : member.status === 'Suspended'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`} />
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.lastLogin}</td>
                    <td className="px-6 py-4">
                      {/* Actions menu button */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-400 cursor-pointer hover:text-gray-600">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetails?.(member.id)}>
                            <span className='cursor-pointer'>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onQuickAction?.(member.id, 'reset')}><span className='cursor-pointer'>Reset Password</span></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onQuickAction?.(member.id, 'deactivate')}><span className='cursor-pointer'>Deactivate User</span></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onQuickAction?.(member.id, 'delete')}>
                            <span className="text-red-600 cursor-pointer">Delete User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
      {/* Preview Header with Account Count */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Staff Logins <span className="text-gray-500 font-normal">(267 accounts)</span>
        </h2>
        {/* View All Button - navigates to full view */}
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-sm cursor-pointer text-green-700 hover:text-green-900"
          >
            View all <span className="ml-1">››</span>
          </button>
        )}
      </div>
      
      {/* Compact Staff Data Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 items-center justify-center p-2 border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 p-2">Full name</th>
              <th className="text-left text-xs font-medium text-gray-500 p-2">Staff ID</th>
              <th className="text-left text-xs font-medium text-gray-500 p-2">Username</th>
            </tr>
          </thead>
          <tbody>
            {/* Render basic staff information rows */}
            {staff.map((member, index) => (
              <tr key={index} className="border-t border-gray-100 last:border-b-0">
                <td className="p-2 pt-4 pb-4 text-sm text-gray-900">{member.fullName}</td>
                <td className="p-2 pt-4 pb-4 text-sm text-gray-600">{member.staffId}</td>
                <td className="p-2 pt-4 pb-4 text-sm text-gray-600 break-all">{member.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffLogin;