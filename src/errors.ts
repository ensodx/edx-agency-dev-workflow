/**
 * Canonical error codes for the application.
 * Every thrown or returned error must use one of these codes.
 * Never throw ad hoc error strings -- always use this enum.
 */
export enum AppErrorCode {
  CONFIG_INVALID = 'CONFIG_INVALID',
  SERVER_ERROR = 'SERVER_ERROR',
}
