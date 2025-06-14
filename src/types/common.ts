export type ErrorResponse = {
  detail?: string;
  message?: string;
};

export interface VerifyOtpRequest {
  otp: string;
  email: string;
}