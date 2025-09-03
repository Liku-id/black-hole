export interface RegisterRequest {
  organizerName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface RegisterProfileRequest {
  profilePicture?: File;
  socialMedia: SocialMediaLink[];
  address: string;
  aboutOrganizer: string;
  termsAccepted: boolean;
}

export interface SocialMediaLink {
  id: string;
  platform: 'tiktok' | 'instagram' | 'x' | 'youtube' | 'other';
  url: string;
  icon: string;
}

export interface RegisterResponse {
  statusCode: number;
  message: string;
  body: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      phoneNumber: string;
      avatar: string | null;
    };
  };
}

export interface OTPVerificationRequest {
  phoneNumber: string;
  otp: string;
}

export interface OTPVerificationResponse {
  statusCode: number;
  message: string;
  body: {
    verified: boolean;
    user: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      phoneNumber: string;
      avatar: string | null;
    };
  };
}

export interface ResendOTPRequest {
  phoneNumber: string;
}

export interface ResendOTPResponse {
  statusCode: number;
  message: string;
  body: {
    sent: boolean;
    expiresIn: number;
  };
}
