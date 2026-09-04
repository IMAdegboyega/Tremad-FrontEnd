'use client';

import React, { useState } from 'react';
// AddStaffModal
// Three-step wizard to create a staff member (role: 'admin').
//
// Notes:
// - The Staff ID is NOT collected here. The backend generates it
//   (TCH<year><seq>) the same way admission numbers are issued to students, and
//   returns it on success along with a temporary password.
// - State of origin drives the Local Government list, mirroring AddStudent.
// - Subjects and classes are multi-select: a teacher can hold several of each.
import { X, CheckCircle, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NIGERIAN_STATES, getLGAsForState } from '@/Constants/NigeriaStates';
import { createStaff } from '@/lib/api/superAdmin.service';
import { getApiErrorMessage } from '@/lib/api/client';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a staff member is successfully created, so the list can refresh. */
  onSuccess?: () => void;
}

interface StaffData {
  // Step 1: Staff details
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  country: string;
  state: string; // State of origin
  city: string; // Local Government
  // Step 2: Assignments
  subjects: string[];
  assignedClasses: string[];
  // Step 3: Next of kin
  kinName: string;
  kinRelationship: string;
  kinPhone: string;
  kinEmail: string;
  emergencyContact: string;
}

const EMPTY_FORM: StaffData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  country: 'Nigeria',
  state: '',
  city: '',
  subjects: [],
  assignedClasses: [],
  kinName: '',
  kinRelationship: '',
  kinPhone: '',
  kinEmail: '',
  emergencyContact: '',
};

const SUBJECTS = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Geography', 'History', 'Literature', 'Agricultural Science',
  'Commerce', 'Government', 'Civic Education', 'Computer Science',
  'Physical Education', 'Fine Arts', 'Music', 'French', 'Yoruba', 'Igbo', 'Hausa',
];

const CLASS_LEVELS = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3',
];

