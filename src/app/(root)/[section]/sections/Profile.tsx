'use client'

import React, { useState } from 'react'
import {
  User,
  Edit2
} from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { intitialProfileData, ProfileData } from '@/Constants/Profile'

const Profile = () => {
  // ===== STATE MANAGEMENT =====
  // Controls which tab is currently active
  const [activeTab, setActiveTab] = useState<
    'student-details' | 'academic-info' | 'guardian-info' | 'security'
  >('student-details')
  
  // Controls whether the form is in edit mode
  const [isEditing, setIsEditing] = useState(false)
  
  // Main profile data (saved state)
  const [profileData, setProfileData] = useState<ProfileData>(intitialProfileData)
  
  // Temporary data for editing (unsaved changes)
  const [editedData, setEditedData] = useState(profileData)

  // ===== EVENT HANDLERS =====
  // Switches to edit mode and copies current data to editedData
  const handleEdit = () => {
    setIsEditing(true)
    setEditedData(profileData)
  }

  // Saves edited data to main profile data and exits edit mode
  const handleSave = () => {
    setProfileData(editedData)
    setIsEditing(false)
  }

  // Cancels editing and resets editedData to original values
  const handleCancel = () => {
    setEditedData(profileData)
    setIsEditing(false)
  }

  // Updates a specific field in the editedData state
  const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className='bg-white rounded-xl lg:rounded-2xl shadow-sm overflow-hidden w-full max-w-5xl mx-auto'>
      {/* ===== HEADER SECTION ===== */}
      {/* Background gradient banner */}
      <div className='relative'>
        <div className='h-24 lg:h-32 bg-gradient-to-r from-green-700 to-green-900 rounded-t-xl lg:rounded-t-2xl'></div>

        {/* Profile info overlay */}
        <div className='flex flex-col lg:flex-row items-center lg:items-end gap-3 lg:gap-4 px-4 lg:px-6 -mt-10 lg:-mt-12 lg:pb-6'>
          {/* ===== AVATAR SECTION ===== */}
          <div className='relative'>
            {/* Main avatar circle with gradient background */}
            <div className='w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-lime-400 to-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md'>
              <User className='w-10 h-10 lg:w-12 lg:h-12 text-white' />
            </div>
            {/* Edit avatar button (only visible in edit mode) */}
            {isEditing && (
              <button className='absolute bottom-0 right-0 w-7 h-7 lg:w-8 lg:h-8 bg-green-700 rounded-full flex items-center justify-center border-2 border-white'>
                <Edit2 className='w-3 h-3 lg:w-4 lg:h-4 text-white' />
              </button>
            )}
          </div>
          
          {/* ===== BASIC INFO SECTION ===== */}
          <div className='flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 lg:gap-6 text-center lg:pt-14 sm:text-left flex-1'>
            {/* Left side - Name and Email */}
            <div className='flex flex-col space-y-1'>
              <h2 className='text-lg lg:text-xl font-semibold'>{profileData.fullName}</h2>
              <p className='text-gray-500 text-xs lg:text-sm'>{profileData.email}</p>
            </div>

            {/* Right side - Status and Grade (horizontal on desktop) */}
            <div className='flex flex-col space-y-1'>
              {/* Status Badge */}
              <span 
                className={`flex items-center justify-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1 w-fit rounded-full text-xs lg:text-sm font-medium ${
                  profileData.status === 'Active' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span 
                  className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${
                    profileData.status === 'Active' 
                      ? 'bg-green-600' 
                      : 'bg-gray-900'
                  }`}
                ></span>
                {profileData.status}
              </span>
                
              {/* Grade Info */}
              <p className='text-xs text-gray-400'>{profileData.gradeInfo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABS SECTION ===== */}
      <div className='px-4 lg:px-6 mt-6 lg:mt-8 border-b pb-3 flex flex-wrap gap-3 lg:gap-4 items-center justify-between'>
        {/* ===== TAB NAVIGATION ===== */}
        <div className='flex gap-1 sm:gap-3 p-1 lg:p-2 bg-gray-100 w-full overflow-x-auto scrollbar-hide rounded-lg'>
          {[
            { id: 'student-details', label: 'Student details' },
            { id: 'academic-info', label: 'Academic info' },
            { id: 'guardian-info', label: 'Guardian info' },
            { id: 'security', label: 'Security' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs lg:text-sm font-medium px-2 sm:px-3 py-1.5 lg:py-2 rounded-lg whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === tab.id
                  ? 'bg-white text-black '
                  : 'text-gray-500 hover:text-green-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== ACTION BUTTONS ===== */}
        <div className='flex w-full'>
          <h1 className='text-base lg:text-lg font-semibold text-gray-900 w-full block md:hidden'>
            {[
              { id: 'student-details', label: 'Student details' },
              { id: 'academic-info', label: 'Academic info' },
              { id: 'guardian-info', label: 'Guardian info' },
              { id: 'security', label: 'Security' },
            ].find(tab => tab.id === activeTab)?.label}
          </h1>
          <div className='flex ml-auto items-center justify-center'>
            {!isEditing ? (
              // Edit button (default state)
              <Button
                onClick={handleEdit}
                className='bg-green-700 hover:bg-green-800 text-white px-4 lg:px-6 text-xs lg:text-sm h-8 lg:h-10'
              >
                Edit
              </Button>
            ) : (
              // Save and Cancel buttons (edit mode)
              <div className='flex gap-2 lg:gap-3'>
                <Button
                  onClick={handleCancel}
                  variant='outline'
                  className='border-gray-300 text-gray-700 px-3 lg:px-6 text-xs lg:text-sm h-8 lg:h-10'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className='bg-green-700 hover:bg-green-800 text-white px-3 lg:px-6 text-xs lg:text-sm h-8 lg:h-10'
                >
                  Save changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== TAB CONTENT SECTION ===== */}
      <div className='p-4 lg:p-6'>
        {/* ===== STUDENT DETAILS TAB ===== */}
        {activeTab === 'student-details' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
            {[
              { label: 'Full name', field: 'fullName' },
              { label: 'Email address', field: 'email' },
              { label: 'Phone number', field: 'phoneNumber' },
              { label: 'Date of birth', field: 'dateOfBirth' },
              { label: 'Address', field: 'address' },
              { label: 'City', field: 'city' },
              { label: 'State', field: 'state' },
              { label: 'Country', field: 'country' },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className='block text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2'>{label}</label>
                {isEditing ? (
                  // Editable input field
                  <input
                    type='text'
                    value={editedData[field as keyof ProfileData] as string}
                    onChange={(e) => handleInputChange(field as keyof ProfileData, e.target.value)}
                    className='w-full px-3 bg-gray-100 py-1.5 lg:py-2 text-sm lg:text-base border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500'
                  />
                ) : (
                  // Read-only display
                  <p className='text-gray-900 bg-gray-100 rounded-md p-2 py-1 lg:py-2 text-sm lg:text-base'>{profileData[field as keyof ProfileData]}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== ACADEMIC INFO TAB ===== */}
        {activeTab === 'academic-info' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
            {[
              { label: 'Student admission CID', field: 'studentAdmissionCID' },
              { label: 'Current grade', field: 'currentGrade' },
              { label: 'Class section', field: 'classSection' },
              { label: 'Admission date', field: 'admissionDate' },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className='block text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2'>{label}</label>
                {isEditing ? (
                  // Editable input field
                  <input
                    type='text'
                    value={editedData[field as keyof ProfileData] as string}
                    onChange={(e) => handleInputChange(field as keyof ProfileData, e.target.value)}
                    className='w-full bg-gray-100 px-3 py-1.5 lg:py-2 text-sm lg:text-base border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500'
                  />
                ) : (
                  // Read-only display
                  <p className='text-gray-900 bg-gray-100 p-2 rounded-md py-1 lg:py-2 text-sm lg:text-base'>{profileData[field as keyof ProfileData]}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== GUARDIAN INFO TAB ===== */}
        {activeTab === 'guardian-info' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
            {[
              { label: 'Guardian name', field: 'guardianName' },
              { label: 'Relationship', field: 'relationship' },
              { label: 'Guardian phone', field: 'guardianPhone' },
              { label: 'Guardian email', field: 'guardianEmail' },
              { label: 'Emergency contact', field: 'emergencyContact' },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className='block text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2'>{label}</label>
                {isEditing ? (
                  // Editable input field
                  <input
                    type='text'
                    value={editedData[field as keyof ProfileData] as string}
                    onChange={(e) => handleInputChange(field as keyof ProfileData, e.target.value)}
                    className='w-full bg-gray-100 px-3 py-1.5 lg:py-2 text-sm lg:text-base border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500'
                  />
                ) : (
                  // Read-only display
                  <p className='text-gray-900 py-1 bg-gray-100 rounded-md p-2 lg:py-2 text-sm lg:text-base'>{profileData[field as keyof ProfileData]}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== SECURITY TAB ===== */}
        {activeTab === 'security' && (
          <div className='space-y-4 lg:space-y-6'>
            {/* ===== NOTIFICATION SETTINGS ===== */}
            {[
              {
                label: 'Email notifications',
                field: 'emailNotifications',
              },
              {
                label: 'SMS notifications',
                field: 'smsNotifications',
              },
              {
                label: 'School announcements',
                field: 'schoolAnnouncements',
              },
            ].map(({ label, field }) => (
              <div key={field} className='flex items-center justify-between py-2 lg:py-3'>
                <div>
                  <p className='text-gray-900 font-medium text-sm lg:text-base'>{label}</p>
                  <p className='text-xs lg:text-sm text-gray-500'>Academic info</p>
                </div>
                {/* Toggle switch for notifications */}
                <button
                  onClick={() =>
                    isEditing && handleInputChange(field as keyof ProfileData, !editedData[field as keyof ProfileData])
                  }
                  disabled={!isEditing}
                  className={`relative inline-flex h-5 w-10 lg:h-6 lg:w-11 items-center rounded-full transition-colors ${
                    (isEditing
                      ? editedData[field as keyof ProfileData]
                      : profileData[field as keyof ProfileData])
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-3 w-3 lg:h-4 lg:w-4 transform rounded-full bg-white transition-transform ${
                      (isEditing
                        ? editedData[field as keyof ProfileData]
                        : profileData[field as keyof ProfileData])
                        ? 'translate-x-5 lg:translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}

            {/* ===== PASSWORD CHANGE SECTION ===== */}
            <div className='flex items-center justify-between py-2 lg:py-3 pt-4 lg:pt-6 border-t border-gray-200'>
              <div>
                <p className='text-gray-900 font-medium text-sm lg:text-base'>Password change</p>
                <p className='text-xs lg:text-sm text-gray-500'>Change your password</p>
              </div>
              <button className='text-green-700 hover:text-green-800 text-xs lg:text-sm font-medium'>
                Change password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile