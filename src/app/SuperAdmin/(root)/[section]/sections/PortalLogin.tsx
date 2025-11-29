'use client'

import React, { useState } from 'react';
import RecentActivity from '@/components/superadmin/PortalLogin/RecentActivity';
import StaffLogin from '@/components/superadmin/PortalLogin/StaffLogin';
import StatsCard from '@/components/superadmin/PortalLogin/StatsCard';
import StudentLogin from '@/components/superadmin/PortalLogin/StudentLogin';
import DeactivateAccountModal from '@/components/modals/Deactivate';
import DeleteAccountModal from '@/components/modals/DeleteAcount';
import ResetPasswordModal from '@/components/modals/ResetPassword';
import SendCredentialsModal from '@/components/modals/SendCredentials';
import { activityData, allStaffData, allStudentData, staffActivities, staffData, studentActivities, studentData } from '@/Constants/PortalLoginData';

const PortalLogin: React.FC = () => {
  // Student states
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Staff states
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [showAllStaffHistory, setShowAllStaffHistory] = useState(false);

  // Modal states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<typeof allStudentData[0] | null>(null);
  const [selectedStaffForModal, setSelectedStaffForModal] = useState<typeof allStaffData[0] | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const renderModals = () => {
    const person = selectedStudentForModal || selectedStaffForModal;
    if (!person) return null;
    
    return (
      <>
        <DeactivateAccountModal
          isOpen={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          studentName={person.fullName}
        />

        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          studentName={person.fullName}
        />

        <ResetPasswordModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          studentName={person.fullName}
          studentEmail={person.email}
        />

        <SendCredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => setShowCredentialsModal(false)}
          studentName={person.fullName}
        />
      </>
    );
  };

  const handleBackToActivityHome = () => {
    setShowAllActivity(false);
  };

  // ============= STUDENT HANDLERS =============
  const handleViewDetails = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleBackToList = () => {
    setSelectedStudentId(null);
    setShowAllHistory(false);
  };

  const handleBackToHome = () => {
    setShowAllStudents(false);
    setSelectedStudentId(null);
    setShowAllHistory(false);
  };

  const handleViewAllHistory = () => {
    setShowAllHistory(true); 
  };

  const handleBackToDetails = () => {
    setShowAllHistory(false);
  };

  const handleDeactivateAccount = () => {
    const student = allStudentData.find(s => s.id === selectedStudentId);
    if (student) {
      setSelectedStudentForModal(student);
      setShowDeactivateModal(true);
    }
  };

  const handleDeleteAccount = () => {
    const student = allStudentData.find(s => s.id === selectedStudentId);
    if (student) {
      setSelectedStudentForModal(student);
      setShowDeleteModal(true);
    }
  };

  const handleResetPassword = () => {
    const student = allStudentData.find(s => s.id === selectedStudentId);
    if (student) {
      setSelectedStudentForModal(student);
      setShowResetModal(true);
    }
  };

  const handleSendCredentials = () => {
    const student = allStudentData.find(s => s.id === selectedStudentId);
    if (student) {
      setSelectedStudentForModal(student);
      setShowCredentialsModal(true);
    }
  };

  const handleQuickAction = (studentId: string, action: 'reset' | 'deactivate' | 'delete') => {
    const student = allStudentData.find(s => s.id === studentId);
    if (student) {
      setSelectedStudentForModal(student);
      
      switch(action) {
        case 'reset':
          setShowResetModal(true);
          break;
        case 'deactivate':
          setShowDeactivateModal(true);
          break;
        case 'delete':
          setShowDeleteModal(true);
          break;
      }
    }
  };

  // ============= STAFF HANDLERS =============
  const handleViewStaffDetails = (staffId: string) => {
    setSelectedStaffId(staffId);
  };

  const handleBackToStaffList = () => {
    setSelectedStaffId(null);
    setShowAllStaffHistory(false);
  };

  const handleBackToStaffHome = () => {
    setShowAllStaff(false);
    setSelectedStaffId(null);
    setShowAllStaffHistory(false);
  };

  const handleViewAllStaffHistory = () => {
    setShowAllStaffHistory(true); 
  };

  const handleBackToStaffDetails = () => {
    setShowAllStaffHistory(false);
  };

  const handleDeactivateStaffAccount = () => {
    const staff = allStaffData.find(s => s.id === selectedStaffId);
    if (staff) {
      setSelectedStaffForModal(staff);
      setShowDeactivateModal(true);
    }
  };

  const handleDeleteStaffAccount = () => {
    const staff = allStaffData.find(s => s.id === selectedStaffId);
    if (staff) {
      setSelectedStaffForModal(staff);
      setShowDeleteModal(true);
    }
  };

  const handleResetStaffPassword = () => {
    const staff = allStaffData.find(s => s.id === selectedStaffId);
    if (staff) {
      setSelectedStaffForModal(staff);
      setShowResetModal(true);
    }
  };

  const handleSendStaffCredentials = () => {
    const staff = allStaffData.find(s => s.id === selectedStaffId);
    if (staff) {
      setSelectedStaffForModal(staff);
      setShowCredentialsModal(true);
    }
  };

  const handleQuickStaffAction = (staffId: string, action: 'reset' | 'deactivate' | 'delete') => {
    const staff = allStaffData.find(s => s.id === staffId);
    if (staff) {
      setSelectedStaffForModal(staff);
      
      switch(action) {
        case 'reset':
          setShowResetModal(true);
          break;
        case 'deactivate':
          setShowDeactivateModal(true);
          break;
        case 'delete':
          setShowDeleteModal(true);
          break;
      }
    }
  };

  // ============= RENDER LOGIC =============

  if (showAllActivity) {
    return (
      <>
        <RecentActivity 
          activities={activityData}
          isFullView={true}
          onBack={handleBackToActivityHome}
        />
        {renderModals()}
      </>
    );
  }

  // Staff history view
  if (showAllStaffHistory && selectedStaffId) {
    const staff = allStaffData.find(s => s.id === selectedStaffId);
    if (staff) {
      return (
        <>
          <StaffLogin 
            staff={staffData}
            allStaff={allStaffData}
            selectedStaff={staff}
            staffActivities={staffActivities}
            isHistoryView={true}
            onBack={handleBackToStaffDetails}
            onResetPassword={handleResetStaffPassword}
            onDeactivateAccount={handleDeactivateStaffAccount}
            onSendCredentials={handleSendStaffCredentials}
            onDeleteAccount={handleDeleteStaffAccount}
          />
          {renderModals()}
        </>
      );
    }
  }

  // Staff detail view
  if (selectedStaffId) {
    const staff = allStaffData.find(s => s.id === selectedStaffId);
    if (staff) {
      return (
        <>
          <StaffLogin 
            staff={staffData}
            allStaff={allStaffData}
            selectedStaff={staff}
            staffActivities={staffActivities}
            isDetailView={true}
            onBack={handleBackToStaffList}
            onViewAllHistory={handleViewAllStaffHistory}
            onResetPassword={handleResetStaffPassword}
            onDeactivateAccount={handleDeactivateStaffAccount}
            onSendCredentials={handleSendStaffCredentials}
            onDeleteAccount={handleDeleteStaffAccount}
          />
          {renderModals()}
        </>
      );
    }
  }

  // Staff full list view
  if (showAllStaff) {
    return (
      <>
        <StaffLogin 
          staff={staffData}
          allStaff={allStaffData}
          isFullView={true}
          onBack={handleBackToStaffHome}
          onViewDetails={handleViewStaffDetails}
          onQuickAction={handleQuickStaffAction}
        />
        {renderModals()}
      </>
    );
  }

  // Student history view
  if (showAllHistory && selectedStudentId) {
    const student = allStudentData.find(s => s.id === selectedStudentId);
    if (student) {
      return (
        <>
          <StudentLogin 
            students={studentData}
            allStudents={allStudentData}
            selectedStudent={student}
            studentActivities={studentActivities}
            isHistoryView={true}
            onBack={handleBackToDetails}
            onResetPassword={handleResetPassword}
            onDeactivateAccount={handleDeactivateAccount}
            onSendCredentials={handleSendCredentials}
            onDeleteAccount={handleDeleteAccount}
          />
          {renderModals()}
        </>
      );
    }
  }

  // Student detail view
  if (selectedStudentId) {
    const student = allStudentData.find(s => s.id === selectedStudentId);
    if (student) {
      return (
        <>
          <StudentLogin 
            students={studentData}
            allStudents={allStudentData}
            selectedStudent={student}
            studentActivities={studentActivities}
            isDetailView={true}
            onBack={handleBackToList}
            onViewAllHistory={handleViewAllHistory}
            onResetPassword={handleResetPassword}
            onDeactivateAccount={handleDeactivateAccount}
            onSendCredentials={handleSendCredentials}
            onDeleteAccount={handleDeleteAccount}
          />
          {renderModals()}
        </>
      );
    }
  }

  // Student full list view
  if (showAllStudents) {
    return (
      <>
        <StudentLogin 
          students={studentData}
          allStudents={allStudentData}
          isFullView={true}
          onBack={handleBackToHome}
          onViewDetails={handleViewDetails}
          onQuickAction={handleQuickAction}
        />
        {renderModals()}
      </>
    );
  }

  // Normal portal login page view
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Portal login</h1>
              <p className="text-sm text-gray-500 mt-1">Manage students and staff login details here</p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create new user login
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-8 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard 
              title="Total users" 
              count={1247} 
              icon='/icon/message.svg'
              change="+0.71% from last term" 
              isPositive={true} 
            />
            <StatsCard 
              title="Total students" 
              count={980} 
              icon='/icon/message.svg'
              change="+0.33% from last term" 
              isPositive={true} 
            />
            <StatsCard 
              title="Total staffs" 
              count={267} 
              icon='/icon/activity.svg'
              change="+0.06% from last term" 
              isPositive={true} 
            />
          </div>

          {/* Login Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <StudentLogin 
              students={studentData}
              allStudents={allStudentData}
              isFullView={false}
              onViewAll={() => setShowAllStudents(true)}
            />
            <StaffLogin 
              staff={staffData}
              allStaff={allStaffData}
              isFullView={false}
              onViewAll={() => setShowAllStaff(true)}
            />
          </div>

          {/* Recent Activity */}
          <RecentActivity 
            activities={activityData}
            isFullView={false}
            onViewAll={() => setShowAllActivity(true)}
          />
        </main>
      </div>
      {renderModals()}
    </>
  );
};

export default PortalLogin;