const RELATIONSHIPS = [
  'Spouse', 'Parent', 'Sibling', 'Child', 'Relative', 'Friend', 'Other',
];

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<StaffData>(EMPTY_FORM);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{
    teacherId?: string;
    tempPassword?: string;
    email?: string;
  } | null>(null);

  // Local Governments depend on the chosen state.
  const availableLGAs = getLGAsForState(formData.state);

  if (!isOpen) return null;

  const setField = <K extends keyof StaffData>(field: K, value: StaffData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Changing state clears the LGA — an LGA from the old state would be wrong.
  const handleStateChange = (state: string) => {
    setFormData((prev) => ({ ...prev, state, city: '' }));
  };

  const toggleFromList = (field: 'subjects' | 'assignedClasses', value: string) => {
    setFormData((prev) => {
      const list = prev[field];
      return {
        ...prev,
        [field]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.firstName.trim() &&
          formData.lastName.trim() &&
          formData.email.trim() &&
          formData.phoneNumber.trim() &&
          formData.state &&
          formData.city
        );
      case 2:
        // A staff member must teach at least one subject and hold one class.
        return formData.subjects.length > 0 && formData.assignedClasses.length > 0;
      case 3:
        return !!(formData.kinName.trim() && formData.kinRelationship && formData.kinPhone.trim());
      default:
        return false;
    }
  };

  const handleNext = () => currentStep < 3 && setCurrentStep(currentStep + 1);
  const handleBack = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  /**
   * Creates the staff member. The backend generates the Staff ID and temporary
   * password and returns both, so we surface them on the success screen.
   */
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await createStaff({
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        address: formData.address.trim() || undefined,
        state: formData.state || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        subjects: formData.subjects.length ? formData.subjects : undefined,
        assignedClasses: formData.assignedClasses.length ? formData.assignedClasses : undefined,
        nextOfKin: {
          name: formData.kinName.trim() || undefined,
          relationship: formData.kinRelationship || undefined,
          phone: formData.kinPhone.trim() || undefined,
          email: formData.kinEmail.trim() || undefined,
        },
        emergencyContact: formData.emergencyContact.trim() || undefined,
      });

      if (res.success) {
        const data = (res.data ?? {}) as {
          teacherId?: string;
          tempPassword?: string;
          email?: string;
        };
        setCreatedCreds({
          teacherId: data.teacherId,
          tempPassword: data.tempPassword,
          email: data.email ?? formData.email.trim(),
        });
        setShowSuccess(true);
        onSuccess?.();
      } else {
        setSubmitError(res.message || 'Could not create staff. Please try again.');
      }
    } catch (err) {
      // The API layer throws a plain object, so read it via the helper —
      // otherwise the server's actual reason gets swallowed.
      setSubmitError(getApiErrorMessage(err, 'Could not create staff. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setShowSuccess(false);
    setSubmitting(false);
    setSubmitError(null);
    setCreatedCreds(null);
    setFormData(EMPTY_FORM);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  /** Selected values shown as removable chips under a multi-select. */
  const Chips: React.FC<{ field: 'subjects' | 'assignedClasses' }> = ({ field }) => {
    const values = formData[field];
    if (values.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs"
          >
            {v}
            <button
              type="button"
              onClick={() => toggleFromList(field, v)}
              className="hover:text-green-900"
              aria-label={`Remove ${v}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
    >
      {!showSuccess ? (
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add new staff</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Enter the details of the new staff member. Their Staff ID and temporary
              password are generated automatically.
            </p>

            {/* Progress tabs */}
            <div className="mt-6">
              <div className="flex justify-between items-start relative w-full">
                {[
                  { id: 1, label: '1. Staff details' },
                  { id: 2, label: '2. Assignments' },
                  { id: 3, label: '3. Next of kin' },
                ].map((step) => {
                  const isCompleted = currentStep > step.id;
                  const isActive = currentStep === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => currentStep >= step.id && setCurrentStep(step.id)}
                      disabled={currentStep < step.id}
                      className={`flex flex-col items-center w-full transition-all px-2 ${
                        currentStep < step.id ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      <div
                        className={`h-[3px] w-full rounded-full mb-2 transition-all duration-300 ${
                          isCompleted || isActive ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isActive
                            ? 'text-green-700'
                            : isCompleted
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="p-6 overflow-y-auto">
            {/* ---------------- Step 1: Staff details ---------------- */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setField('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setField('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="Enter email"
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Staff can sign in with this email or their Staff ID.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setField('phoneNumber', e.target.value)}
                      placeholder="Enter phone number"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setField('dateOfBirth', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`${inputClass} flex items-center justify-between text-left`}>
                          <span className={formData.gender ? 'text-gray-900' : 'text-gray-400'}>
                            {formData.gender || 'Select gender'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {['Male', 'Female'].map((g) => (
                          <DropdownMenuItem key={g} onClick={() => setField('gender', g)}>
                            <span className="cursor-pointer">{g}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setField('country', e.target.value)}
                      placeholder="Country"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* State of origin → drives the Local Government list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State Of Origin <span className="text-red-500">*</span>
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`${inputClass} flex items-center justify-between text-left`}>
                          <span className={formData.state ? 'text-gray-900' : 'text-gray-400'}>
                            {formData.state || 'Select state'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 max-h-72 overflow-y-auto">
                        {NIGERIAN_STATES.map((s) => (
                          <DropdownMenuItem key={s} onClick={() => handleStateChange(s)}>
                            <span className="cursor-pointer">{s}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Local Government <span className="text-red-500">*</span>
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={!formData.state}>
                        <button
                          disabled={!formData.state}
                          className={`${inputClass} flex items-center justify-between text-left ${
                            !formData.state ? 'bg-gray-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className={formData.city ? 'text-gray-900' : 'text-gray-400'}>
                            {formData.city ||
                              (formData.state ? 'Select local government' : 'Select a state first')}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 max-h-72 overflow-y-auto">
                        {availableLGAs.map((lga) => (
                          <DropdownMenuItem key={lga} onClick={() => setField('city', lga)}>
                            <span className="cursor-pointer">{lga}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setField('address', e.target.value)}
                    placeholder="Enter home address"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* ---------------- Step 2: Assignments ---------------- */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600">
                    The Staff ID is generated automatically when you save, in the same way
                    admission numbers are issued to students. It will be shown once the
                    staff member is created.
                  </p>
                </div>

                {/* Subjects — multi-select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned subjects <span className="text-red-500">*</span>
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`${inputClass} flex items-center justify-between text-left`}>
                        <span className={formData.subjects.length ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.subjects.length
                            ? `${formData.subjects.length} subject${formData.subjects.length > 1 ? 's' : ''} selected`
                            : 'Select subjects'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 max-h-72 overflow-y-auto">
                      {SUBJECTS.map((subject) => (
                        <DropdownMenuCheckboxItem
                          key={subject}
                          checked={formData.subjects.includes(subject)}
                          // Keep the menu open so several can be picked at once
                          onSelect={(e) => e.preventDefault()}
                          onCheckedChange={() => toggleFromList('subjects', subject)}
                        >
                          {subject}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Chips field="subjects" />
                </div>

                {/* Classes — multi-select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned classes <span className="text-red-500">*</span>
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`${inputClass} flex items-center justify-between text-left`}>
                        <span
                          className={formData.assignedClasses.length ? 'text-gray-900' : 'text-gray-400'}
                        >
                          {formData.assignedClasses.length
                            ? `${formData.assignedClasses.length} class${formData.assignedClasses.length > 1 ? 'es' : ''} selected`
                            : 'Select classes'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 max-h-72 overflow-y-auto">
                      {CLASS_LEVELS.map((level) => (
                        <DropdownMenuCheckboxItem
                          key={level}
                          checked={formData.assignedClasses.includes(level)}
                          onSelect={(e) => e.preventDefault()}
                          onCheckedChange={() => toggleFromList('assignedClasses', level)}
                        >
                          {level}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Chips field="assignedClasses" />
                </div>
              </div>
            )}

            {/* ---------------- Step 3: Next of kin ---------------- */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Who should the school contact about this staff member in an emergency?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.kinName}
                      onChange={(e) => setField('kinName', e.target.value)}
                      placeholder="Enter full name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`${inputClass} flex items-center justify-between text-left`}>
                          <span className={formData.kinRelationship ? 'text-gray-900' : 'text-gray-400'}>
                            {formData.kinRelationship || 'Select relationship'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {RELATIONSHIPS.map((r) => (
                          <DropdownMenuItem key={r} onClick={() => setField('kinRelationship', r)}>
                            <span className="cursor-pointer">{r}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.kinPhone}
                      onChange={(e) => setField('kinPhone', e.target.value)}
                      placeholder="Enter phone number"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.kinEmail}
                      onChange={(e) => setField('kinEmail', e.target.value)}
                      placeholder="Enter email"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency contact
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => setField('emergencyContact', e.target.value)}
                    placeholder="Alternative emergency number"
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            {submitError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                  currentStep === 1 ? 'invisible' : ''
                }`}
              >
                Back
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    isStepValid(currentStep)
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep) || submitting}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    isStepValid(currentStep) && !submitting
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Creating...' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Success dialog
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">Successful!</h2>
          <p className="text-sm text-gray-600 mb-4">Staff added successfully</p>

          {(createdCreds?.teacherId || createdCreds?.tempPassword) && (
            <div className="mb-6 text-left bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-xs text-gray-500">
                Give these to the staff member — the temporary password is shown only once.
                They can sign in with either the email or the Staff ID.
              </p>
              {createdCreds.teacherId && (
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-500">Staff ID</span>
                  <span className="font-medium text-gray-900 break-all">{createdCreds.teacherId}</span>
                </div>
              )}
              {createdCreds.email && (
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900 break-all">{createdCreds.email}</span>
                </div>
              )}
              {createdCreds.tempPassword && (
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-500">Temp password</span>
                  <span className="font-mono font-medium text-gray-900 break-all">
                    {createdCreds.tempPassword}
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default AddStaffModal;
