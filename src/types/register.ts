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
  platform: 'tiktok' | 'instagram' | 'twitter' | 'youtube' | 'other';
  url: string;
  icon: string;
}

export interface OTPRequestRequest {
  phoneNumber: string;
}

export interface OTPRequestResponse {
  success: boolean;
  message: string;
  expiredAt: string;
}

export interface OTPVerificationRequest {
  phoneNumber: string;
  code: string;
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
}

export interface UploadAssetRequest {
  type: string;
  file: string; // base64 encoded file
  filename: string;
  privacy: string;
  fileGroup: string;
}

export interface UploadAssetResponse {
  statusCode: number;
  message: string;
  body: {
    asset: {
      id: string;
      type: string;
      url: string;
      bucket: string;
      key: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface CreateEventOrganizerRequest {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  social_media_url: string;
  address: string;
  description: string;
}

export interface CreateEventOrganizerResponse {
  success: boolean;
  message: string;
}

export interface CheckAvailabilityRequest {
  email?: string;
  phoneNumber?: string;
}

export interface CheckAvailabilityResponse {
  statusCode: number;
  message: string;
  body: {
    isValid: boolean;
  };
}

export interface ErrorResponse {
  code: number;
  message: string;
  details: Array<{
    '@type': string;
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
  }>;
}
