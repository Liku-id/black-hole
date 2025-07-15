export interface BankInfo {
  id: string;
  name: string;
  logo: string;
}

export interface BankInformation {
  id: string;
  bankId: string;
  accountNumber: string;
  accountHolderName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  bank: BankInfo;
}

export interface EventOrganizer {
  id: string;
  bank_information_id: string;
  name: string;
  email: string;
  phone_number: string;
  asset_id: string;
  description: string;
  social_media_url: string;
  address: string;
  pic_title: string;
  ktp_photo_id: string;
  npwp_photo_id: string;
  user_id: string;
  nik: string;
  npwp: string;
  xenplatform_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  bank_information: BankInformation | null;
}

export interface EventOrganizersResponse {
  message: string;
  body: {
    eventOrganizers: EventOrganizer[];
  };
}
