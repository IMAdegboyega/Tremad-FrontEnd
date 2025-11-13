import React, { useState } from 'react';
// AddStudentModal
// Purpose:
// - Guided, three-step wizard to collect new student data
// - Uses client-side validation per step and a simulated submit
// UX decisions:
// - Stepper with progress underline to signal completion state
// - Backdrop closes the modal when clicking outside
// - Primary action disabled until current step is valid
import { X, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StudentData {
  // Step 1: Student details
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  city: string;
  state: string;
  // Step 2: Academic info
  studentId: string;
  currentGrade: string;
  classSection: string;
  // Step 3: Guardian info
  guardianName: string;
  relationship: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContact: string;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
}) => {
  // currentStep: 1 -> Student details, 2 -> Academic info, 3 -> Guardian info
  const [currentStep, setCurrentStep] = useState(1);
  // showSuccess: toggles between form and success confirmation panel
  const [showSuccess, setShowSuccess] = useState(false);
  // formData: single source of truth for the wizard; reset on close
  const [formData, setFormData] = useState<StudentData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    country: '',
    city: '',
    state: '',
    studentId: '',
    currentGrade: '',
    classSection: '',
    guardianName: '',
    relationship: '',
    guardianPhone: '',
    guardianEmail: '',
    emergencyContact: '',
  });

  // Nigerian states for dropdown
  // Consider loading from an API or a shared constants module for reuse/localization
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
  ];

  // Grade levels
  // Ensure these match backend taxonomy to avoid mismatches on submit
  const gradeLevels = [
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
    'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'
  ];

  // Class sections
  // Could be dynamic per grade; currently a static example
  const classSections = ['A', 'B', 'C', 'D', 'E'];

  // Portal-friendly: don't render content when closed to reduce tree size
  if (!isOpen) return null;

  // Generic setter to update specific form fields
  const handleInputChange = (field: keyof StudentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Per-step validation rules. Keep light and synchronous for responsiveness.
  // For production, consider schema validation (e.g., Zod/Yup) and async checks (e.g., unique IDs).
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.fullName &&
          formData.email &&
          formData.phoneNumber &&
          formData.dateOfBirth &&
          formData.country &&
          formData.city &&
          formData.state
        );
      case 2:
        return !!(
          formData.studentId &&
          formData.currentGrade &&
          formData.classSection
        );
      case 3:
        return !!(
          formData.guardianName &&
          formData.relationship &&
          formData.guardianPhone &&
          formData.guardianEmail
        );
      default:
        return false;
    }
  };

  // Advance to the next step if not on the last step
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Return to the previous step if possible
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Simulate API call
    // Replace with real mutation; include error handling and toasts/snackbars as needed
    setShowSuccess(true);
  };

  // Reset all local state and close the modal
  const handleClose = () => {
    setCurrentStep(1);
    setShowSuccess(false);
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      country: '',
      city: '',
      state: '',
      studentId: '',
      currentGrade: '',
      classSection: '',
      guardianName: '',
      relationship: '',
      guardianPhone: '',
      guardianEmail: '',
      emergencyContact: '',
    });
    onClose();
  };

  // Handle backdrop click: clicking on the semi-transparent background closes the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const totalSteps = 3;

  return (
    <div 
      onClick={handleBackdropClick} 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
    >
      {!showSuccess ? (
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Add new student
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Enter details of new student here
            </p>

            {/* Progress Tabs with top bars */}
            <div className="mt-6">
              <div className="flex justify-between items-start relative w-full">
                {[ 
                  { id: 1, label: '1. Student details' },
                  { id: 2, label: '2. Academic info' },
                  { id: 3, label: '3. Guardian info' },
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
                      {/* Top progress bar */}
                      <div
                        className={`h-[3px] w-full rounded-full mb-2 transition-all duration-300 ${
                          isCompleted || isActive ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />

                      {/* Step label */}
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

          {/* Form Content */}
          <div className="p-6">
            {/* Step 1: Contact and address information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    {/* Dropdown menus below are keyboard-accessible buttons with menu content */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex justify-between items-center">
                          <span className={formData.country ? 'text-gray-900' : 'text-gray-400'}>
                            {formData.country || 'Select country'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => handleInputChange('country', 'Nigeria')}>
                          Nigeria
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange('country', 'Ghana')}>
                          Ghana
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange('country', 'Kenya')}>
                          Kenya
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange('country', 'South Africa')}>
                          South Africa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Select city"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex justify-between items-center">
                        <span className={formData.state ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.state || 'Select state'}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                      {nigerianStates.map(state => (
                        <DropdownMenuItem 
                          key={state}
                          onClick={() => handleInputChange('state', state)}
                        >
                          {state}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* Step 2: Academic details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student admission ID
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="Enter ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current grade
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex justify-between items-center">
                        <span className={formData.currentGrade ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.currentGrade || 'Enter grade'}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                      {gradeLevels.map(grade => (
                        <DropdownMenuItem 
                          key={grade}
                          onClick={() => handleInputChange('currentGrade', grade)}
                        >
                          {grade}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class section
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex justify-between items-center">
                        <span className={formData.classSection ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.classSection ? `${formData.currentGrade} ${formData.classSection}` : 'Select section'}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {classSections.map(section => (
                        <DropdownMenuItem 
                          key={section}
                          onClick={() => handleInputChange('classSection', section)}
                        >
                          {formData.currentGrade} {section}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* Step 3: Guardian and emergency contacts */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guardian name
                  </label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => handleInputChange('guardianName', e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                    placeholder="Enter email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guardian phone
                    </label>
                    <input
                      type="tel"
                      value={formData.guardianPhone}
                      onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guardian email
                    </label>
                    <input
                      type="email"
                      value={formData.guardianEmail}
                      onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                      placeholder="Enter email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Back is hidden (via 'invisible') on step 1 to preserve layout consistency */}
              <button
                onClick={handleBack}
                className={`px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${
                  currentStep === 1 ? 'invisible' : ''
                }`}
                disabled={currentStep === 1}
              >
                Back
              </button>

              <div className="flex gap-3">
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
                    disabled={!isStepValid(currentStep)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isStepValid(currentStep)
                        ? 'text-white bg-green-600 hover:bg-green-700'
                        : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                    }`}
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Success Dialog
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Content */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Successful!
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Student added successfully
          </p>

          {/* Actions */}
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

export default AddStudentModal;