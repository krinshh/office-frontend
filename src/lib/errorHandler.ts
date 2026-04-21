export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  status?: number;
}

const ERROR_CODE_MAP: Record<string, string> = {
  'AUTH_LIMIT': 'apiErrors.authLimit',
  'GENERAL_LIMIT': 'apiErrors.rateLimit',
  'OTP_COOLDOWN': 'apiErrors.otpCooldown',
  'ACCOUNT_LOCKED': 'apiErrors.accountLocked',
  'ACCOUNT_DEACTIVATED': 'apiErrors.accountDeactivated',
  'ROLE_DEACTIVATED': 'apiErrors.roleDeactivated',
  'USER_NOT_FOUND': 'apiErrors.userNotFound',
  'EMAIL_NOT_FOUND': 'apiErrors.userNotFound',
  'INVALID_CREDENTIALS': 'apiErrors.invalidCredentials',
  'INVALID_OTP': 'apiErrors.invalidOtp',
  'OTP_EXPIRED': 'apiErrors.otpExpired',
  'INVALID_CAPTCHA': 'apiErrors.invalidCaptcha',
  'CAPTCHA_EXPIRED': 'apiErrors.captchaExpired',
  'EMAIL_SEND_FAILED': 'apiErrors.emailSendFailed',
  'WEAK_PASSWORD': 'apiErrors.weakPassword',
  'UNAUTHORIZED': 'apiErrors.unauthorized',
  'INVALID_TOKEN': 'apiErrors.invalidToken',
  'ACCESS_DENIED': 'apiErrors.accessDenied',
  'EMAIL_ALREADY_EXISTS': 'apiErrors.emailAlreadyExists',
  'MOBILE_ALREADY_EXISTS': 'apiErrors.mobileAlreadyExists',
  'USERNAME_ALREADY_EXISTS': 'apiErrors.usernameAlreadyExists',
  'USER_TYPE_ALREADY_EXISTS': 'apiErrors.userTypeAlreadyExists',
  'LAST_ADMIN_DEACTIVATION': 'apiErrors.lastAdminDeactivation',
  'INVALID_USER_TYPE': 'apiErrors.invalidUserType',
  'OFFICE_REQUIRED': 'apiErrors.officeRequired',
  'INVALID_OFFICE': 'apiErrors.invalidOffice',
  'CTC_LIMIT_EXCEEDED': 'apiErrors.ctcLimitExceeded',
  'BANK_OR_UPI_REQUIRED': 'apiErrors.bankOrUpiRequired',
  'INVALID_IFSC': 'apiErrors.invalidIfsc',
  'INVALID_ROLE_NAME': 'apiErrors.invalidRoleName',
  'DESCRIPTION_REQUIRED': 'apiErrors.descriptionRequired',
  'FILE_TOO_LARGE': 'apiErrors.fileTooLarge',
  'OFFICE_NAME_REQUIRED': 'apiErrors.officeNameRequired',
  'CITY_NAME_REQUIRED': 'apiErrors.cityNameRequired',
  'ADDRESS_REQUIRED': 'apiErrors.addressRequired',
  'LOCATION_REQUIRED': 'apiErrors.locationRequired',
  'INVALID_LATITUDE': 'apiErrors.invalidLatitude',
  'INVALID_LONGITUDE': 'apiErrors.invalidLongitude',
  'INVALID_RADIUS': 'apiErrors.invalidRadius',
  'CCA_NEGATIVE': 'apiErrors.ccaNegative',
  'CCA_LIMIT_EXCEEDED': 'apiErrors.ccaLimitExceeded',
  'OFFICE_NOT_FOUND': 'apiErrors.officeNotFound',
  'FETCH_OFFICES_FAILED': 'apiErrors.fetchOfficesFailed',
  'CREATE_OFFICE_FAILED': 'apiErrors.createOfficeFailed',
  'UPDATE_OFFICE_FAILED': 'apiErrors.updateOfficeFailed',
  'DEACTIVATE_OFFICE_FAILED': 'apiErrors.deactivateOfficeFailed',
  'MARK_IN_FAILED': 'apiErrors.markInFailed',
  'MARK_OUT_FAILED': 'apiErrors.markOutFailed',
  'FETCH_ATTENDANCE_FAILED': 'apiErrors.fetchAttendanceFailed',
  'FETCH_ATTENDANCES_FAILED': 'apiErrors.fetchAttendancesFailed',
  'FETCH_LIVE_PRESENCE_FAILED': 'apiErrors.fetchLivePresenceFailed',
  'FETCH_STATS_FAILED': 'apiErrors.fetchStatsFailed',
  'FETCH_MONTHLY_ATTENDANCE_FAILED': 'apiErrors.fetchMonthlyAttendanceFailed',
  'ACTIVE_SESSION_EXISTS': 'apiErrors.activeSessionExists',
  'NO_ACTIVE_SESSION': 'apiErrors.noActiveSession',
  'CHECKIN_IN_PROGRESS': 'apiErrors.checkinInProgress',
  'CHECKOUT_ALREADY_PROCESSED': 'apiErrors.checkoutAlreadyProcessed',
  'OFFICE_PREMISES_OUT_OF_BOUNDS': 'apiErrors.officePremisesOutOfBounds',
  'NETWORK_SECURITY_ALERT': 'apiErrors.networkSecurityAlert',
  'CHECKIN_TIME_RESTRICTED': 'apiErrors.checkinTimeRestricted',
  'CHECKIN_WINDOW_CLOSED': 'apiErrors.checkinWindowClosed',
  'FETCH_TASKS_FAILED': 'apiErrors.fetchTasksFailed',
  'CREATE_TASK_FAILED': 'apiErrors.createTaskFailed',
  'ASSIGN_TASK_FAILED': 'apiErrors.assignTaskFailed',
  'FETCH_ASSIGNMENTS_FAILED': 'apiErrors.fetchAssignmentsFailed',
  'ASSIGNMENT_NOT_FOUND': 'apiErrors.assignmentNotFound',
  'UPDATE_ASSIGNMENT_FAILED': 'apiErrors.updateAssignmentFailed',
  'INVALID_STATUS_TRANSITION': 'apiErrors.invalidStatusTransition',
  'TASK_NOT_FOUND': 'apiErrors.taskNotFound',
  'USERS_NOT_FOUND': 'apiErrors.usersNotFound',
  'DUE_DATE_REQUIRED': 'apiErrors.dueDateRequired',
  'DUE_DATE_FUTURE': 'apiErrors.dueDateFuture',
  'INVALID_USER_CATEGORY': 'apiErrors.invalidUserCategory',
  'FETCH_SALARY_FAILED': 'apiErrors.fetchSalaryFailed',
  'GENERATE_SALARY_FAILED': 'apiErrors.generateSalaryFailed',
  'SALARY_NOT_FOUND': 'apiErrors.salaryNotFound',
  'DOWNLOAD_CSV_FAILED': 'apiErrors.downloadCSVFailed',
  'GENERATE_PDF_FAILED': 'apiErrors.generatePDFFailed',
  'FETCH_NOTIFICATIONS_FAILED': 'apiErrors.fetchNotificationsFailed',
  'FETCH_UNREAD_COUNT_FAILED': 'apiErrors.fetchUnreadCountFailed',
  'MARK_READ_FAILED': 'apiErrors.markReadFailed',
  'MARK_ALL_READ_FAILED': 'apiErrors.markAllReadFailed',
  'NOTIFICATION_NOT_FOUND': 'apiErrors.notificationNotFound',
  'FETCH_GLOBAL_CONFIG_FAILED': 'apiErrors.fetchGlobalConfigFailed',
  'UPDATE_GLOBAL_CONFIG_FAILED': 'apiErrors.updateGlobalConfigFailed',
  'FETCH_HRA_SLABS_FAILED': 'apiErrors.fetchHRASlabsFailed',
  'INVALID_SALARY_RANGE': 'apiErrors.invalidSalaryRange',
  'INVALID_OFFICE_OR_USER_TYPE': 'apiErrors.invalidOfficeOrUserType',
  'HRA_SLAB_OVERLAP': 'apiErrors.hraSlabOverlap',
  'CREATE_HRA_SLAB_FAILED': 'apiErrors.createHRASlabFailed',
  'UPDATE_HRA_SLAB_FAILED': 'apiErrors.updateHRASlabFailed',
  'DELETE_HRA_SLAB_FAILED': 'apiErrors.deleteHRASlabFailed',
  'HRA_SLAB_NOT_FOUND': 'apiErrors.hraSlabNotFound',
  'FETCH_AUDIT_LOGS_FAILED': 'apiErrors.fetchAuditLogsFailed',
  'FETCH_SETTINGS_FAILED': 'apiErrors.fetchSettingsFailed',
  'UPDATE_SETTINGS_FAILED': 'apiErrors.updateSettingsFailed',
  'RESET_SETTINGS_FAILED': 'apiErrors.resetSettingsFailed',
  'FETCH_DEFAULT_SETTINGS_FAILED': 'apiErrors.fetchDefaultSettingsFailed',
  'INVALID_SETTINGS_SECTION': 'apiErrors.invalidSettingsSection',
  'FETCH_PROFILE_FAILED': 'apiErrors.fetchProfileFailed',
  'FETCH_USER_FAILED': 'apiErrors.fetchUserFailed',
  'UPDATE_USER_FAILED': 'apiErrors.updateUserFailed',
  'UPDATE_PROFILE_FAILED': 'apiErrors.updateProfileFailed',
  'GENERATE_SALARY_SLIP_FAILED': 'apiErrors.generateSalarySlipFailed'
};

