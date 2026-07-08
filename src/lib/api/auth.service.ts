/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls.
 */

import apiClient, { ApiResponse, setToken, setUser, removeToken } from './client';
import { API } from './endpoints';

// ============================================================================
// TYPES
// ============================================================================

export interface SuperAdminLoginResponse {
  loginToken: string;
  email: string;
  expiresIn: string;
}

export interface SuperAdminVerifyOtpResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    lastLogin: string;
  };
}

export interface StudentLoginResponse {
  token: string;
  user: {
    id: string;
    admissionNumber: string;
    email: string;
    role: string;
    lastLogin: string;
  };
}

export interface PasswordChangeRequiredResponse {
  requiresPasswordChange: boolean;
  userId: string;
  message: string;
}

export interface ForgotPasswordRequestResponse {
  resetToken: string;
  expiresIn: string;
  emailSentTo: string;
}

export interface ForgotPasswordVerifyResponse {
  resetToken: string;
  expiresIn: string;
}

// ============================================================================
// SUPER ADMIN AUTH
// ============================================================================

/**
 * Super Admin Google OAuth Login
 * Sends Google ID token to backend for verification + JWT issuance
 */
export const superAdminGoogleLogin = async (
  credential: string
): Promise<ApiResponse<SuperAdminVerifyOtpResponse>> => {
  const response = await apiClient.post(
    API.AUTH.SUPER_ADMIN.GOOGLE_LOGIN,
    { credential },
    false
  );

  // Store token and user on success
  if (response.success && response.data && 'token' in response.data) {
    setToken(response.data.token);
    setUser(response.data.user);
  }

  return response;
};

/**
 * Super Admin Login - Step 1 (Legacy - email + password)
 * Validates email + password and sends OTP
 */
export const superAdminLogin = async (
  email: string,
  password: string
): Promise<ApiResponse<SuperAdminLoginResponse>> => {
  return apiClient.post(API.AUTH.SUPER_ADMIN.LOGIN, { email, password }, false);
};

/**
 * Super Admin Login - Step 2
 * Verifies OTP and returns JWT token
 */
export const superAdminVerifyOtp = async (
  loginToken: string,
  otp: string
): Promise<ApiResponse<SuperAdminVerifyOtpResponse | PasswordChangeRequiredResponse>> => {
  const response = await apiClient.post(
    API.AUTH.SUPER_ADMIN.VERIFY_OTP,
    { loginToken, otp },
    false
  );

  // If login successful (not password change required), store token
  if (response.success && response.data && 'token' in response.data) {
    setToken(response.data.token);
    setUser(response.data.user);
  }

  return response;
};

/**
 * Super Admin Resend OTP
 */
export const superAdminResendOtp = async (
  loginToken: string
): Promise<ApiResponse<{ expiresIn: string }>> => {
  return apiClient.post(API.AUTH.SUPER_ADMIN.RESEND_OTP, { loginToken }, false);
};

/**
 * Super Admin Change Password
 */
export const superAdminChangePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<{ token: string }>> => {
  const response = await apiClient.post(
    API.AUTH.SUPER_ADMIN.CHANGE_PASSWORD,
    { userId, currentPassword, newPassword },
    false
  );

  if (response.success && response.data?.token) {
    setToken(response.data.token);
  }

  return response;
};

/**
 * Super Admin Logout
 */
export const superAdminLogout = async (): Promise<ApiResponse> => {
  const response = await apiClient.post(API.AUTH.SUPER_ADMIN.LOGOUT);
  removeToken();
  return response;
};

// ============================================================================
// STUDENT AUTH
// ============================================================================

/**
 * Student Login
 */
export const studentLogin = async (
  admissionNumber: string,
  password: string
): Promise<ApiResponse<StudentLoginResponse | PasswordChangeRequiredResponse>> => {
  const response = await apiClient.post(
    API.AUTH.STUDENT.LOGIN,
    { admissionNumber, password },
    false
  );

  // If login successful (not password change required), store token
  if (response.success && response.data && 'token' in response.data) {
    setToken(response.data.token);
    setUser(response.data.user);
  }

  return response;
};

/**
 * Student Change Password (First login or forced change)
 */
export const studentChangePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<{ token: string }>> => {
  const response = await apiClient.post(
    API.AUTH.STUDENT.CHANGE_PASSWORD,
    { userId, currentPassword, newPassword },
    false
  );

  if (response.success && response.data?.token) {
    setToken(response.data.token);
  }

  return response;
};

/**
 * Student Forgot Password - Step 1: Request OTP
 */
export const studentForgotPasswordRequest = async (
  identifier: { admissionNumber?: string; email?: string }
): Promise<ApiResponse<ForgotPasswordRequestResponse>> => {
  return apiClient.post(API.AUTH.STUDENT.FORGOT_PASSWORD.REQUEST, identifier, false);
};

/**
 * Student Forgot Password - Step 2: Verify OTP
 */
export const studentForgotPasswordVerifyOtp = async (
  resetToken: string,
  otp: string
): Promise<ApiResponse<ForgotPasswordVerifyResponse>> => {
  return apiClient.post(
    API.AUTH.STUDENT.FORGOT_PASSWORD.VERIFY_OTP,
    { resetToken, otp },
    false
  );
};

/**
 * Student Forgot Password - Step 3: Reset Password
 */
export const studentForgotPasswordReset = async (
  resetToken: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse> => {
  return apiClient.post(
    API.AUTH.STUDENT.FORGOT_PASSWORD.RESET,
    { resetToken, newPassword, confirmPassword },
    false
  );
};

/**
 * Student Logout
 */
export const studentLogout = async (): Promise<ApiResponse> => {
  const response = await apiClient.post(API.AUTH.STUDENT.LOGOUT);
  removeToken();
  return response;
};

// ============================================================================
// TEACHER AUTH
// ============================================================================

/**
 * Teacher Login
 */
export const teacherLogin = async (
  teacherId: string,
  password: string
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(
    API.AUTH.TEACHER.LOGIN,
    { teacherId, password },
    false
  );

  if (response.success && response.data?.token) {
    setToken(response.data.token);
    setUser(response.data.user);
  }

  return response;
};

/**
 * Teacher Change Password
 *
 * Mirrors studentChangePassword. For first-login, pass an empty currentPassword.
 * On success the backend returns a fresh token + user — store them so the
 * teacher lands authenticated.
 */
export const teacherChangePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(
    API.AUTH.TEACHER.CHANGE_PASSWORD,
    { userId, currentPassword, newPassword },
    false
  );

  if (response.success && response.data?.token) {
    setToken(response.data.token);
    setUser(response.data.user);
  }

  return response;
};

/**
 * Teacher Logout
 */
export const teacherLogout = async (): Promise<ApiResponse> => {
  const response = await apiClient.post(API.AUTH.TEACHER.LOGOUT);
  removeToken();
  return response;
};

// ============================================================================
// EXPORT ALL
// ============================================================================

const authService = {
  // Super Admin
  superAdminGoogleLogin,
  superAdminLogin,
  superAdminVerifyOtp,
  superAdminResendOtp,
  superAdminChangePassword,
  superAdminLogout,
  
  // Student
  studentLogin,
  studentChangePassword,
  studentForgotPasswordRequest,
  studentForgotPasswordVerifyOtp,
  studentForgotPasswordReset,
  studentLogout,
  
  // Teacher
  teacherLogin,
  teacherChangePassword,
  teacherLogout,
};

export default authService;
