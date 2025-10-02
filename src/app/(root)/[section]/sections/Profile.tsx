// file: src/Components/student/Profile/StudentProfile.tsx
'use client'

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Globe, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { intitialProfileData, ProfileData } from '@/Constants/Profile';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'student-details' | 'academic-info' | 'guardian-info' | 'security'>('student-details');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(intitialProfileData);
  const [editedData, setEditedData] = useState(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
  };

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
      {/* Header Section with gradient background */}
      <div className='relative h-36 bg-gradient-to-r from-green-800 to-teal-600'>
        {/* You can add a pattern or image overlay here */}
      </div>

      {/* Profile Info Section */}
      <div className='px-8 pb-6'>
        <div className='flex items-start gap-6 -mt-12'>
          {/* Profile Picture */}
          <div className='relative'>
            <div className='w-24 h-24 bg-gradient-to-br from-lime-400 to-green-500 rounded-full flex items-center justify-center border-4 border-white'>
              <User className='w-12 h-12 text-white' />
            </div>
            {isEditing && (
              <button className='absolute bottom-0 right-0 w-8 h-8 bg-green-700 rounded-full flex items-center justify-center border-2 border-white'>
                <Edit2 className='w-4 h-4 text-white' />
              </button>
            )}
          </div>

          {/* Name and Basic Info */}
          <div className='flex-1 pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex mt-10 space-x-2 border-center border-gray-600'>
                <div className='flex flex-col p-2'>
                  <h1 className='text-2xl font-semibold text-gray-900'>{profileData.fullName}</h1>
                  <p className='text-sm text-gray-500'>{profileData.email}</p>
                </div>
                <div className='flex flex-col items-center gap-2 p-2 mt-2'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                    <span className='w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5'></span>
                    {profileData.status}
                  </span>
                  <span className='text-sm text-gray-500'>{profileData.gradeInfo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='mt-6'>
          <div className='flex gap-8'>
            <div className='flex space-x-8 bg-gray-100 rounded-lg p-2'>
              <button
                onClick={() => setActiveTab('student-details')}
                className={`p-2 text-sm font-medium items-center justify-center ${
                  activeTab === 'student-details'
                    ? 'text-black bg-white p-3 rounded-lg'
                    : 'text-gray-400 border-transparent hover:text-gray-700'
                }`}
              >
                Student details
              </button>
              <button
                onClick={() => setActiveTab('academic-info')}
                className={`p-2 text-sm font-medium border-b-2 items-center justify-center ${
                  activeTab === 'academic-info'
                    ? 'text-black bg-white p-3 rounded-lg'
                    : 'text-gray-400 border-transparent hover:text-gray-700'
                }`}
              >
                Academic info
              </button>
              <button
                onClick={() => setActiveTab('guardian-info')}
                className={`p-2 text-sm font-medium border-b-2 items-center justify-center ${
                  activeTab === 'guardian-info'
                    ? 'text-black bg-white p-3 rounded-lg'
                    : 'text-gray-400 border-transparent hover:text-gray-700'
                }`}
              >
                Guardian info
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`p-2 text-sm font-medium border-b-2 items-center justify-center ${
                  activeTab === 'security'
                    ? 'text-black bg-white p-3 rounded-lg'
                    : 'text-gray-400 border-transparent hover:text-gray-700'
                }`}
              >
                Settings
              </button>
            </div>

            {/* Edit/Save/Cancel Buttons - positioned at top right */}
              <div className='ml-auto'>
                {!isEditing ? (
                  <Button
                    onClick={handleEdit}
                    className='bg-green-700 hover:bg-green-800 text-white px-6'
                  >
                    Edit
                  </Button>
                ) : (
                  <div className='flex gap-3'>
                    <Button
                      onClick={handleCancel}
                      variant='outline'
                      className='border-gray-300 text-gray-700 px-6'
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className='bg-green-700 hover:bg-green-800 text-white px-6'
                    >
                      Save changes
                    </Button>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className='mt-6'>
          {activeTab === 'student-details' && (
            <div className='grid grid-cols-2 gap-x-12 gap-y-6'>
              {/* Full Name */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Full name</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Email address</label>
                {isEditing ? (
                  <input
                    type='email'
                    value={editedData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Phone number</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.phoneNumber}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Date of birth</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    placeholder='DD/MM/YYYY'
                  />
                ) : (
                  <p className='text-gray-400 py-2'>{profileData.dateOfBirth}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Address</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.address}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>City</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.city}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>State</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.state}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Country</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.country}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'academic-info' && (
            <div className='grid grid-cols-2 gap-x-12 gap-y-6'>
              {/* Student Admission CID */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Student admission CID</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.studentAdmissionCID}
                    onChange={(e) => handleInputChange('studentAdmissionCID', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.studentAdmissionCID}</p>
                )}
              </div>

              {/* Current Grade */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Current grade</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.currentGrade}
                    onChange={(e) => handleInputChange('currentGrade', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.currentGrade}</p>
                )}
              </div>

              {/* Class Section */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Class section</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.classSection}
                    onChange={(e) => handleInputChange('classSection', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.classSection}</p>
                )}
              </div>

              {/* Admission Date */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Admission date</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.admissionDate}
                    onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    placeholder='DD/MM/YYYY'
                  />
                ) : (
                  <p className='text-gray-400 py-2'>{profileData.admissionDate}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'guardian-info' && (
            <div className='grid grid-cols-2 gap-x-12 gap-y-6'>
              {/* Guardian Name */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Guardian name</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.guardianName}
                    onChange={(e) => handleInputChange('guardianName', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.guardianName}</p>
                )}
              </div>

              {/* Relationship */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Relationship</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.relationship}</p>
                )}
              </div>

              {/* Guardian Phone */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Guardian phone</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.guardianPhone}
                    onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.guardianPhone}</p>
                )}
              </div>

              {/* Guardian Email */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Guardian email</label>
                {isEditing ? (
                  <input
                    type='email'
                    value={editedData.guardianEmail}
                    onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.guardianEmail}</p>
                )}
              </div>

              {/* Emergency Contact */}
              <div>
                <label className='block text-sm text-gray-600 mb-2'>Emergency contact</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editedData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                ) : (
                  <p className='text-gray-900 py-2'>{profileData.emergencyContact}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className='space-y-6'>
              {/* Email Notifications */}
              <div className='flex items-center justify-between py-3'>
                <div>
                  <p className='text-gray-900 font-medium'>Email notifications</p>
                  <p className='text-sm text-gray-500'>Academic info</p>
                </div>
                <button
                  onClick={() => isEditing && handleInputChange('emailNotifications', !editedData.emailNotifications)}
                  disabled={!isEditing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEditing 
                      ? (editedData.emailNotifications ? 'bg-green-600' : 'bg-gray-200')
                      : (profileData.emailNotifications ? 'bg-green-600' : 'bg-gray-200')
                  } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEditing
                        ? (editedData.emailNotifications ? 'translate-x-6' : 'translate-x-1')
                        : (profileData.emailNotifications ? 'translate-x-6' : 'translate-x-1')
                    }`}
                  />
                </button>
              </div>

              {/* SMS Notifications */}
              <div className='flex items-center justify-between py-3'>
                <div>
                  <p className='text-gray-900 font-medium'>SMS notifications</p>
                  <p className='text-sm text-gray-500'>Academic info</p>
                </div>
                <button
                  onClick={() => isEditing && handleInputChange('smsNotifications', !editedData.smsNotifications)}
                  disabled={!isEditing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEditing 
                      ? (editedData.smsNotifications ? 'bg-green-600' : 'bg-gray-200')
                      : (profileData.smsNotifications ? 'bg-green-600' : 'bg-gray-200')
                  } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEditing
                        ? (editedData.smsNotifications ? 'translate-x-6' : 'translate-x-1')
                        : (profileData.smsNotifications ? 'translate-x-6' : 'translate-x-1')
                    }`}
                  />
                </button>
              </div>

              {/* School Announcements */}
              <div className='flex items-center justify-between py-3'>
                <div>
                  <p className='text-gray-900 font-medium'>School annuncments</p>
                  <p className='text-sm text-gray-500'>Academic info</p>
                </div>
                <button
                  onClick={() => isEditing && handleInputChange('schoolAnnouncements', !editedData.schoolAnnouncements)}
                  disabled={!isEditing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEditing 
                      ? (editedData.schoolAnnouncements ? 'bg-green-600' : 'bg-gray-200')
                      : (profileData.schoolAnnouncements ? 'bg-green-600' : 'bg-gray-200')
                  } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEditing
                        ? (editedData.schoolAnnouncements ? 'translate-x-6' : 'translate-x-1')
                        : (profileData.schoolAnnouncements ? 'translate-x-6' : 'translate-x-1')
                    }`}
                  />
                </button>
              </div>

              {/* Password Change */}
              <div className='flex items-center justify-between py-3 pt-6 border-t border-gray-200'>
                <div>
                  <p className='text-gray-900 font-medium'>Password change</p>
                  <p className='text-sm text-gray-500'>Academic info</p>
                </div>
                <button className='text-green-700 hover:text-green-800 text-sm font-medium'>
                  Change password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;