export const analyzeError = (error: any, t: any): string => {
  if (!error) return t('apiErrors.unexpected');

  // Handle specific backend error codes
  if (error.code && ERROR_CODE_MAP[error.code]) {
    const translationKey = ERROR_CODE_MAP[error.code];
    // Special handling for time-based messages
    if (error.code === 'ACCOUNT_LOCKED' && error.details?.lockUntil) {
      const timeStr = new Date(error.details.lockUntil).toLocaleTimeString();
      return t(translationKey, { time: timeStr });
    }
    return t(translationKey);
  }

  // Fallback to status codes if no specific code mapping
  if (error.status) {
    const status = error.status;
    if (status === 429) return t('apiErrors.rateLimit', { time: '15 minutes' });
    if (status === 401) return t('apiErrors.unauthorized');
    if (status === 403) return t('apiErrors.forbidden');
    if (status === 404) return t('apiErrors.notFound');
    if (status === 500) return t('apiErrors.serverError');
  }

  // If it's a network error or has a message
  if (error.message) {
      // Basic check for common error strings
      if (error.message.toLowerCase().includes('failed to fetch')) return t('common.networkError');
      return error.message;
  }

  return t('apiErrors.unexpected');
};

export const getValidationError = (error: any, fieldName: string): string | undefined => {
    if (!error || !error.details || !Array.isArray(error.details)) return undefined;
    const fieldError = error.details.find((d: any) => d.path === fieldName || d.field === fieldName);
    return fieldError ? fieldError.message : undefined;
};
