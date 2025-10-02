export interface ProfileData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gradeInfo: string;
  studentId: string;
  status: 'Active' | 'Inactive';
  // Academic Info
  studentAdmissionCID: string;
  currentGrade: string;
  classSection: string;
  admissionDate: string;
  // Guardian Info
  guardianName: string;
  relationship: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContact: string;
  // Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  schoolAnnouncements: boolean;
}

export const intitialProfileData: ProfileData = {
    fullName: 'James white',
    email: 'Jmaeswhite@gmail.com',
    phoneNumber: '4673292',
    dateOfBirth: '15/05/2008',
    address: '123 Lagos Street, Victoria Island',
    city: 'Lekki',
    state: 'Lagos',
    country: 'Nigeria',
    gradeInfo: 'Grade 10 • TR052018',
    studentId: 'TR052018',
    status: 'Active',
    // Academic Info
    studentAdmissionCID: '4673292',
    currentGrade: 'SS1',
    classSection: 'Primary',
    admissionDate: '01/09/2022',
    // Guardian Info
    guardianName: 'Rosalie Monahan',
    relationship: 'Mother',
    guardianPhone: '+2384729200191',
    guardianEmail: 'rosalie.monahan@gmail.com',
    emergencyContact: '+2384729200191',
    // Settings
    emailNotifications: true,
    smsNotifications: true,
    schoolAnnouncements: true
}