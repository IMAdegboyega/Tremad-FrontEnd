'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {
  User,
  Edit2,
  Loader2,
  AlertCircle,
  Camera,
} from 'lucide-react'
import {
  emptyProfileData,
  mapStudentProfileToProfileData,
  profileDataToUpdateInput,
  ProfileData,
} from '@/Constants/Profile'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/Constants/UserContext'
import { updateProfile, uploadAvatar } from '@/lib/api/student.service'
import { toTitleCase, getInitials } from '@/lib/utils'

/**
 * Profile section
 *
 * View and edit student profile data with tabbed navigation.
 * Uses a simple edit flow: toggle edit mode, modify fields, save or cancel.
 */
const Profile = () => {
  // ===== STATE MANAGEMENT =====
  // Controls which tab is currently active
  const [activeTab, setActiveTab] = useState<
    'student-details' | 'academic-info' | 'guardian-info' | 'security'
  >('student-details')
  
  // Controls whether the form is in edit mode
  const [isEditing, setIsEditing] = useState(false)
  // Tracks an in-flight save request
  const [isSaving, setIsSaving] = useState(false)
  // Last save error (if any) — cleared when the user retries or cancels
  const [saveError, setSaveError] = useState<string | null>(null)

  // ===== AVATAR STATE =====
  // Hidden <input type="file"> is triggered programmatically by clicking the
  // avatar / camera button. A ref is simpler than Array.from(form) gymnastics.
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  // URL the UI should show right now. Preferred order:
  //  1. in-flight preview (object URL from the File the user just picked)
  //  2. the server-stored URL from the user context
  //  3. null — render initials / icon fallback
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Pull the logged-in student's profile from the shared user context.
  const user = useUser()
  const isLoading = !!user?.loading && !user?.profile

  // Derive the form's initial shape from the backend profile. If the profile
  // isn't loaded yet we fall back to an empty shell so the form still renders.
  const derivedProfileData = useMemo<ProfileData>(
    () => mapStudentProfileToProfileData(user?.profile ?? null),
    [user?.profile]
  )

  // Main profile data (saved state) — keep in state so edits don't get wiped
  // on every render, but re-sync when the backend value arrives.
  const [profileData, setProfileData] = useState<ProfileData>(emptyProfileData)

  // Temporary data for editing (unsaved changes)
  const [editedData, setEditedData] = useState(profileData)

  // When the profile fetch resolves, hydrate the form — unless the user is
  // mid-edit, in which case we leave their in-flight changes alone.
  useEffect(() => {
    if (!isEditing) {
      setProfileData(derivedProfileData)
      setEditedData(derivedProfileData)
    }
  }, [derivedProfileData, isEditing])

  // ===== EVENT HANDLERS =====
  // Switches to edit mode and copies current data to editedData
  const handleEdit = () => {
    setIsEditing(true)
    setEditedData(profileData)
    setSaveError(null)
  }

  // Persist the edited data to the backend. On success the user context is
  // refreshed so every other consumer (WelcomeBanner, ProfileCard, ...) picks
  // up the new values.
  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const payload = profileDataToUpdateInput(editedData)
      const res = await updateProfile(payload)

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to save profile')
      }

      // Optimistically reflect the new data in the form before the refresh
      // completes, then pull the authoritative shape from the server.
      setProfileData(editedData)
      setIsEditing(false)

      if (user?.refresh) {
        await user.refresh()
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong while saving your profile.'
      setSaveError(message)
    } finally {
      setIsSaving(false)
    }
  }

  // Cancels editing and resets editedData to original values
  const handleCancel = () => {
    setEditedData(profileData)
    setIsEditing(false)
    setSaveError(null)
  }

  // Updates a specific field in the editedData state
  const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Validate + upload a selected avatar. We only allow images up to 5MB to
  // match the backend limit (anything larger will be rejected server-side
  // anyway, but catching it locally gives a faster, clearer error).
  const MAX_AVATAR_BYTES = 5 * 1024 * 1024

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Always reset the input so picking the same file twice in a row still
    // triggers a change event.
    e.target.value = ''
    if (!file) return

    setAvatarError(null)

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file (JPG, PNG, WEBP, etc.)')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Image is too large. Max size is 5MB.')
      return
    }

    // Show a local preview immediately — feels snappier than waiting for the
    // CDN round-trip before the UI updates.
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)
    setIsUploadingAvatar(true)

    try {
      const res = await uploadAvatar(file)
      if (!res?.success) {
        throw new Error(res?.message || 'Upload failed')
      }
      // Hard-refresh the user context so WelcomeBanner + ProfileCard pick up
      // the new URL.
      if (user?.refresh) await user.refresh()
      // Clear the local preview URL so the authoritative server URL takes
      // over. URL.revokeObjectURL frees memory for the temporary blob.
      URL.revokeObjectURL(localUrl)
      setAvatarPreview(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Avatar upload failed.'
      setAvatarError(message)
      URL.revokeObjectURL(localUrl)
      setAvatarPreview(null)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // ===== DERIVED DISPLAY VALUES =====
  // ProfileData only stores a combined fullName, so split it into first/last
  // for display purposes. Everything after the first token is the last name.
  const [rawFirstName = '', ...rawLastNameParts] = (profileData.fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const rawLastName = rawLastNameParts.join(' ')

  // Always capitalize the name for display. DB remains untouched.
  const displayFirstName = toTitleCase(rawFirstName)
  const displayLastName = toTitleCase(rawLastName)
  const displayFullName =
    [displayFirstName, displayLastName].filter(Boolean).join(' ') ||
    toTitleCase(profileData.fullName) ||
    ''

  // Initials shown inside the avatar circle when there's no image yet.
  const initials = getInitials(rawFirstName, rawLastName, profileData.email)

  // Image src: in-flight preview → stored avatar → null.
  const avatarSrc =
    avatarPreview ||
    user?.profile?.profileImage ||
    user?.profile?.profilePicture ||
    (user?.avatarUrl && user.avatarUrl !== '/img/avatar.jpg' ? user.avatarUrl : null)

  return (
    <div className='bg-white rounded-xl lg:rounded-2xl shadow-sm overflow-hidden w-full max-w-5xl mx-auto'>
      {/* ===== HEADER SECTION ===== */}
      {/* Background gradient banner */}
      <div className='relative'>
        <div className='h-24 lg:h-32 bg-gradient-to-r from-green-700 to-green-900 rounded-t-xl lg:rounded-t-2xl'></div>

        {/* Profile info overlay (avatar + basic info) */}
        <div className='flex flex-col lg:flex-row items-center lg:items-end gap-3 lg:gap-4 px-4 lg:px-6 -mt-10 lg:-mt-12 lg:pb-6'>
          {/* ===== AVATAR SECTION ===== */}
          <div className='relative'>
            {/* Main avatar circle. Click anywhere on it to change the photo. */}
            <button
              type='button'
              onClick={() => avatarFileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              aria-label='Change profile picture'
              className='relative w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center group disabled:opacity-80'
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={displayFullName || 'Profile picture'}
                  width={96}
                  height={96}
                  className='w-full h-full object-cover'
                  unoptimized
                />
              ) : initials ? (
                <span className='text-white text-xl lg:text-2xl font-semibold select-none'>
                  {initials}
                </span>
              ) : (
                <User className='w-10 h-10 lg:w-12 lg:h-12 text-white' />
              )}

              {/* Hover overlay prompting upload. Shown when idle (no preview in
                  flight) so the click target feels discoverable. */}
              {!isUploadingAvatar && (
                <span className='absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors'>
                  <Camera className='w-5 h-5 lg:w-6 lg:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                </span>
              )}

              {/* In-flight spinner */}
              {isUploadingAvatar && (
                <span className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                  <Loader2 className='w-5 h-5 lg:w-6 lg:h-6 text-white animate-spin' />
                </span>
              )}
            </button>

            {/* Small camera button pinned to corner — mirrors desktop patterns
                users are familiar with (Slack, Linear, etc.). */}
            <button
              type='button'
              onClick={() => avatarFileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              aria-label='Upload new profile picture'
              className='absolute bottom-0 right-0 w-7 h-7 lg:w-8 lg:h-8 bg-primary-green hover:bg-primary-green-hover rounded-full flex items-center justify-center border-2 border-white disabled:opacity-60'
            >
              {isUploadingAvatar ? (
                <Loader2 className='w-3 h-3 lg:w-4 lg:h-4 text-white animate-spin' />
              ) : (
                <Edit2 className='w-3 h-3 lg:w-4 lg:h-4 text-white' />
              )}
            </button>

            {/* Hidden file input — triggered by the buttons above. */}
            <input
              ref={avatarFileInputRef}
              type='file'
              accept='image/*'
              onChange={handleAvatarChange}
              className='hidden'
            />
          </div>
          
          {/* ===== BASIC INFO SECTION ===== */}
          <div className='flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 lg:gap-6 text-center lg:pt-14 sm:text-left flex-1'>
            {/* Left side - Name and Email */}
            <div className='flex flex-col space-y-1'>
              {isLoading ? (
                <>
                  <Skeleton className='h-6 w-40' />
                  <Skeleton className='h-4 w-48 mt-1' />
                </>
              ) : (
                <>
                  <h2 className='text-lg lg:text-xl font-semibold'>
                    {displayFullName || '—'}
                  </h2>
                  <p className='text-gray-500 text-xs lg:text-sm'>
                    {profileData.email || '—'}
                  </p>
                </>
              )}
            </div>

            {/* Right side - Status and Grade (horizontal on desktop) */}
            <div className='flex flex-col space-y-1'>
              {isLoading ? (
                <>
                  <Skeleton className='h-6 w-20' />
                  <Skeleton className='h-3 w-32 mt-1' />
                </>
              ) : (
                <>
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
                  {profileData.gradeInfo && (
                    <p className='text-xs text-gray-400'>{profileData.gradeInfo}</p>
                  )}
                </>
              )}
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
                  ? 'bg-white text-black'
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
                disabled={isLoading}
                className='bg-primary-green hover:bg-primary-green-hover text-white px-4 lg:px-6 text-xs lg:text-sm h-8 lg:h-10'
              >
                Edit
              </Button>
            ) : (
              // Save and Cancel buttons (edit mode)
              <div className='flex gap-2 lg:gap-3'>
                <Button
                  onClick={handleCancel}
                  disabled={isSaving}
                  variant='outline'
                  className='border-gray-300 text-gray-700 px-3 lg:px-6 text-xs lg:text-sm h-8 lg:h-10'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className='bg-primary-green hover:bg-primary-green-hover text-white px-3 lg:px-6 text-xs lg:text-sm h-8 lg:h-10 inline-flex items-center gap-2'
                >
                  {isSaving && (
                    <Loader2 className='w-3.5 h-3.5 lg:w-4 lg:h-4 animate-spin' />
                  )}
                  {isSaving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {saveError && (
        <div className='mx-4 lg:mx-6 mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs lg:text-sm text-red-700'>
          <AlertCircle className='w-4 h-4 mt-0.5 flex-shrink-0' />
          <span>{saveError}</span>
        </div>
      )}

      {avatarError && (
        <div className='mx-4 lg:mx-6 mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs lg:text-sm text-red-700'>
          <AlertCircle className='w-4 h-4 mt-0.5 flex-shrink-0' />
          <span>{avatarError}</span>
        </div>
      )}

      {/* ===== TAB CONTENT SECTION ===== */}
      <div className='p-4 lg:p-6'>
        {/* ===== STUDENT DETAILS TAB ===== */}
        {activeTab === 'student-details' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
            {(
              [
                // Admin-managed fields — shown read-only even in edit mode.
                { label: 'Full name', field: 'fullName', readOnly: true },
                { label: 'Email address', field: 'email', readOnly: true },
                // Self-editable contact/demographic fields
                { label: 'Phone number', field: 'phoneNumber', type: 'tel' },
                { label: 'Date of birth', field: 'dateOfBirth', type: 'date' },
                { label: 'Address', field: 'address' },
                { label: 'City', field: 'city' },
                { label: 'State', field: 'state' },
                { label: 'Country', field: 'country' },
              ] as Array<{
                label: string;
                field: keyof ProfileData;
                readOnly?: boolean;
                type?: string;
              }>
            ).map(({ label, field, readOnly, type }) => (
              <div key={field}>
                <label className='block text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2'>
                  {label}
                  {readOnly && (
                    <span className='text-[10px] lg:text-xs text-gray-400 ml-1'>
                      (managed by school)
                    </span>
                  )}
                </label>
                {isLoading && !isEditing ? (
                  <Skeleton className='h-9 w-full' />
                ) : isEditing && !readOnly ? (
                  // Editable input field
                  <input
                    type={type || 'text'}
                    value={editedData[field as keyof ProfileData] as string}
                    onChange={(e) => handleInputChange(field as keyof ProfileData, e.target.value)}
                    className='w-full px-3 bg-gray-100 py-1.5 lg:py-2 text-sm lg:text-base border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500'
                  />
                ) : (
                  // Read-only display. `fullName` gets title-cased so the row
                  // matches the header ("Adegboyega Iretomiwa" not "adegboyega IRETOMIWA").
                  <p className='text-gray-900 bg-gray-100 rounded-md p-2 py-1 lg:py-2 text-sm lg:text-base'>
                    {(field === 'fullName'
                      ? displayFullName
                      : (profileData[field as keyof ProfileData] as string)) || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== ACADEMIC INFO TAB ===== */}
        {activeTab === 'academic-info' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
            {[
              // All academic fields are admin-managed; students can't self-edit.
              { label: 'Student admission CID', field: 'studentAdmissionCID' },
              { label: 'Current grade', field: 'currentGrade' },
              { label: 'Class section', field: 'classSection' },
              { label: 'Admission date', field: 'admissionDate' },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className='block text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2'>
                  {label}
                  <span className='text-[10px] lg:text-xs text-gray-400 ml-1'>
                    (managed by school)
                  </span>
                </label>
                {isLoading && !isEditing ? (
                  <Skeleton className='h-9 w-full' />
                ) : (
                  // Read-only display — academic info is never student-editable
                  <p className='text-gray-900 bg-gray-100 p-2 rounded-md py-1 lg:py-2 text-sm lg:text-base'>
                    {(profileData[field as keyof ProfileData] as string) || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== GUARDIAN INFO TAB ===== */}
        {activeTab === 'guardian-info' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
            {(
              [
                { label: 'Guardian name', field: 'guardianName' },
                { label: 'Relationship', field: 'relationship' },
                { label: 'Guardian phone', field: 'guardianPhone', type: 'tel' },
                { label: 'Guardian email', field: 'guardianEmail', type: 'email' },
                { label: 'Emergency contact', field: 'emergencyContact' },
              ] as Array<{
                label: string;
                field: keyof ProfileData;
                type?: string;
              }>
            ).map(({ label, field, type }) => (
              <div key={field}>
                <label className='block text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2'>{label}</label>
                {isLoading && !isEditing ? (
                  <Skeleton className='h-9 w-full' />
                ) : isEditing ? (
                  // Editable input field
                  <input
                    type={type || 'text'}
                    value={editedData[field as keyof ProfileData] as string}
                    onChange={(e) => handleInputChange(field as keyof ProfileData, e.target.value)}
                    className='w-full bg-gray-100 px-3 py-1.5 lg:py-2 text-sm lg:text-base border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500'
                  />
                ) : (
                  // Read-only display
                  <p className='text-gray-900 py-1 bg-gray-100 rounded-md p-2 lg:py-2 text-sm lg:text-base'>
                    {(profileData[field as keyof ProfileData] as string) || '—'}
                  </p>
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