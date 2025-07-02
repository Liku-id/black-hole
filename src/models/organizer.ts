export interface EventOrganizer {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface EventOrganizersResponse {
  statusCode: number;
  message: string;
  body: {
    eventOrganizers: EventOrganizer[];
  };
}

export interface ErrorDetail {
  '@type': string;
  additionalProp1?: string;
  additionalProp2?: string;
  additionalProp3?: string;
}

export interface ErrorResponse {
  code: number;
  message: string;
  details: ErrorDetail[];
}
